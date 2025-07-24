import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    // Twilio envía datos como application/x-www-form-urlencoded
    const formData = await req.formData();

    const MessageSid = formData.get("MessageSid");
    const MessageStatus = formData.get("MessageStatus");
    const ErrorCode = formData.get("ErrorCode");

    if (!MessageSid || !MessageStatus) {
      return NextResponse.json({ error: "Missing MessageSid or MessageStatus" }, { status: 400 });
    }

    // Actualizar estado en Prisma
    await prisma.cliente_campanha.updateMany({
      where: { message_sid: MessageSid },
      data: {
        message_status: MessageStatus, // Enum en tu schema
        error_code: ErrorCode ? parseInt(ErrorCode) : null,
        last_update: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Callback Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
