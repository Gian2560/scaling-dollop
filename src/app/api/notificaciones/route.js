import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
let lastChecked = new Date(Date.now() - 5000); // Última revisión

export async function GET() {
  try {
    console.log("🔍 Revisando tabla de notificaciones...");

    const nuevasNotificaciones = await prisma.notificaciones.findMany({
      where: { fecha: { gte: lastChecked } },
      orderBy: { fecha: "asc" },
    });

    lastChecked = new Date(); // Actualiza el último chequeo

    return new Response(JSON.stringify(nuevasNotificaciones), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error consultando la base de datos:", error);
    return new Response(JSON.stringify({ error: "Error obteniendo notificaciones" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
