import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/clientes/historico-estado/:clienteId
export async function GET(req, { params }) {
  try {
    const clienteId = parseInt(params.clienteId, 10);
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
    console.error("Error en GET /api/clientes/historico-estado:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
