import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapeo de estados del frontend a estados exactos de la base de datos
const estadosMapping = {
  'Comunicacion inmediata': ['Comunicacion inmediata'],
  'Negociacion de pago': ['Negociacion de pago'],
  'Gestion de contrato': ['Gestion de contrato'],
  'duda': ['Duda agresiva no resuelta', 'Duda no resuelta','Seguimiento - Duda no resuelta',]
};

// GET - Obtener clientes filtrados por estado
export async function GET(request) {
  try {
    console.log('🚀 Iniciando GET /api/task');
    
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '25');
    const search = searchParams.get('search') || '';

    console.log('📋 Parámetros recibidos:', { estado, page, limit, search });

    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59, 999);
    
    console.log('📅 Filtros de fecha:', {
      mesActual: ahora.getMonth() + 1,
      añoActual: ahora.getFullYear(),
      inicioMes: inicioMes.toISOString(),
      finMes: finMes.toISOString()
    });

    // ✅ PRIMERO: Verificar si hay clientes con ese estado
    let estadosDB = [];
    if (estado) {
      estadosDB = estadosMapping[estado] || [estado];
      console.log('🎯 Estados a buscar:', estadosDB);
      
      const clientesConEstado = await prisma.cliente.count({
        where: { estado: { in: estadosDB } }
      });
      console.log(`📊 Total de clientes con estado "${estado}": ${clientesConEstado}`);
    }

    // ✅ SEGUNDO: Verificar si hay clientes con fecha_pago del mes actual
    const clientesConFechaMes = await prisma.cliente.count({
      where: {
        contrato: {
          isNot: null,
          is: {
            fecha_pago: {
              gte: inicioMes,
              lte: finMes
            }
          }
        }
      }
    });
    console.log(`📊 Total de clientes con fecha_pago del mes actual: ${clientesConFechaMes}`);

    // ✅ CONSTRUIR FILTRO CORRECTO
    let whereClause = {};

    // Filtrar por estado del cliente si se especifica
    if (estado) {
      whereClause.estado = { in: estadosDB };
    }

    // Y debe tener contrato con fecha_pago del mes actual
    whereClause.contrato = {
      isNot: null,
      is: {
        fecha_pago: {
          gte: inicioMes,
          lte: finMes
        }
      }
    };

    // Filtrar por búsqueda si se especifica
    if (search) {
      whereClause.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { apellido: { contains: search, mode: 'insensitive' } },
        { celular: { contains: search, mode: 'insensitive' } },
        { documento_identidad: { contains: search, mode: 'insensitive' } }
      ];
      console.log('🔍 Aplicando búsqueda:', search);
    }

    console.log('🔧 Cláusula WHERE inicial:', JSON.stringify(whereClause, null, 2));

    // ✅ TERCERO: Obtener algunos clientes con ese estado para debug (SIN filtro de fecha)
    if (estado) {
      console.log('\n🔍 DEBUG: Obteniendo clientes con estado para verificar fechas...');
      
      const clientesDebug = await prisma.cliente.findMany({
        where: {
          estado: { in: estadosDB }
        },
        include: {
          contrato: true
        },
        take: 5 // Solo 5 para debug
      });

      console.log(`📋 Encontrados ${clientesDebug.length} clientes con estado "${estado}" (sin filtro de fecha):`);
      
      clientesDebug.forEach((cliente, index) => {
        console.log(`\n--- DEBUG CLIENTE ${index + 1} ---`);
        console.log(`ID: ${cliente.cliente_id}`);
        console.log(`Nombre: ${cliente.nombre} ${cliente.apellido || ''}`);
        console.log(`Estado: ${cliente.estado}`);
        
        if (cliente.contrato) {
          const fechaContrato = new Date(cliente.contrato.fecha_pago);
          const esMesActual = fechaContrato >= inicioMes && fechaContrato <= finMes;
          
          console.log(`Contrato ID: ${cliente.contrato.contrato_id}`);
          console.log(`Fecha_pago (raw): ${cliente.contrato.fecha_pago}`);
          console.log(`Fecha_pago (parsed): ${fechaContrato.toISOString()}`);
          console.log(`Rango inicio: ${inicioMes.toISOString()}`);
          console.log(`Rango fin: ${finMes.toISOString()}`);
          console.log(`¿Está en el rango?: ${esMesActual}`);
          
          // Comparación detallada
          console.log(`Comparaciones:`);
          console.log(`  fecha >= inicio: ${fechaContrato >= inicioMes}`);
          console.log(`  fecha <= fin: ${fechaContrato <= finMes}`);
          console.log(`  Mes de fecha: ${fechaContrato.getMonth() + 1}/${fechaContrato.getFullYear()}`);
          console.log(`  Mes actual: ${ahora.getMonth() + 1}/${ahora.getFullYear()}`);
        } else {
          console.log('❌ Sin contrato');
        }
        console.log('------------------------');
      });
    }

    // ✅ CUARTO: Aplicar filtro combinado inicial (sin filtro de acción comercial aún)
    const clientesCandidatos = await prisma.cliente.findMany({
      where: whereClause,
      select: {
        cliente_id: true,
        nombre: true,
        apellido: true,
        celular: true,
        documento_identidad: true,
        estado: true,
        gestor: true,
        fecha_creacion: true,
        score: true,
        contrato: {
          select: {
            contrato_id: true,
            estado: true,
            fecha_pago: true
          }
        },
        accion_comercial: {
          select: {
            fecha_accion: true
          },
          orderBy: {
            fecha_accion: 'desc'
          },
          take: 1 // Solo la más reciente
        }
      },
      orderBy: { fecha_creacion: 'desc' }
    });

    console.log(`🔍 Clientes candidatos encontrados: ${clientesCandidatos.length}`);

    // ✅ QUINTO: Filtrar clientes donde fecha_pago > fecha_accion más reciente
    const clientesFiltrados = clientesCandidatos.filter(cliente => {
      if (!cliente.contrato || !cliente.contrato.fecha_pago) {
        console.log(`⚠️ Cliente ${cliente.cliente_id} sin contrato o fecha_pago`);
        return false;
      }

      const fechaUltimoEstado = new Date(cliente.contrato.fecha_pago);
      
      // Si no tiene acciones comerciales, incluir el cliente
      if (!cliente.accion_comercial || cliente.accion_comercial.length === 0) {
        console.log(`✅ Cliente ${cliente.cliente_id} (${cliente.nombre}): Sin acciones comerciales - INCLUIDO`);
        return true;
      }

      const fechaUltimaAccion = new Date(cliente.accion_comercial[0].fecha_accion);
      const estadoMasReciente = fechaUltimoEstado > fechaUltimaAccion;
      
      console.log(`🔄 Cliente ${cliente.cliente_id} (${cliente.nombre}):`);
      console.log(`   Fecha último estado: ${fechaUltimoEstado.toISOString()}`);
      console.log(`   Fecha última acción: ${fechaUltimaAccion.toISOString()}`);
      console.log(`   Estado más reciente: ${estadoMasReciente ? '✅ SÍ' : '❌ NO'}`);
      
      return estadoMasReciente;
    });

    console.log(`🎯 Clientes finales después de filtro de acción comercial: ${clientesFiltrados.length}`);

    // Aplicar paginación a los clientes filtrados
    const totalClientesFiltrados = clientesFiltrados.length;
    const clientesPaginados = clientesFiltrados.slice(page * limit, (page + 1) * limit);
    
    console.log(`📄 Clientes para esta página: ${clientesPaginados.length}`);

    if (clientesPaginados.length > 0) {
      console.log('\n🔍 DETALLE DE CLIENTES FINALES:');
      clientesPaginados.forEach((cliente, index) => {
        console.log(`\n--- CLIENTE ${index + 1} ---`);
        console.log(`ID: ${cliente.cliente_id}`);
        console.log(`Nombre: ${cliente.nombre} ${cliente.apellido || ''}`);
        console.log(`Estado del cliente: ${cliente.estado}`);
        
        if (cliente.contrato) {
          console.log(`📋 CONTRATO:`);
          console.log(`  Estado del contrato: ${cliente.contrato.estado}`);
          console.log(`  Fecha_pago (último estado): ${cliente.contrato.fecha_pago}`);
        }
        
        if (cliente.accion_comercial && cliente.accion_comercial.length > 0) {
          console.log(`📞 ÚLTIMA ACCIÓN COMERCIAL:`);
          console.log(`  Fecha: ${cliente.accion_comercial[0].fecha_accion}`);
        } else {
          console.log(`📞 Sin acciones comerciales registradas`);
        }
      });
    } else {
      console.log('\n❌ NO SE ENCONTRARON CLIENTES DESPUÉS DEL FILTRO FINAL');
      console.log('Posibles causas:');
      console.log('1. No hay clientes con estado más reciente que la última acción comercial');
      console.log('2. Todos los clientes ya fueron contactados recientemente');
    }
    
    console.log(`✅ Encontrados ${clientesPaginados.length} clientes finales`);

    // Contar total para paginación
    const totalClientes = totalClientesFiltrados;
    console.log(`📊 Total de clientes para paginación: ${totalClientes}`);

    // Formatear datos para el frontend
    const clientesFormateados = clientesPaginados.map(cliente => ({
      id: cliente.cliente_id,
      cliente: `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim(),
      telefono: cliente.celular,
      documento: cliente.documento_identidad,
      estado: cliente.estado,
      gestor: cliente.gestor || 'Sin asignar',
      fechaCreacion: cliente.fecha_creacion ? 
        new Date(cliente.fecha_creacion).toLocaleDateString('es-ES') : 
        'N/A',
      score: cliente.score,
      llamado: false,
      // ✅ INCLUIR DATOS DEL CONTRATO Y ACCIÓN COMERCIAL
      ultimoEstado: cliente.contrato ? {
        estado: cliente.contrato.estado,
        fechaUltimoEstado: cliente.contrato.fecha_pago ? 
          new Date(cliente.contrato.fecha_pago).toLocaleDateString('es-ES') : 
          'N/A'
      } : null,
      ultimaAccionComercial: cliente.accion_comercial && cliente.accion_comercial.length > 0 ? {
        fechaUltimaAccion: new Date(cliente.accion_comercial[0].fecha_accion).toLocaleDateString('es-ES')
      } : null
    }));

    const response = {
      success: true,
      data: clientesFormateados,
      pagination: {
        page,
        limit,
        totalItems: totalClientes,
        totalPages: Math.ceil(totalClientes / limit),
        hasNextPage: (page + 1) * limit < totalClientes,
        hasPreviousPage: page > 0
      }
    };

    console.log('📤 Respuesta enviada:', {
      clientesCount: clientesFormateados.length,
      pagination: response.pagination
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error en GET /api/task:', error?.message || error || 'Error desconocido');
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

// POST - Obtener estadísticas y métricas
export async function POST(request) {
  try {
    console.log('🚀 Iniciando POST /api/task para métricas');
    
    const body = await request.json();
    const { estados = [] } = body;
    
    console.log('📊 Calculando métricas para estados:', estados);

    // Obtener conteos por estado
    const metricas = {};
    
    // Si no se especifican estados, calcular para todos los estados configurados
    const estadosParaCalcular = estados.length > 0 ? estados : Object.keys(estadosMapping);
    
    for (const estadoFrontend of estadosParaCalcular) {
      const estadosDB = estadosMapping[estadoFrontend] || [estadoFrontend];
      
      // Contar total de clientes en este estado
      const totalClientes = await prisma.cliente.count({
        where: {
          estado: { in: estadosDB }
        }
      });

      // Para simplificar inicialmente, consideramos:
      // - Pendientes: todos los clientes en el estado
      // - Completados: 0 (se puede implementar lógica más compleja después)
      metricas[estadoFrontend] = {
        total: totalClientes,
        pendientes: totalClientes,
        completados: 0
      };

      console.log(`📈 ${estadoFrontend}: ${totalClientes} clientes`);
    }

    // Calcular estadísticas generales
    const totalGeneral = await prisma.cliente.count();
    const estadisticasGenerales = {
      total: totalGeneral,
      pendientes: totalGeneral, // Simplificado por ahora
      completadas: 0,
      efectividad: 0
    };

    const response = {
      success: true,
      metricas,
      estadisticasGenerales,
      timestamp: new Date().toISOString()
    };

    console.log('📤 Métricas calculadas:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error en POST /api/task:', error?.message || error || 'Error desconocido');
    console.error('Stack trace:', error?.stack);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error calculando métricas',
        details: error?.message || 'Error desconocido'
      }, 
      { status: 500 }
    );
  }
}

// Función auxiliar para logging limpio
function logQuery(description, query) {
  console.log(`🔍 ${description}:`);
  console.log(JSON.stringify(query, null, 2));
}
