import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import twilio from "twilio";

// 🔹 Configurar Twilio con variables de entorno
const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

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

    for (const { cliente } of campaign.cliente_campanha) {
      // 🛑 Verificar si el cliente tiene un número válido
      if (!cliente || !cliente.celular) {
        console.warn(`⚠ Cliente ${cliente?.nombre || "Desconocido"} no tiene un número válido.`);
        continue; // Salta al siguiente cliente
      }

      const celularFormatted = `whatsapp:${cliente.celular.trim()}`;
      const contentSid = campaign.template.template_content_sid; // ✅ Obtener el `contentSid` de la BD
      const contentVariables = JSON.stringify({ 1: cliente.nombre }); // ✅ Enviar el nombre como variable

      try {
        const message = await client.messages.create({
          from: twilioWhatsAppNumber,
          to: celularFormatted,
          contentSid, // ✅ Usar la plantilla de Twilio
          contentVariables, // ✅ Variables para la plantilla
        });

        console.log(`📨 Mensaje enviado a ${cliente.celular}: ${message.sid}`);
        sentMessages.push({ to: cliente.celular, status: "sent", sid: message.sid });
      } catch (error) {
        console.error(`❌ Error al enviar mensaje a ${cliente.celular}:`, error);
        sentMessages.push({ to: cliente.celular, status: "failed", error: error.message });
      }
    }

    return NextResponse.json({ success: true, sentMessages });
  } catch (error) {
    console.error("❌ Error en el envío de mensajes con Twilio:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
