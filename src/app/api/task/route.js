import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapeo de estados del frontend a estados exactos de la base de datos
const estadosMapping = {
  'Interesado en reactivar': ['Interesado en reactivar'],
  'Fecha de Pago': ['Fecha de Pago'],
  'Indeciso / Informacion': ['Indeciso / Informacion', 'Indeciso', 'Información', 'Indeciso/Información'],
};
const estadosAccionComercial = {
  'En seguimiento': ['En seguimiento'],
  'Promesa de Pago': ['Promesa de Pago', 'Promesa de pago', 'Promesa pago']
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
    const esAccionComercial = Object.keys(estadosAccionComercial).includes(estado);
    let clientesFiltrados = []; // <--- DECLARAR AQUÍ
    console.log('🔧 Filtros iniciales:', { estado });

    console.log('📅 Filtros de fecha:', {
      mesActual: ahora.getMonth() + 1,
      añoActual: ahora.getFullYear(),
      inicioMes: inicioMes.toISOString(),
      finMes: finMes.toISOString()
    });
    // ✅ PRIMERO: Verificar si hay clientes con ese estado
    if (esAccionComercial) {
      console.log(`\n🔍 Filtrando por acción comercial con estado: "${estado}"`);
    // Buscar clientes cuya acción comercial más reciente sea de ese estado y más reciente que el estado del cliente
    const clientesCandidatos = await prisma.cliente.findMany({
      select: {
        cliente_id: true,
        nombre: true,
        apellido: true,
        celular: true,
        documento_identidad: true,
        estado: true,
        gestor: true,
        fecha_creacion: true,
        fecha_ultimo_estado: true,
        score: true,
        accion_comercial: {
          select: {
            estado: true,
            fecha_accion: true
          },
          orderBy: { fecha_accion: 'desc' },
          take: 1
        }
      },
      orderBy: { fecha_creacion: 'desc' }
    });

    clientesFiltrados = clientesCandidatos.filter(cliente => {
      const ultimaAccion = cliente.accion_comercial[0];
      return (
        ultimaAccion &&
        estadosAccionComercial.includes(ultimaAccion.estado) &&
        ultimaAccion.estado === estado &&
        (!cliente.fecha_ultimo_estado || new Date(ultimaAccion.fecha_accion) > new Date(cliente.fecha_ultimo_estado))
      );
    });

  } else {    
    let estadosDB = [];
    if (estado) {
      estadosDB = estadosMapping[estado] || [estado];
      console.log('🎯 Estados a buscar:', estadosDB);
      
      const clientesConEstado = await prisma.cliente.count({
        where: { estado: { in: estadosDB } }
      });
      console.log(`📊 Total de clientes con estado "${estado}": ${clientesConEstado}`);
    }

    // ✅ SEGUNDO: Verificar si hay clientes con fecha_ultimo_estado del mes actual
    const clientesConFechaMes = await prisma.cliente.count({
      where: {
        fecha_ultimo_estado: {
          gte: inicioMes,
          lte: finMes
        }
      }
    });
    console.log(`📊 Total de clientes con fecha_ultimo_estado del mes actual: ${clientesConFechaMes}`);

    // ✅ CONSTRUIR FILTRO CORRECTO
    let whereClause = {};

    // Filtrar por estado del cliente si se especifica
    if (estado) {
      whereClause.estado = { in: estadosDB };
    }

    // Y debe tener fecha_ultimo_estado del mes actual
    /*whereClause.fecha_ultimo_estado = {
      gte: inicioMes,
      lte: finMes
    };*/

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
        take: 100 // Solo 5 para debug
      });

      console.log(`📋 Encontrados ${clientesDebug.length} clientes con estado "${estado}" (sin filtro de fecha):`);
      
      clientesDebug.forEach((cliente, index) => {
        console.log(`\n--- DEBUG CLIENTE ${index + 1} ---`);
        console.log(`ID: ${cliente.cliente_id}`);
        console.log(`Nombre: ${cliente.nombre} ${cliente.apellido || ''}`);
        console.log(`Estado: ${cliente.estado}`);
        
        if (cliente.fecha_ultimo_estado) {
          const fechaUltimoEstado = new Date(cliente.fecha_ultimo_estado);
          const esMesActual = fechaUltimoEstado >= inicioMes && fechaUltimoEstado <= finMes;
          
          console.log(`Fecha_ultimo_estado (raw): ${cliente.fecha_ultimo_estado}`);
          console.log(`Fecha_ultimo_estado (parsed): ${fechaUltimoEstado.toISOString()}`);
          console.log(`Rango inicio: ${inicioMes.toISOString()}`);
          console.log(`Rango fin: ${finMes.toISOString()}`);
          console.log(`¿Está en el rango?: ${esMesActual}`);
          
          // Comparación detallada
          console.log(`Comparaciones:`);
          console.log(`  fecha >= inicio: ${fechaUltimoEstado >= inicioMes}`);
          console.log(`  fecha <= fin: ${fechaUltimoEstado <= finMes}`);
          console.log(`  Mes de fecha: ${fechaUltimoEstado.getMonth() + 1}/${fechaUltimoEstado.getFullYear()}`);
          console.log(`  Mes actual: ${ahora.getMonth() + 1}/${ahora.getFullYear()}`);
        } else {
          console.log('❌ Sin fecha_ultimo_estado');
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
        fecha_ultimo_estado: true,
        score: true,
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

    // ✅ QUINTO: Filtrar clientes donde fecha_ultimo_estado > fecha_accion más reciente
    clientesFiltrados = clientesCandidatos.filter(cliente => {
      if (!cliente.fecha_ultimo_estado) {
        console.log(`⚠️ Cliente ${cliente.cliente_id} sin fecha_ultimo_estado`);
        return false;
      }

      const fechaUltimoEstado = new Date(cliente.fecha_ultimo_estado);
      
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
  }
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
        console.log(`Fecha último estado: ${cliente.fecha_ultimo_estado}`);
        
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
      // ✅ INCLUIR DATOS DE FECHA_ULTIMO_ESTADO Y ACCIÓN COMERCIAL
      fechaUltimoEstado: cliente.fecha_ultimo_estado ? 
        new Date(cliente.fecha_ultimo_estado).toLocaleDateString('es-ES') : 
        'N/A',
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

    // Configurar rango de fechas del mes actual (igual que en GET)
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59, 999);
    
    console.log('📅 Filtros de fecha para métricas:', {
      mesActual: ahora.getMonth() + 1,
      añoActual: ahora.getFullYear(),
      inicioMes: inicioMes.toISOString(),
      finMes: finMes.toISOString()
    });

    // Obtener conteos por estado
    const metricas = {};
    
    // Si no se especifican estados, calcular para todos los estados configurados
    const todosLosEstados = [...Object.keys(estadosMapping), ...Object.keys(estadosAccionComercial)];
    const estadosParaCalcular = estados.length > 0 ? estados : todosLosEstados;
    
    for (const estadoFrontend of estadosParaCalcular) {
      const esAccionComercial = Object.keys(estadosAccionComercial).includes(estadoFrontend);

      console.log(`\n🎯 Procesando estado: "${estadoFrontend}" (${esAccionComercial ? 'ACCIÓN COMERCIAL' : 'ESTADO CLIENTE'})`);
      let pendientes = 0;
      let completadas = 0;
      let total = 0;

      if (esAccionComercial) {
        // 🔁 Normaliza a los estados reales de tu BD (pueden ser varios alias)
        const estadosDB = estadosAccionComercial[estadoFrontend] || [estadoFrontend];
        console.log(`🔍 Filtrando por acción comercial con estado: "${estadoFrontend}"`);
        // ✅ PARA ESTADOS DE ACCIÓN COMERCIAL: Solo contar los que están en ese estado y es más reciente
        const clientesCandidatos = await prisma.cliente.findMany({
          where: {
            accion_comercial: {
              some: {
                estado: { in: estadosDB }
              }
            }
          },
          select: {
            cliente_id: true,
            nombre: true,
            estado: true,
            fecha_ultimo_estado: true,
            // accion_comercial: {
            //   where: {
            //     estado: {
            //       not: null,    // No sea null
            //       not: ''       // No sea cadena vacía
            //     }
            //   },
            //   select: {
            //     estado: true,
            //     fecha_accion: true
            //   },
            //   orderBy: { fecha_accion: 'desc' },
            //   take: 1
            // }
            // Trae SOLO la última acción de ese estado (o alias) para comparar fechas
            accion_comercial: {
              where: { estado: { in: estadosDB } },
              select: { estado: true, fecha_accion: true },
              orderBy: { fecha_accion: 'desc' },
              take: 1
            }
          }
        });
        console.log(`📋 Candidatos para "${estadoFrontend}": ${clientesCandidatos.length}`);
        //let completadas = 0;
        // Solo contar los que tienen acción comercial de ese estado y es más reciente
        clientesCandidatos.forEach(cliente => {
          const ultimaAccion = cliente.accion_comercial[0];
          if (ultimaAccion) {
          console.log("ultimaAccion:", ultimaAccion);}
          if (
            ultimaAccion &&
            ultimaAccion.estado === estadosDB &&
            (new Date(ultimaAccion.fecha_accion) > new Date(cliente.fecha_ultimo_estado))
          ) {
            // Para acciones comerciales, todos los que califican son "completadas"
            completadas++;
            console.log(`   ✅ Cliente ${cliente.cliente_id}: Acción "${estadoFrontend}" más reciente -> COMPLETADA`);
          }
        });

        total = completadas; // Para acciones comerciales no hay "pendientes"
        metricas[estadoFrontend] = {
            total,
            pendientes: 0,
            completados: completadas,
            porcentajeCompletado: total > 0 ? Math.round((completadas / total) * 100) : 0,
        };
        continue;
      } else {
      
      const estadosDB = estadosMapping[estadoFrontend] || [estadoFrontend];
      const clientesCandidatos = await prisma.cliente.findMany({
        where: {
          estado: { in: estadosDB },
          fecha_ultimo_estado: {
            gte: inicioMes,
            lte: finMes
          }
        },
        select: {
          cliente_id: true,
          nombre: true,
          estado: true,
          fecha_ultimo_estado: true,
          accion_comercial: {
            select: {
              fecha_accion: true
            },
            orderBy: {
              fecha_accion: 'desc'
            },
            take: 1 // Solo la más reciente
          }
        }
      });

      console.log(`📋 Candidatos para "${estadoFrontend}": ${clientesCandidatos.length}`);



      clientesCandidatos.forEach(cliente => {
        if (!cliente.fecha_ultimo_estado) {
          return; // Saltar si no tiene datos válidos
        }

        const fechaUltimoEstado = new Date(cliente.fecha_ultimo_estado);
        
        // Si no tiene acciones comerciales -> PENDIENTE
        if (!cliente.accion_comercial || cliente.accion_comercial.length === 0) {
          pendientes++;
          console.log(`   ✅ Cliente ${cliente.cliente_id} (${cliente.nombre}): Sin acciones -> PENDIENTE`);
          return;
        }

        const fechaUltimaAccion = new Date(cliente.accion_comercial[0].fecha_accion);
        
        // Comparar fechas para clasificar
        if (fechaUltimoEstado > fechaUltimaAccion) {
          // Estado más reciente que acción -> PENDIENTE
          pendientes++;
          console.log(`   ✅ Cliente ${cliente.cliente_id} (${cliente.nombre}): Estado más reciente -> PENDIENTE`);
        } else {
          // Acción más reciente que estado -> COMPLETADA
          completadas++;
          console.log(`   ✅ Cliente ${cliente.cliente_id} (${cliente.nombre}): Acción más reciente -> COMPLETADA`);
        }
      });
      total = pendientes + completadas;
    }
      
      metricas[estadoFrontend] = {
        total,
        pendientes,
        completados: completadas, // Mantener nombre consistente con frontend
        porcentajeCompletado: total > 0 ? Math.round((completadas / total) * 100) : 0
      };

      console.log(`📈 Métricas "${estadoFrontend}":`, {
        total,
        pendientes,
        completadas,
        porcentaje: metricas[estadoFrontend].porcentajeCompletado + '%'
      });
    }

    // ✅ CALCULAR ESTADÍSTICAS GENERALES
    const allStats = Object.values(metricas);
    const totalGeneral = allStats.reduce((sum, stat) => sum + stat.total, 0);
    const pendientesGeneral = allStats.reduce((sum, stat) => sum + stat.pendientes, 0);
    const completadasGeneral = allStats.reduce((sum, stat) => sum + stat.completados, 0);
    
    const estadisticasGenerales = {
      total: totalGeneral,
      pendientes: pendientesGeneral,
      completadas: completadasGeneral,
      efectividad: totalGeneral > 0 ? Math.round((completadasGeneral / totalGeneral) * 100) : 0
    };

    const response = {
      success: true,
      metricas,
      estadisticasGenerales,
      timestamp: new Date().toISOString(),
      debug: {
        rangoFechas: {
          inicio: inicioMes.toISOString(),
          fin: finMes.toISOString()
        },
        estadosProcesados: estadosParaCalcular
      }
    };

    console.log('\n📤 Métricas finales calculadas:');
    console.log('📊 Por estado:', metricas);
    console.log('📊 Generales:', estadisticasGenerales);
    
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

// PUT - Obtener estadísticas de mensajes enviados (acciones comerciales "Código entregado especial retadora")
export async function PUT(request) {
  try {
    console.log('🚀 Iniciando PUT /api/task para estadísticas de mensajes');

    // Configurar rango de fechas del mes actual
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59, 999);
    
    console.log('📅 Contando mensajes enviados en el mes actual:', {
      mesActual: ahora.getMonth() + 1,
      añoActual: ahora.getFullYear(),
      inicioMes: inicioMes.toISOString(),
      finMes: finMes.toISOString()
    });

    // Contar acciones comerciales con estado "Código entregado especial retadora"
    const mensajesEnviados = await prisma.accion_comercial.count({
      where: {
        estado: 'Código entregado especial retadora',
        fecha_accion: {
          gte: inicioMes,
          lte: finMes
        }
      }
    });

    console.log(`📱 Mensajes enviados encontrados: ${mensajesEnviados}`);

    const response = {
      success: true,
      mensajesEnviados,
      periodo: {
        mes: ahora.getMonth() + 1,
        año: ahora.getFullYear(),
        inicio: inicioMes.toISOString(),
        fin: finMes.toISOString()
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error en PUT /api/task (mensajes):', error?.message || error || 'Error desconocido');
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error calculando estadísticas de mensajes',
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
