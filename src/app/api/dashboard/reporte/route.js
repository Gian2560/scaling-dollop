import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Prisma client

export async function GET(request) {
  try {
    // Obtención de las fechas del query string
    const { fechaInicio = "", fechaFin = "" } = Object.fromEntries(new URL(request.url).searchParams);

    // Validación de fechas
    if (!fechaInicio || !fechaFin) {
      return NextResponse.json(
        { message: "Debe proporcionar una fecha de inicio y una fecha de fin." },
        { status: 400 }
      );
    }

    // Filtro de fechas
    const fechaFilter = {
      fecha_creacion: {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin),
      },
    };

    // Definir los estados para consulta
    const estados = [
      "en seguimiento","interesado", "no interesado","promesa de pago",  "finalizado", 
    ];

    // Objeto para almacenar los datos por estado
    const estadosData = {};

    // Usamos Promise.all para ejecutar las consultas concurrentemente
    const results = await Promise.all(
      estados.map(async (estado) => {
        // Total de leads en este estado
        const totalEstado = await prisma.cliente.count({
          where: {
            ...fechaFilter,
            estado,
          },
        });

        console.log(`Clientes en estado "${estado}":`, totalEstado); // Log para verificar la cantidad de clientes

        // Si no hay datos, no continuar con el procesamiento de este estado
        if (totalEstado === 0) {
          return { estado, data: { total: 0, converge: "0.00", recencia: "0.00", intensity: "0.00", accion: {} } };
        }
        

        // Porcentaje de clientes contactados (Converge)
        const contactados = await prisma.cliente.count({
          where: {
            ...fechaFilter,
            estado,
          },
        });
        const converge = totalEstado > 0 ? (contactados / totalEstado) * 100 : 0;
        console.log(`Converge en estado "${estado}":`, converge);

        // Generar valores aleatorios para recencia e intensity (por ahora simulados)
        const recenciaData = await prisma.$queryRaw`
          SELECT AVG(DATEDIFF(fecha_ultima_interaccion, fecha_creacion)) AS promedio_recencia
          FROM cliente
          WHERE estado = ${estado} AND fecha_creacion >= ${fechaInicio} AND fecha_creacion <= ${fechaFin}
        `;
        const promedioRecencia = recenciaData[0]?.promedio_recencia || 0;

        const actionsPerClient = await prisma.accion_comercial.groupBy({
          by: ['cliente_id'],  // Agrupamos por cliente
          _count: {
            accion_comercial_id: true,  // Contamos la cantidad de acciones por cliente
          },
          where: {
            cliente: {
              ...fechaFilter,
              estado,  // Filtro por estado
            },
          },
        });
        
        // Calculamos el total de acciones y el número de clientes
        const totalActions = actionsPerClient.reduce((acc, item) => acc + item._count.accion_comercial_id, 0);
        const averageActions = actionsPerClient.length > 0 ? (totalActions / actionsPerClient.length) : 0;
        
        console.log('Promedio de acciones (intensity)', averageActions);

        const acciones = await prisma.cliente.groupBy({
          by: ['accion'],  // Agrupamos por el campo 'accion' en la tabla cliente
          _count: {
            cliente_id: true,  // Contamos la cantidad de clientes con cada tipo de acción
          },
          where: {
            ...fechaFilter,  // Filtro por el rango de fechas proporcionado
            accion: {
              not: "",  // Filtramos por acciones no vacías
            },
            estado: 
              estado
            
          },
        });
         
        // Aseguramos que 'acciones' sea un arreglo vacío si no hay resultados
        console.log("acciones", acciones);
        
        const accionesData = acciones.reduce((acc, item) => {
          acc[item.accion] = item._count.cliente_id;
          return acc;
        }, {});
        

        // Construcción del objeto de datos para este estado
        return {
          estado,
          data: {
            total: totalEstado,
            converge: converge.toFixed(2),
            recencia: promedioRecencia.toFixed(2),  // Simulación de recencia
            intensity: averageActions.toFixed(2),            
            accion: accionesData, // Aquí podrías agregar las acciones si quieres, pero las dejamos vacías por ahora
          }
        };
      })
    );

    // Filtrar los resultados nulos antes de pasarlos al cliente
    results.forEach((result) => {
      if (result.data !== null) {
        estadosData[result.estado] = result.data;
      }
    });

    // Respuesta completa con los estados y el total de leads
    const totalLeads = await prisma.cliente.count({
      where: {
        ...fechaFilter,
        estado: { in: estados },
      },
    });

    // Validar que los datos sean correctos antes de enviar la respuesta
    if (Object.keys(estadosData).length === 0) {
      return NextResponse.json(
        { message: "No se encontraron datos para el rango de fechas proporcionado." },
        { status: 404 }
      );
    }

    // Antes de devolver la respuesta final, haz un log de la respuesta que estás generando
    console.log("Datos finales que se enviarán al frontend:", {
      totalLeads,
      estados: estadosData,
    });

    return NextResponse.json({
      totalLeads,
      estados: estadosData,
    });


  } catch (error) {
    // Depuración del error
    console.log("Detalle del error:", error);

    // Verifica si el error es un objeto Error válido
    let errorMessage = "Error interno del servidor al obtener datos de leads.";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (error && error.message) {
      errorMessage = error.message;
    }

    // Log del error
    console.error("Error al obtener datos de leads:", error);

    // Respuesta con error adecuado
    return NextResponse.json(
      { message: errorMessage, error: error ? error.stack : 'No stack available' },
      { status: 500 }
    );
  }
}
