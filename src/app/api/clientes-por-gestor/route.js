import  prisma  from "@/lib/prisma";
import { NextResponse } from "next/server";

// Maneja solicitudes POST
export async function POST(req) {
  try {
    const body = await req.json();
    const { gestor } = body;

    if (!gestor) {
      return NextResponse.json({ error: "Gestor no proporcionado" }, { status: 400 });
    }

    const clientes = await prisma.cliente.findMany({
      where: { gestor },
      select: {
        cliente_id: true,
        nombre: true,
        celular: true,
        gestor: true,
      },
    });

    return NextResponse.json(clientes);
  } catch (error) {
    console.error("❌ Error en API clientes-por-gestor:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
