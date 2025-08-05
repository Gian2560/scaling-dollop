import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/clientes/historico-estado/[id]
export async function GET(req, { params }) {
  try {
    // Espera opcional para pruebas (puedes quitar si no lo necesitas)
    // await new Promise(res => setTimeout(res, 300));

    const clienteId = parseInt(params.id, 10); // <-- usa params.id
    if (isNaN(clienteId)) {
      return NextResponse.json({ error: "ID de cliente no válido" }, { status: 400 });
    }

    // Buscar historial de estados del cliente
    const historico = await prisma.historico_estado.findMany({
      where: { cliente_id: clienteId },
      orderBy: { fecha_estado: "asc" },
      select: {
        fecha_estado: true,
        estado: true,
        detalle: true,
      },
    });

    return NextResponse.json({ historico });
  } catch (error) {
    console.error("Error en GET /api/clientes/historico-estado/[id]:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
