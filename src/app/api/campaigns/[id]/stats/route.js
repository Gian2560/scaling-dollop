import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
            documento_identidad: true,
          },
        },
      },
    });

    // Obtener los IDs de mensajes de WhatsApp
    const messageIds = clienteCampanhas
      .map(cc => cc.whatsapp_message_id)
      .filter(id => id != null);

    // Obtener el último estado de cada mensaje desde mensaje_status_event
    const latestStatuses = messageIds.length > 0 ? await prisma.$queryRaw`
      SELECT DISTINCT ON (id_msg) 
        id_msg,
        estado,
        errors_json,
        created_at,
        ts_unix
      FROM mensaje_status_event
      WHERE id_msg = ANY(${messageIds}::text[])
      ORDER BY id_msg, created_at DESC
    ` : [];

    // Crear un mapa de id_msg -> último estado
    const statusMap = new Map();
    latestStatuses.forEach(status => {
      statusMap.set(status.id_msg, status);
    });

    // Contadores de estados
    let sent = 0;
    let delivered = 0;
    let read = 0;
    let failed = 0;

    // Análisis de errores
    const errorCodes = {};
    
    // Detalles de contactabilidad para exportar
    const contactabilityDetails = [];

    // Procesar cada cliente
    clienteCampanhas.forEach(cc => {
      const latestStatus = cc.whatsapp_message_id 
        ? statusMap.get(cc.whatsapp_message_id)
        : null;

      const estado = latestStatus?.estado || 'sent';
      
      // Contar estados
      if (estado === 'sent') sent++;
      else if (estado === 'delivered') delivered++;
      else if (estado === 'read') read++;
      else if (estado === 'failed') failed++;

      // Analizar errores
      let errorCode = null;
      let errorMessage = null;
      if (estado === 'failed' && latestStatus?.errors_json) {
        try {
          const errors = Array.isArray(latestStatus.errors_json) 
            ? latestStatus.errors_json 
            : [latestStatus.errors_json];
          
          if (errors.length > 0) {
            errorCode = errors[0].code;
            errorMessage = errors[0].title || errors[0].message;
            
            if (errorCodes[errorCode]) {
              errorCodes[errorCode].count++;
            } else {
              errorCodes[errorCode] = {
                code: errorCode,
                message: errorMessage,
                count: 1,
              };
            }
          }
        } catch (e) {
          console.error('Error parsing errors_json:', e);
        }
      }

      // Agregar a detalles de contactabilidad
      contactabilityDetails.push({
        nombre: cc.cliente.nombre,
        celular: cc.cliente.celular,
        documento: cc.cliente.documento_identidad,
        estado: estado,
        errorCode: errorCode,
        errorMessage: errorMessage,
        fechaEnvio: latestStatus?.created_at || cc.fecha_asociacion,
      });
    });

    const total = clienteCampanhas.length;

    // Preparar datos de errores para el gráfico
    const errorData = Object.values(errorCodes)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 errores

    // Actividad por día (últimos 7 días)
    const activityByDay = messageIds.length > 0 ? await prisma.$queryRaw`
      SELECT 
        DATE(mse.created_at) as fecha,
        COUNT(CASE WHEN mse.estado = 'sent' THEN 1 END) as enviados,
        COUNT(CASE WHEN mse.estado = 'delivered' THEN 1 END) as entregados,
        COUNT(CASE WHEN mse.estado = 'read' THEN 1 END) as leidos,
        COUNT(CASE WHEN mse.estado = 'failed' THEN 1 END) as fallidos
      FROM mensaje_status_event mse
      WHERE mse.id_msg = ANY(${messageIds}::text[])
        AND mse.created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(mse.created_at)
      ORDER BY fecha DESC
      LIMIT 7
    ` : [];

    // Formatear datos de actividad por día
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const barData = activityByDay.length > 0 ? activityByDay.map(day => ({
      dia: diasSemana[new Date(day.fecha).getDay()],
      enviados: Number(day.enviados),
      entregados: Number(day.entregados),
      leidos: Number(day.leidos),
      fallidos: Number(day.fallidos),
    })).reverse() : [];

    // Mensajes recientes (últimos 10)
    const mensajesRecientes = contactabilityDetails
      .sort((a, b) => new Date(b.fechaEnvio) - new Date(a.fechaEnvio))
      .slice(0, 10)
      .map((msg, idx) => ({
        id: idx + 1,
        destinatario: msg.nombre,
        celular: msg.celular,
        estado: msg.estado,
        fecha: new Date(msg.fechaEnvio).toLocaleString('es-PE'),
        errorCode: msg.errorCode,
        errorMessage: msg.errorMessage,
      }));

    // Calcular datos del funnel (conversión entre estados)
    const funnelData = [
      { 
        name: 'Enviados', 
        value: total,
        percentage: 100,
        color: '#2196f3',
      },
      { 
        name: 'Entregados', 
        value: delivered,
        percentage: total > 0 ? ((delivered / total) * 100).toFixed(1) : 0,
        color: '#4caf50',
      },
      { 
        name: 'Leídos', 
        value: read,
        percentage: total > 0 ? ((read / total) * 100).toFixed(1) : 0,
        color: '#9c27b0',
      },
    ];

    // Calcular tasas de conversión entre etapas
    // Nota: Los mensajes leídos también fueron entregados, así que sumamos ambos
    const totalDelivered = delivered + read;
    
    const conversionRates = {
      sentToDelivered: total > 0 ? ((totalDelivered / total) * 100).toFixed(1) : 0,
      deliveredToRead: totalDelivered > 0 ? ((read / totalDelivered) * 100).toFixed(1) : 0,
      overallConversion: total > 0 ? ((read / total) * 100).toFixed(1) : 0,
    };

    const response = {
      total,
      sent,
      delivered,
      read,
      failed,
      clientesContactados: new Set(clienteCampanhas.map(cc => cc.cliente_id)).size,
      tasaEntrega: total > 0 ? ((delivered + read) / total * 100).toFixed(1) : 0,
      tasaLectura: total > 0 ? (read / total * 100).toFixed(1) : 0,
      tasaFallo: total > 0 ? (failed / total * 100).toFixed(1) : 0,
      funnelData,
      conversionRates,
      errorData,
      barData,
      mensajesRecientes,
      contactabilityDetails, // Para exportar CSV
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener estadísticas de campaña:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
