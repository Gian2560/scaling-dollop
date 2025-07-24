import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req, { params }) {
  try {
    const campaignId = parseInt(params.id, 10);
    if (isNaN(campaignId)) {
      return NextResponse.json({ error: "ID de campaña no válido" }, { status: 400 });
    }

    // 🚀 Obtener todos los clientes de la campaña con sus datos básicos
    const clientesCampanha = await prisma.cliente_campanha.findMany({
      where: { campanha_id: campaignId },
      select: {
        cliente_id: true,
        cliente: {
          select: {
            cliente_id: true,
            celular: true,
            nombre: true
          }
        }
      }
    });

    // 🚀 Formatear los datos para el frontend
    const clientes = clientesCampanha.map(item => ({
      cliente_id: item.cliente_id,
      celular: item.cliente.celular,
      nombre: item.cliente.nombre
    }));
    
    console.log(`📋 Campaña ${campaignId} tiene ${clientes.length} clientes`);
    
    return NextResponse.json({ 
      success: true, 
      campaignId,
      totalClientes: clientes.length,
      clientes
    });
  } catch (error) {
    console.error("❌ Error al obtener clientes de campaña:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
