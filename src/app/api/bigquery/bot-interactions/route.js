import { NextResponse } from 'next/server';
import bq from '@/lib/bigquery';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Función para convertir fecha de BigQuery a string
function convertirFecha(fecha) {
  if (!fecha) return null;
  
  try {
    // Si ya es string, devolverla como está
    if (typeof fecha === 'string') {
      return fecha;
    }
    
    // Si es un objeto Date de BigQuery
    if (fecha.value && typeof fecha.value === 'string') {
      return fecha.value;
    }
    
    // Si es un objeto con propiedades de fecha
    if (typeof fecha === 'object') {
      const dateObj = new Date(fecha);
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toISOString().split('T')[0] + ' ' + dateObj.toTimeString().split(' ')[0];
      }
    }
    
    // Intento directo de conversión
    const dateObj = new Date(fecha);
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toISOString().split('T')[0] + ' ' + dateObj.toTimeString().split(' ')[0];
    }
    
    return fecha.toString();
  } catch (error) {
    console.error('Error convirtiendo fecha:', error, fecha);
    return fecha ? fecha.toString() : null;
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');
    const estados = searchParams.getAll('estados');

    console.log('Parámetros recibidos:', {
      fechaInicio,
      fechaFin,
      estados
    });

    // PASO 1: Buscar clientes con esos estados en PostgreSQL
    let documentosClientes = [];
    
    if (estados.length > 0) {
      console.log('🔍 Buscando clientes en PostgreSQL con estados:', estados);
      
      const clientesConEstados = await prisma.cliente.findMany({
        where: {
          estado: {
            in: estados
          },
          documento_identidad: {
            not: null
          }
        },
        select: {
          documento_identidad: true,
          nombre: true,
          apellido: true
        }
      });

      // Limpiar documentos de PostgreSQL (quitar comas y espacios)
      documentosClientes = clientesConEstados.map(cliente => 
        cliente.documento_identidad.replace(/,/g, '').trim()
      );
      console.log(`📊 Encontrados ${documentosClientes.length} clientes con estados requeridos`);
    }

    if (documentosClientes.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        stats: {
          totalRegistros: 0,
          documentosUnicos: 0,
          codigosUnicos: 0
        },
        message: 'No se encontraron clientes con los estados especificados'
      });
    }

    // PASO 2: Buscar en BigQuery usando los documentos encontrados
    const params = {};
    let where_clauses = [];

    // Agregar filtros de fecha
    where_clauses.push('DATE(Fecha_de_Operacion) BETWEEN @fechaInicio AND @fechaFin');
    params.fechaInicio = fechaInicio || '2024-01-01';
    params.fechaFin = fechaFin || new Date().toISOString().split('T')[0];

    // Agregar filtro de documentos (de PostgreSQL) - limpiar documentos para comparación
    where_clauses.push('TRIM(REPLACE(Documento, ",", "")) IN UNNEST(@documentos)');
    params.documentos = documentosClientes; // Ya están limpios desde PostgreSQL

    const where_sql = where_clauses.join(' AND ');

    // Query en BigQuery filtrada por documentos de PostgreSQL
    const query = `
      SELECT DISTINCT
        Documento as documento_identidad,
        Codigo as codigo_asociado,
        Fecha_de_Operacion as fecha_operacion
      FROM \`peak-emitter-350713.FR_Reingresos_output.BD_ReingresosAcumulados\`
      WHERE ${where_sql}
      ORDER BY Fecha_de_Operacion DESC
      LIMIT 1000
    `;

    console.log('🚀 Ejecutando query en BigQuery para documentos encontrados');
    console.log('Query:', query);
    console.log('Parámetros:', { ...params, documentos: `[${params.documentos.length} documentos]` });

    const [rows] = await bq.query({
      query: query,
      params: params,
      parameterMode: 'named'
    });

    console.log(`✅ BigQuery retornó ${rows.length} registros`);

    // Crear mapa de nombres desde PostgreSQL
    let nombresMap = new Map();
    if (estados.length > 0) {
      const clientesConEstados = await prisma.cliente.findMany({
        where: {
          estado: {
            in: estados
          },
          documento_identidad: {
            not: null
          }
        },
        select: {
          documento_identidad: true,
          nombre: true,
          apellido: true
        }
      });
      
      clientesConEstados.forEach(cliente => {
        // Limpiar documento también para el mapa de nombres
        const documentoLimpio = cliente.documento_identidad.replace(/,/g, '').trim();
        nombresMap.set(documentoLimpio, `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim());
      });
    }

    // Procesar datos combinando BigQuery con nombres de PostgreSQL
    const processedData = rows.map((row, index) => {
      // Limpiar documento de BigQuery para hacer match con el mapa de nombres
      const documentoLimpio = row.documento_identidad ? row.documento_identidad.replace(/,/g, '').trim() : '';
      
      // Convertir fecha a string legible
      const fechaConvertida = convertirFecha(row.fecha_operacion);
      console.log('Fecha original:', row.fecha_operacion, 'Fecha convertida:', fechaConvertida);
      
      return {
        id: `${documentoLimpio}_${index}`,
        documento_identidad: documentoLimpio,
        nombre_completo: nombresMap.get(documentoLimpio) || 'Sin nombre',
        codigo_asociado: row.codigo_asociado || '',
        fecha_operacion: fechaConvertida
      };
    });

    // Estadísticas simples
    const stats = {
      totalRegistros: processedData.length,
      documentosUnicos: new Set(processedData.map(item => item.documento_identidad)).size,
      codigosUnicos: new Set(processedData.map(item => item.codigo_asociado)).size
    };

    return NextResponse.json({
      success: true,
      data: processedData,
      stats,
      message: `Se encontraron ${processedData.length} registros de ${documentosClientes.length} clientes con estados bot`
    });

  } catch (error) {
    console.error('Error en bot-interactions API:', error);
    return NextResponse.json({
      success: false,
      error: `Error al obtener datos: ${error.message}`,
      data: []
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}