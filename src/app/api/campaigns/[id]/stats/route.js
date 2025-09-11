import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const campaignId = parseInt(id);

    if (!campaignId || isNaN(campaignId)) {
      return NextResponse.json({ error: 'ID de campaña inválido' }, { status: 400 });
    }

    // Verificar que la campaña existe
    const campaign = await prisma.campanha.findUnique({
      where: { campanha_id: campaignId },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 });
    }

    // Obtener todas las asociaciones cliente-campaña para esta campaña
    const clienteCampanhas = await prisma.cliente_campanha.findMany({
      where: { campanha_id: campaignId },
      include: {
        cliente: {
          select: {
            cliente_id: true,
            nombre: true,
            celular: true,
            estado: true,
          },
        },
      },
    });

    // Calcular estadísticas basadas en message_status
    const totalEnviados = clienteCampanhas.length;
    const entregados = clienteCampanhas.filter(cc => 
      cc.message_status === 'delivered' || cc.message_status === 'sent'
    ).length;
    const fallidos = clienteCampanhas.filter(cc => 
      cc.message_status === 'failed' || cc.message_status === 'undelivered'
    ).length;
    const respondidos = clienteCampanhas.filter(cc => 
      cc.message_status === 'responded'
    ).length;
    
    // Para "leídos" usaremos una aproximación basada en entregados - fallidos
    const leidos = entregados;
    
    // Clientes únicos contactados
    const clientesContactados = new Set(clienteCampanhas.map(cc => cc.cliente_id)).size;

    // Calcular tasas
    const tasaEntrega = totalEnviados > 0 ? entregados / totalEnviados : 0;
    const tasaLectura = entregados > 0 ? leidos / entregados : 0;
    const tasaRespuesta = leidos > 0 ? respondidos / leidos : 0;

    // Obtener datos para el gráfico por día (últimos 7 días)
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - 7);
    
    const actividadPorDia = await prisma.cliente_campanha.groupBy({
      by: ['last_update'],
      where: {
        campanha_id: campaignId,
        last_update: {
          gte: fechaInicio,
        },
      },
      _count: {
        message_status: true,
      },
    });

    // Obtener mensajes recientes (últimos 10)
    const mensajesRecientes = await prisma.cliente_campanha.findMany({
      where: { campanha_id: campaignId },
      include: {
        cliente: {
          select: {
            nombre: true,
            celular: true,
          },
        },
      },
      orderBy: { last_update: 'desc' },
      take: 10,
    });

    // Mapear estados para el frontend
    const estadoMapping = {
      'sent': 'Enviado',
      'delivered': 'Entregado', 
      'failed': 'Fallido',
      'undelivered': 'Fallido',
      'responded': 'Respondido',
      'queued': 'En cola',
      'sending': 'Enviando',
    };

    const mensajesFormateados = mensajesRecientes.map((msg, index) => ({
      id: index + 1,
      destinatario: msg.cliente.celular,
      estado: estadoMapping[msg.message_status] || 'Desconocido',
      fecha: msg.last_update ? new Date(msg.last_update).toLocaleString('es-PE') : '',
      respuesta: msg.message_status === 'responded' ? 'Sí respondió' : '',
    }));

    // Datos por día de la semana (simulado para demo)
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const hoy = new Date();
    const barData = [];
    
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() - i);
      const diaSemana = diasSemana[fecha.getDay()];
      
      // Simulamos datos basados en la fecha para demo
      const factor = 0.1 + (Math.sin(i) + 1) * 0.3;
      barData.push({
        dia: diaSemana,
        enviados: Math.round(totalEnviados * factor / 7),
        entregados: Math.round(entregados * factor / 7),
        leidos: Math.round(leidos * factor / 7),
        respondidos: Math.round(respondidos * factor / 7),
      });
    }

    const response = {
      totalEnviados,
      entregados,
      leidos,
      fallidos,
      respondidos,
      clientesContactados,
      tasaEntrega,
      tasaLectura,
      tasaRespuesta,
      barData,
      mensajesRecientes: mensajesFormateados,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener estadísticas de campaña:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
