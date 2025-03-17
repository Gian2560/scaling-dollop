import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
let lastChecked = new Date(Date.now() - 5000); // Última revisión

export async function GET() {
  return new Response(
    new ReadableStream({
      async start(controller) {
        console.log("✅ Cliente SSE conectado.");

        const interval = setInterval(async () => {
          try {
            console.log("🔍 Revisando tabla de notificaciones...");

            const nuevasNotificaciones = await prisma.notificaciones.findMany({
              where: { fecha: { gte: lastChecked } },
              orderBy: { fecha: "asc" },
            });

            if (nuevasNotificaciones.length > 0) {
              nuevasNotificaciones.forEach((notif) => {
                try {
                  controller.enqueue(`data: ${JSON.stringify({ mensaje: notif.mensaje })}\n\n`);
                } catch (error) {
                  console.error("❌ Error al enviar notificación SSE:", error);
                }
              });

              lastChecked = new Date(); // Actualiza el último chequeo
            }
          } catch (error) {
            console.error("❌ Error consultando la base de datos:", error);
          }
        }, 5000); // Revisar cada 5 segundos

        // Manejo del cierre de conexión
        controller.close = () => {
          clearInterval(interval);
          console.log("❌ Cliente SSE desconectado.");
        };
      },
    }),
    {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    }
  );
}
