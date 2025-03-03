import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Asegúrate de que el cliente de Prisma está bien importado

export async function GET() {
  try {
    // 🔹 Obtener todos los templates de la base de datos
    const templates = await prisma.template.findMany({
      select: {
        id: true, // ✅ ID del template
        mensaje: true, // ✅ Mensaje del template
        template_content_sid: true, // ✅ Identificador del template (SSID)
        nombre_template: true,
      },
      orderBy: { created_at: "desc" }, // 🔹 Ordenar por fecha de creación descendente
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("❌ Error al obtener templates:", error);
    return NextResponse.json({ error: "Error al obtener templates" }, { status: 500 });
  }
}
