import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Obtener histórico de acciones comerciales y observaciones de un cliente
export async function GET(request, context) {
  try {
    const params = await context.params;
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de cliente requerido' },
        { status: 400 }
      );
    }

    console.log(`🔍 Obteniendo histórico para cliente ID: ${id}`);

    // Obtener todas las acciones comerciales del cliente con sus observaciones
    const accionesComerciales = await prisma.accion_comercial.findMany({
      where: {
        cliente_id: parseInt(id)
      },
      select: {
        accion_comercial_id: true,
        estado: true,
        fecha_accion: true,
        nota: true,
        gestor: true,
        // Incluir las observaciones relacionadas con esta acción comercial
        historico_observacion: {
          select: {
            historico_observacion_id: true,
            observacion: true,
            fecha_creacion: true
          },
          orderBy: {
            fecha_creacion: 'desc'
          }
        }
      },
      orderBy: {
        fecha_accion: 'desc' // Más reciente primero
      }
    });

    console.log(`✅ Encontradas ${accionesComerciales.length} acciones comerciales`);

    // Formatear los datos para el frontend
    const historicoFormateado = accionesComerciales.map(accion => ({
      accion_comercial_id: accion.accion_comercial_id,
      estado: accion.estado,
      fecha_accion: accion.fecha_accion,
      nota: accion.nota,
      gestor: accion.gestor,
      observaciones: accion.historico_observacion || []
    }));

    const response = {
      success: true,
      historico: historicoFormateado,
      total: historicoFormateado.length,
      cliente_id: parseInt(id)
    };

    console.log('📤 Histórico enviado:', {
      acciones: historicoFormateado.length,
      totalObservaciones: historicoFormateado.reduce((sum, accion) => sum + (accion.observaciones?.length || 0), 0)
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error en GET /api/clientes/[id]/historico:', error?.message || error);
    console.error('Stack trace:', error?.stack);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: error?.message || 'Error desconocido'
      }, 
      { status: 500 }
    );
  }
}