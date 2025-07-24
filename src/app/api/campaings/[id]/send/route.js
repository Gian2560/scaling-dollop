import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import clientPromise from "@/lib/mongodb"; // Importa la conexión persistente
import twilio from "twilio";

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

export async function POST(req, { params }) {
  console.log("🚀 === INICIO DE FUNCIÓN SEND ===");
  
  try {
    const campaignId = parseInt(params.id, 10);
    if (isNaN(campaignId)) {
      return NextResponse.json({ error: "ID de campaña no válido" }, { status: 400 });
    }

    // 🚀 NUEVO: Recibir lote de clientes desde el frontend
    const body = await req.json();
    const { clientesLote } = body; // Array de objetos cliente {cliente_id, celular, nombre}

    if (!clientesLote || !Array.isArray(clientesLote) || clientesLote.length === 0) {
      return NextResponse.json({ error: "Se requiere un array de clientes" }, { status: 400 });
    }

    console.log(`📦 Procesando lote de ${clientesLote.length} clientes para campaña ${campaignId}`);

    // Obtener la campaña con su template
    const campaign = await prisma.campanha.findUnique({
      where: { campanha_id: campaignId },
      include: { template: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
    }

    if (!campaign.template || !campaign.template.template_content_sid) {
      return NextResponse.json({ error: "La campaña no tiene un template válido" }, { status: 400 });
    }

    const twilioWhatsAppNumber = `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`;

    // Obtener la conexión a MongoDB
    const mongoClient = await clientPromise;
    const db = mongoClient.db(process.env.MONGODB_DB);
    
    // 🚀 PROCESAR EL LOTE EN PARALELO
    const sendMessagePromises = clientesLote.map(async (cliente) => {
      if (!cliente || !cliente.celular) {
        console.warn(`⚠ Cliente ${cliente?.nombre || "Desconocido"} no tiene un número válido.`);
        return { to: cliente?.celular || "N/A", status: "skipped", error: "No hay número válido" };
      }

      const celularFormatted = `whatsapp:${cliente.celular.trim()}`;
      const contentSid = campaign.template.template_content_sid;
      const mensajeChatbot = campaign.template.mensaje;
      
      const messagePayload = {
        from: twilioWhatsAppNumber,
        to: celularFormatted,
        contentSid,
        statusCallback: "https://crmreactivaciones.vercel.app/api/twilio/status"
      };

      if (campaign.template.parametro) {
        messagePayload.contentVariables = JSON.stringify({
          1: cliente.nombre,
        });
      }

      try {
        // � Enviar el mensaje con Twilio
        const message = await client.messages.create(messagePayload);
        console.log(`✅ Mensaje enviado a ${cliente.celular}: ${message.sid}`);

        // 🚀 ACTUALIZACIONES PARALELAS - MySQL y MongoDB
        const updatePromises = [
          // Actualizar estado en MySQL
          prisma.cliente_campanha.updateMany({
            where: { 
              campanha_id: campaignId,
              cliente_id: cliente.cliente_id 
            },
            data: {
              message_sid: message.sid,
              message_status: message.status,
              last_update: new Date(),
            },
          }),
          // Crear/actualizar en MongoDB
          db.collection("clientes").updateOne(
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
                    mensaje_chatbot: mensajeChatbot,
                    mensaje_id: message.sid,
                  }],
                }
              }
            },
            { upsert: true }
          )
        ];

        await Promise.all(updatePromises);
        return { to: cliente.celular, status: "sent", sid: message.sid };
        
      } catch (error) {
        console.error(`❌ Error al enviar mensaje a ${cliente.celular}:`, error);

        // Registrar el fallo en MySQL
        await prisma.cliente_campanha.updateMany({
          where: { 
            campanha_id: campaignId,
            cliente_id: cliente.cliente_id 
          },
          data: {
            message_status: "failed",
            last_update: new Date(),
          },
        }).catch(() => {}); // Silent fail

        return { 
          to: cliente.celular, 
          status: "failed", 
          error: error.message
        };
      }
    });

    // 🚀 ENVIAR TODOS LOS MENSAJES DEL LOTE EN PARALELO
    const results = await Promise.allSettled(sendMessagePromises);
    const sentMessages = results.map((res, index) => {
      if (res.status === "fulfilled") {
        return res.value;
      } else {
        return { to: `Cliente ${index}`, status: "error", error: res.reason.message };
      }
    });
    
    const exitosos = sentMessages.filter(msg => msg.status === "sent").length;
    const fallidos = sentMessages.filter(msg => msg.status === "failed" || msg.status === "error").length;
    const omitidos = sentMessages.filter(msg => msg.status === "skipped").length;
    
    console.log(`✅ LOTE COMPLETADO: ${exitosos} enviados, ${fallidos} fallidos, ${omitidos} omitidos`);
    
    return NextResponse.json({ 
      success: true, 
      loteSize: clientesLote.length,
      exitosos,
      fallidos,
      omitidos,
      sentMessages 
    });
  } catch (error) {
    console.error("❌ Error en el envío de mensajes:", error);
    return NextResponse.json({ error: "Error interno del servidor: " + error.message }, { status: 500 });
  }
}
