import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import clientPromise from "@/lib/mongodb"; // Importa la conexión persistente
import twilio from "twilio";

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

export async function POST(req, { params }) {
  try {
    const campaignId = parseInt(params.id, 10);
    if (isNaN(campaignId)) {
      return NextResponse.json({ error: "ID de campaña no válido" }, { status: 400 });
    }

    // Obtener la campaña con su template y clientes asociados
    const campaign = await prisma.campanha.findUnique({
      where: { campanha_id: campaignId },
      include: { template: true, cliente_campanha: { include: { cliente: true } } },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
    }

    if (!campaign.template || !campaign.template.template_content_sid) {
      return NextResponse.json({ error: "La campaña no tiene un template válido" }, { status: 400 });
    }

    const twilioWhatsAppNumber = `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`;

    // Obtener la conexión a MongoDB de clientPromise
    const mongoClient = await clientPromise;
    const db = mongoClient.db(process.env.MONGODB_DB);
    const collection = db.collection("clientes");

    // 🚀 OPTIMIZACIÓN ULTRA RÁPIDA: Procesar TODOS los envíos en paralelo masivo
    console.log(`🔥 Enviando ${campaign.cliente_campanha.length} mensajes en PARALELO MASIVO...`);
    
    // Preparar TODAS las operaciones de envío en paralelo
    const promises = campaign.cliente_campanha.map(async ({ cliente, cliente_campanha_id }) => {
      if (!cliente || !cliente.celular) {
        console.warn(`⚠ Cliente ${cliente?.nombre || "Desconocido"} no tiene un número válido.`);
        return { to: cliente?.celular || "N/A", status: "skipped", error: "No hay número válido" };
      }

      let celularFormatted = `whatsapp:${cliente.celular.trim()}`;
      const contentSid = campaign.template.template_content_sid;

      let messagePayload = {
        from: twilioWhatsAppNumber,
        to: celularFormatted,
        contentSid,
        statusCallback: "https://crmreactivaciones.vercel.app/api/twilio/status"
      };

      // Si la plantilla tiene parámetros dinámicos, los agregamos al payload
      if (campaign.template.parametro) {
        messagePayload.contentVariables = JSON.stringify({
          1: cliente.nombre,
        });
      }

      try {
        // � ENVÍO PARALELO CON TWILIO
        const message = await client.messages.create(messagePayload);
        console.log(`✅ Mensaje enviado a ${cliente.celular}: ${message.sid}`);
        
        // 🚀 ACTUALIZACIONES PARALELAS - MySQL y MongoDB en paralelo
        await Promise.all([
          // MySQL update
          prisma.cliente_campanha.update({
            where: { cliente_campanha_id },
            data: {
              message_sid: message.sid,
              message_status: message.status,
              last_update: new Date(),
            },
          }),
          
          // MongoDB update - ULTRA OPTIMIZADO
          collection.updateOne(
            { celular: cliente.celular },
            {
              $setOnInsert: {
                id_cliente: `cli_${cliente.cliente_id}`,
                nombre: cliente.nombre,
                celular: cliente.celular,
                correo: "",
                conversaciones: []
              },
              $push: {
                conversaciones: {
                  conversacion_id: `conv_${Date.now()}_${cliente.cliente_id}`,
                  estado: "activa",
                  ultima_interaccion: new Date(),
                  interacciones: [{
                    fecha: new Date(),
                    mensaje_chatbot: campaign.template.mensaje,
                    mensaje_id: message.sid,
                  }],
                }
              }
            },
            { upsert: true }
          )
        ]);

        return { to: cliente.celular, status: "sent", sid: message.sid };
      } catch (error) {
        console.error(`❌ Error al enviar mensaje a ${cliente.celular}:`, error);
        
        // 🚀 ERROR HANDLING RÁPIDO - Solo registrar en MongoDB sin bloquear
        collection.updateOne(
          { celular: cliente.celular },
          {
            $setOnInsert: {
              id_cliente: `cli_${cliente.cliente_id}`,
              nombre: cliente.nombre,
              celular: cliente.celular,
              correo: "",
              conversaciones: []
            },
            $push: {
              conversaciones: {
                conversacion_id: `conv_${Date.now()}_${cliente.cliente_id}`,
                estado: "fallido",
                ultima_interaccion: new Date(),
                interacciones: [{
                  fecha: new Date(),
                  mensaje_chatbot: campaign.template.mensaje,
                  mensaje_id: null,
                  estado: "fallido",
                  error: error.message,
                }],
              }
            }
          },
          { upsert: true }
        ).catch(mongoError => {
          console.error(`⚠️ Error en MongoDB para ${cliente.celular}:`, mongoError);
        });

        return { to: cliente.celular, status: "failed", error: error.message };
      }
    });

    // 🚀 ESPERAR TODOS LOS ENVÍOS EN PARALELO MASIVO
    console.log(`⚡ Procesando ${promises.length} envíos en paralelo...`);
    const sentMessages = await Promise.all(promises);
    
    const exitosos = sentMessages.filter(msg => msg.status === "sent").length;
    const fallidos = sentMessages.filter(msg => msg.status === "failed").length;
    
    console.log(`✅ ENVÍO MASIVO COMPLETADO: ${exitosos} exitosos, ${fallidos} fallidos`);

    return NextResponse.json({ success: true, sentMessages });
  } catch (error) {
    console.error("❌ Error en el envío de mensajes con Twilio:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
