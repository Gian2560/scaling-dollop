import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const orderBy = searchParams.get("orderBy") || "fecha_creacion";
    const order = searchParams.get("order") || "asc";
    const search = searchParams.get("search") || "";
    const estado = searchParams.get("estado");
    const bound = searchParams.get("bound");
    let fechaInicio = searchParams.get("fechaInicio");
    let fechaFin = searchParams.get("fechaFin");
    const gestor =searchParams.get("name");
    const role = searchParams.get("role");
    const accionComercial = searchParams.get("accionComercial"); //
    const interaccionBot = searchParams.get("interaccionBot"); // Nuevo parámetro

    console.log("🔎 Parámetros recibidos:", { page, pageSize, search, estado, bound, fechaInicio, fechaFin, orderBy, order,gestor,accionComercial });

    // 🛠️ Validar fechas (evitar null)
    fechaInicio = fechaInicio && fechaInicio !== "null" ? new Date(fechaInicio) : undefined;
    fechaFin = fechaFin && fechaFin !== "null" ? new Date(fechaFin) : undefined;

    console.log("📌 Fechas después de validación:", { fechaInicio, fechaFin });

    // 🛠️ Construcción de filtros dinámicos
    let filtros = {};

    if (search) {
      filtros.OR = [
        { nombre: { contains: search } },
        { email: { contains: search} },
        {celular: {contains: search}},
      ];
    }

    if (estado && estado !== "Todos") {
      filtros.estado = estado;
    }

    if (bound && bound !== "Todos") {
      filtros.bound = bound === "INBOUND";
    }

    if (fechaInicio && fechaFin) {
      filtros.fecha_ultima_interaccion_bot = {
        gte: fechaInicio, // Mayor o igual a la fecha de inicio
        lte: fechaFin, // Menor o igual a la fecha de fin
      };
    }
    if ((gestor && gestor !== "Todos")&&(role=="asesor")) {
      filtros.gestor = gestor; // Si usas el nombre
      // o si utilizas gestor_id, sería:
      // filtros.gestor_id = parseInt(gestor, 10);
    }
    if (accionComercial && accionComercial !== "Todos") {
      filtros.accion = accionComercial; // Filtrar por "Acción Comercial"
    }
    if (interaccionBot === "Con interacción") {
      filtros.fecha_ultima_interaccion_bot = { not: null }; // Clientes con fecha de interacción
    } else if (interaccionBot === "Sin interacción") {
      filtros.fecha_ultima_interaccion_bot = null; // Clientes sin fecha de interacción
    }
    if (accionComercial === "Sin accion comercial") {
      filtros.accion = ""; // Filtra por clientes que no tienen acción comercial
    }       
    console.log("📌 Filtros aplicados:", filtros);

    // 🛠️ Obtener clientes con Prisma
    const clientes = await prisma.cliente.findMany({
      where: filtros,
      orderBy: { [orderBy]: order },
      take: pageSize,
      skip: (page - 1) * pageSize,
      
    });

    console.log("✅ Clientes obtenidos:", clientes.length);

    // 🛠️ Obtener total de clientes
    const totalClientes = await prisma.cliente.count({ where: filtros });

    // 🚨 Verificar valores antes de responder
    if (!clientes || !Array.isArray(clientes)) {
      console.warn("⚠️ No se encontraron clientes. Enviando array vacío.");
      return NextResponse.json({ clientes: [], total: 0 });
    }

    return NextResponse.json({
        clientes: clientes.map(cliente => ({
          ...cliente,
          id: cliente.cliente_id, // ✅ Cambiamos `cliente_id` a `id`
        })), total: totalClientes });
  } catch (error) {
    console.error("❌ Error en el try-catch:", error);

    return NextResponse.json(
      { error: "Error al obtener clientes", message: error.message || "Error desconocido" },
      { status: 500 }
    );
  }
}
