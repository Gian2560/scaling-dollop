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
    const sentMessages = [];

    // Obtener la conexión a MongoDB de clientPromise
    const mongoClient = await clientPromise;
    const db = mongoClient.db(process.env.MONGODB_DB);
    const collection = db.collection("clientes");

    // Obtener todos los clientes de MongoDB con los números correspondientes en un solo paso
    const phoneNumbers = campaign.cliente_campanha.map(({ cliente }) => cliente.celular);
    const existingClientesMongo = await collection.find({
      celular: { $in: phoneNumbers },
    }).toArray();

    const mongoClientesMap = new Map(
      existingClientesMongo.map(cliente => [cliente.celular, cliente])
    );

    const promises = campaign.cliente_campanha.map(async ({ cliente }) => {
      if (!cliente || !cliente.celular) {
        console.warn(`⚠ Cliente ${cliente?.nombre || "Desconocido"} no tiene un número válido.`);
        return;
      }

      let celularFormatted = `whatsapp:${cliente.celular.trim()}`;
      const contentSid = campaign.template.template_content_sid;

      let messagePayload = {
        from: twilioWhatsAppNumber,
        to: celularFormatted,
        contentSid,
      };

      // Si la plantilla tiene parámetros dinámicos, los agregamos al payload
      if (campaign.template.parametro) {
        // Aquí puedes agregar múltiples parámetros según el template
        // Ejemplo: Si el template tiene varios parámetros, los puedes agregar de esta manera.
        // Supón que el template tiene 3 parámetros, como nombre, apellido y una fecha
        messagePayload.contentVariables = JSON.stringify({
          1: cliente.nombre,        // Primer parámetro, nombre del cliente
        });
      }

      try {
        // 📌 Enviar el mensaje con Twilio en paralelo
        const message = await client.messages.create(messagePayload);
        console.log(`📨 Mensaje enviado a ${cliente.celular}: ${message.sid}`);

        // Buscar si el cliente ya tiene una conversación en MongoDB
        let clienteMongo = mongoClientesMap.get(cliente.celular);

        if (!clienteMongo) {
          // Si el cliente no existe en MongoDB, crearlo
          const nuevoClienteMongo = {
            id_cliente: `cli_${Date.now()}`,
            nombre: cliente.nombre,
            celular: cliente.celular,
            correo: "",
            conversaciones: [],
          };
          await collection.insertOne(nuevoClienteMongo);
          clienteMongo = nuevoClienteMongo;
          console.log(`✅ Cliente creado en MongoDB con ID: cli_${cliente.id_cliente}`);
        }

        // Realizar actualizaciones en MongoDB de forma eficiente con bulkWrite
        const conversacionId = `conv_${Date.now()}`;
        const nuevaInteraccion = {
          fecha: new Date(),
          mensaje_chatbot: campaign.template.mensaje,
          mensaje_id: message.sid,
        };

        const tieneConversacionActiva = clienteMongo.conversaciones.some(conv => conv.estado === "activa");

        if (tieneConversacionActiva) {
          await collection.updateOne(
            { celular: cliente.celular, "conversaciones.estado": "activa" },
            {
              $push: {
                "conversaciones.$.interacciones": nuevaInteraccion,
              },
              $set: { "conversaciones.$.ultima_interaccion": new Date() },
            }
          );
        } else {
          await collection.updateOne(
            { celular: cliente.celular },
            {
              $push: {
                conversaciones: {
                  conversacion_id: conversacionId,
                  estado: "activa",
                  ultima_interaccion: new Date(),
                  interacciones: [nuevaInteraccion],
                },
              },
            }
          );
        }

        sentMessages.push({ to: cliente.celular, status: "sent", sid: message.sid });
      } catch (error) {
        console.error(`❌ Error al enviar mensaje a ${cliente.celular}:`, error);
        sentMessages.push({ to: cliente.celular, status: "failed", error: error.message });

        // Registra el intento fallido en MongoDB
        const conversacionId = `conv_${Date.now()}`;
        const nuevaInteraccion = {
          fecha: new Date(),
          mensaje_chatbot: campaign.template.mensaje,
          mensaje_id: null,
          estado: "fallido",
          error: error.message,
        };

        await collection.updateOne(
          { celular: cliente.celular },
          {
            $push: {
              conversaciones: {
                conversacion_id: conversacionId,
                estado: "fallido",
                ultima_interaccion: new Date(),
                interacciones: [nuevaInteraccion],
              },
            },
          }
        );
      }
    });

    // Esperar todas las promesas
    await Promise.all(promises);

    return NextResponse.json({ success: true, sentMessages });
  } catch (error) {
    console.error("❌ Error en el envío de mensajes con Twilio:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
