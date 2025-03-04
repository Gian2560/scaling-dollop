import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { MongoClient } from "mongodb";
import twilio from "twilio";

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const mongoClient = new MongoClient(process.env.DATABASE_URL_MONGODB);

export async function POST(req, { params }) {
  try {
    const campaignId = parseInt(params.id, 10);
    if (isNaN(campaignId)) {
      return NextResponse.json({ error: "ID de campaña no válido" }, { status: 400 });
    }

    // 🔹 Obtener la campaña con su template y clientes asociados
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

    // 🔹 Conectar a MongoDB
    await mongoClient.connect();
    const db = mongoClient.db(process.env.MONGODB_DB);
    const collection = db.collection("clientes");

    for (const { cliente } of campaign.cliente_campanha) {
      if (!cliente || !cliente.celular) {
        console.warn(`⚠ Cliente ${cliente?.nombre || "Desconocido"} no tiene un número válido.`);
        continue;
      }

      const celularFormatted = `whatsapp:${cliente.celular.trim()}`;
      const contentSid = campaign.template.template_content_sid;

      // 🔹 Construir mensaje para Twilio
      let messagePayload = {
        from: twilioWhatsAppNumber,
        to: celularFormatted,
        contentSid,
      };

      if (campaign.template.parametro) {
        messagePayload.contentVariables = JSON.stringify({
          1: cliente.nombre, // Variables dinámicas si el template lo requiere
        });
      }

      try {
        // 📌 Enviar el mensaje con Twilio
        const message = await client.messages.create(messagePayload);
        console.log(`📨 Mensaje enviado a ${cliente.celular}: ${message.sid}`);

        // 📌 Buscar si el cliente ya tiene una conversación en MongoDB
        const clienteMongo = await collection.findOne({ celular: cliente.celular });

        if (clienteMongo) {
          // 🔹 Si existe, actualizar la conversación activa
          await collection.updateOne(
            { celular: cliente.celular, "conversaciones.estado": "activa" },
            {
              $push: {
                "conversaciones.$.interacciones": {
                  fecha: new Date(),
                  mensaje_chatbot: campaign.template.mensaje,
                  mensaje_id: message.sid,
                },
              },
              $set: { "conversaciones.$.ultima_interaccion": new Date() },
            }
          );
        } else {
          // 🔹 Si no existe, crear una nueva conversación
          await collection.updateOne(
            { celular: cliente.celular },
            {
              $push: {
                conversaciones: {
                  conversacion_id: `conv_${Date.now()}`,
                  estado: "activa",
                  ultima_interaccion: new Date(),
                  interacciones: [
                    {
                      fecha: new Date(),
                      mensaje_chatbot: campaign.template.mensaje,
                      mensaje_id: message.sid,
                    },
                  ],
                },
              },
            },
            { upsert: true }
          );
        }

        sentMessages.push({ to: cliente.celular, status: "sent", sid: message.sid });
      } catch (error) {
        console.error(`❌ Error al enviar mensaje a ${cliente.celular}:`, error);
        sentMessages.push({ to: cliente.celular, status: "failed", error: error.message });

        // 📌 También registrar el intento fallido en MongoDB
        await collection.updateOne(
          { celular: cliente.celular },
          {
            $push: {
              conversaciones: {
                conversacion_id: `conv_${Date.now()}`,
                estado: "fallido",
                ultima_interaccion: new Date(),
                interacciones: [
                  {
                    fecha: new Date(),
                    mensaje_chatbot: campaign.template.mensaje,
                    mensaje_id: null,
                    estado: "fallido",
                    error: error.message,
                  },
                ],
              },
            },
          },
          { upsert: true }
        );
      }
    }

    return NextResponse.json({ success: true, sentMessages });
  } catch (error) {
    console.error("❌ Error en el envío de mensajes con Twilio:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  } finally {
    await mongoClient.close(); // Cerrar conexión con MongoDB
  }
}
