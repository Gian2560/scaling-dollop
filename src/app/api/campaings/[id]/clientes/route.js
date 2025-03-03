import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req, { params }) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    const total = await prisma.cliente_campanha.count({
      where: { campanha_id: parseInt(params.id) },
    });

    const clientes = await prisma.cliente_campanha.findMany({
      where: { campanha_id: parseInt(params.id) },
      include: { cliente: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return NextResponse.json({
      clientes: clientes.map((c) => ({
        id: c.cliente.cliente_id, // ✅ Asegura que cada cliente tenga un `id`
        ...c.cliente, // 🔹 Copia los demás atributos del cliente
      })),
      total,
    });
  } catch (error) {
    console.error("❌ Error en la API de clientes de campaña:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 🔹 Agregar cliente a campaña
export async function POST(req, { params }) {
  try {
    const { cliente_id } = await req.json();
    await prisma.cliente_campanha.create({
      data: { campanha_id: parseInt(params.id), cliente_id },
    });

    return NextResponse.json({ message: "Cliente agregado" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 🔹 Eliminar cliente de campaña
export async function DELETE(req, { params }) {
  try {
    const { cliente_id } = await req.json();
    await prisma.cliente_campanha.deleteMany({
      where: { campanha_id: parseInt(params.id), cliente_id },
    });

    return NextResponse.json({ message: "Cliente eliminado" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
