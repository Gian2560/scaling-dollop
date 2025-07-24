import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req, { params }) {
  try {
    const campaignId = parseInt(params.id, 10);
    if (isNaN(campaignId)) {
      return NextResponse.json({ error: "ID de campaña no válido" }, { status: 400 });
    }

    // 🚀 Obtener solo los IDs de clientes de la campaña
    const clienteIds = await prisma.cliente_campanha.findMany({
      where: { campanha_id: campaignId },
      select: {
        cliente_id: true
      }
    });

    const ids = clienteIds.map(item => item.cliente_id);
    
    console.log(`📋 Campaña ${campaignId} tiene ${ids.length} clientes`);
    
    return NextResponse.json({ 
      success: true, 
      campaignId,
      totalClientes: ids.length,
      clienteIds: ids 
    });
  } catch (error) {
    console.error("❌ Error al obtener IDs de clientes:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
