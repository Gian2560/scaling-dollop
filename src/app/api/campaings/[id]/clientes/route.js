import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req, { params }) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    // Obtener la campaña con detalles
    const campanha = await prisma.campanha.findUnique({
      where: { campanha_id: Number(params.id) },
      include: {
        template: { select: { nombre_template: true, mensaje: true } }, // Template
      },
    });

    if (!campanha) {
      return new Response(JSON.stringify({ error: "Campaña no encontrada" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Contar total de clientes en la campaña
    const totalClientes = await prisma.cliente_campanha.count({
      where: { campanha_id: parseInt(params.id) },
    });

    // Obtener clientes paginados
    const clientes = await prisma.cliente_campanha.findMany({
      where: { campanha_id: parseInt(params.id) },
      include: { cliente: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // Formatear la respuesta
    const response = {
      campanha_id: campanha.campanha_id,
      nombre_campanha: campanha.nombre_campanha,
      descripcion: campanha.descripcion || "Sin descripción",
      fecha_creacion: campanha.fecha_creacion,
      fecha_fin: campanha.fecha_fin,
      estado_campanha: campanha.estado_campanha || "Desconocido",
      mensaje_cliente: campanha.mensaje_cliente || "No definido",
      num_clientes: totalClientes, // ✅ Total de clientes
      template: campanha.template
        ? {
            nombre_template: campanha.template.nombre_template,
            mensaje: campanha.template.mensaje,
          }
        : { nombre_template: "No asignado", mensaje: "No definido" },
      clientes: clientes.map((c) => ({
        id: c.cliente.cliente_id, // ✅ ID único del cliente
        nombre: c.cliente.nombre,
        celular: c.cliente.celular,
        email: c.cliente.email,
        estado: c.cliente.estado,
        gestor: c.cliente.gestor,
        fecha_ultima_interaccion: c.cliente.fecha_ultima_interaccion,
      })),
      pagination: {
        total: totalClientes,
        page,
        pageSize,
        totalPages: Math.ceil(totalClientes / pageSize),
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error en la API de campañas:", error);
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
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




