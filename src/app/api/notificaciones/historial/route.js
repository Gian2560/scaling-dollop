import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const notificaciones = await prisma.notificaciones.findMany({
      orderBy: { fecha: "desc" },
    });

    return new Response(JSON.stringify(notificaciones), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error obteniendo notificaciones" }), { status: 500 });
  }
}
