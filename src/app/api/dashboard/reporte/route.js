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
      "interesado", "promesa de pago", "no interesado", "finalizado", "en seguimiento"
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
          return { estado, data: null };
        }

        // Porcentaje de clientes contactados (Converge)
        const contactados = await prisma.cliente.count({
          where: {
            ...fechaFilter,
            estado,
            gestor: {
              not: "",
            },
          },
        });
        const converge = totalEstado > 0 ? (contactados / totalEstado) * 100 : 0;
        console.log(`Converge en estado "${estado}":`, converge);

        // Generar valores aleatorios para recencia e intensity (por ahora simulados)
        const recencia = (Math.random() * 30).toFixed(2);  // Simulando un valor de recencia entre 0 y 30 días
        const intensity = (Math.random() * 10).toFixed(2);  // Simulando el número de intentos (entre 0 y 10)

        // Construcción del objeto de datos para este estado
        return {
          estado,
          data: {
            total: totalEstado,
            converge: converge.toFixed(2),
            recencia,  // Simulación de recencia
            intensity, // Simulación de intensity
            accion: {}, // Aquí podrías agregar las acciones si quieres, pero las dejamos vacías por ahora
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
