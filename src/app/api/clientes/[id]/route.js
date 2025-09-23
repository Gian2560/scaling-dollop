import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { obtenerPersonaIdPorNombre } from "@/lib/helpers";

export async function GET(req, context) {
  try {
    // 🔹 Asegurar que params se obtiene correctamente de manera asíncrona
    const params = await context.params;  

    // ✅ Verificar si `id` está presente en `params`
    if (!params?.id) {
      return NextResponse.json({ error: "ID no proporcionado" }, { status: 400 });
    }

    const id = parseInt(params.id); // 🔹 Convertir a número

    // 🔍 Buscar cliente por ID en MySQL con Prisma
    const cliente = await prisma.cliente.findUnique({
      where: { cliente_id: id },
    });

    if (!cliente) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    return NextResponse.json(cliente); // ✅ Retornar cliente al frontend
  } catch (error) {
    console.error("❌ Error en el servidor:", error);
    return NextResponse.json(
      { error: "Error al obtener cliente", message: error.message },
      { status: 500 }
    );
  }
}


export async function PUT(req, context) {
  try {
    const params = await context.params;  
    const { id } = params;
    const { estado, accion, gestor, observaciones, fechaPromesaPago, motivo} = await req.json();

    // ✅ Actualizar el cliente en MySQL
    const updatedCliente = await prisma.cliente.update({
      where: { cliente_id: parseInt(id) },
      data: {
        estado,
        accion,
        gestor,
        observacion: observaciones,
        motivo: motivo || null, // Asegurar que se envía null si está vacío
      },
    });

    // 📌 Si el estado cambió, registrar en `historico_estado`
    if (estado) {
      await prisma.historico_estado.create({
        data: {
          cliente_id: parseInt(id),
          estado,
          fecha_estado: new Date(),
        },
      });
    }

    // 📌 Si hay una acción comercial, registrar en `accion_comercial`
    if (accion) {
      await prisma.accion_comercial.create({
        data: {
          cliente_id: parseInt(id),
          persona_id: gestor ? await obtenerPersonaIdPorNombre(gestor) : null,
          estado,
          fecha_accion: new Date(),
          nota: accion,
          gestor: gestor,
        },
      });
    }

    // 📌 Si el estado es "Promesa de Pago", registrar la fecha en `cita`
    if (fechaPromesaPago) {
      await prisma.cita.create({
        data: {
          cliente_id: parseInt(id),
          fecha_cita: new Date(fechaPromesaPago),
          estado_cita: "Promesa de Pago",
          motivo: "Promesa de Pago registrada",
          fecha_creacion: new Date(),
        },
      });
    }

    return NextResponse.json({ message: "Cliente actualizado con éxito" });
  } catch (error) {
    console.error("❌ Error al actualizar cliente:", error);
    return NextResponse.json(
      { error: "Error al actualizar cliente", message: error.message },
      { status: 500 }
    );
  }
}

