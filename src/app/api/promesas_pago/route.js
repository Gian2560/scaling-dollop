import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Asegúrate de que estás importando correctamente tu cliente Prisma

export async function GET() {
  try {
    // 🔹 Obtener todas las citas que representan promesas de pago sin importar el estado
    const promesas = await prisma.cita.findMany({
      include: {
        cliente: {
          select: {
            nombre: true,
            celular: true,
          },
        },
      },
      orderBy: {
        fecha_cita: "asc",
      },
    });
    console.log("preomsas",promesas);
    // 🔹 Formatear los datos para el calendario
    const formattedPromesas = promesas.map((promesa) => ({
      title: `${promesa.cliente.nombre} (${promesa.cliente.celular})`,
      start: new Date(promesa.fecha_cita),
      end: new Date(new Date(promesa.fecha_cita).getTime() + 30 * 60 * 1000), // Duración de 30 min
      backgroundColor: "#4CAF50", // Color por defecto (verde)
      extendedProps: {
        celular: promesa.cliente.celular,
      },
    }));

    console.log("✅ Promesas de pago obtenidas:", formattedPromesas.length);

    return NextResponse.json(formattedPromesas);
  } catch (error) {
    console.error("❌ Error al obtener promesas de pago:", error);

    return NextResponse.json(
      { error: "Error al obtener promesas de pago", message: error.message || "Error desconocido" },
      { status: 500 }
    );
  }
}
