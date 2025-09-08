// pages/api/plantillas.js

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Obtener todas las plantillas
export async function GET() {
  try {
    const templates = await prisma.template.findMany({
      select: {
        id: true,
        nombre_template: true,
        mensaje: true,
        template_content_sid: true,
        parametro: true,
        created_at: true,
      },
      orderBy: { created_at: "desc" }, // Ordena por la fecha de creación
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("❌ Error al obtener plantillas:", error);
    return NextResponse.json({ error: "Error al obtener plantillas" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // Parsear los datos JSON enviados en el cuerpo de la solicitud
    const { nombre_template, mensaje, template_content_sid } = await request.json();
    

    if (!nombre_template || !mensaje || !template_content_sid ) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
    }

    const parametro = false
    console.log('Datos recibidos:', { nombre_template, mensaje, template_content_sid, parametro });

    // Crear la plantilla en la base de datos
    const newTemplate = await prisma.template.create({
      data: {
        nombre_template,
        mensaje,
        template_content_sid,
        parametro,
      },
    });

    // Retornar la plantilla creada como respuesta
    return NextResponse.json(newTemplate);
  } catch (error) {
    console.error("❌ Error al crear plantilla:", error);
    return NextResponse.json({ error: "Error al crear plantilla" }, { status: 500 });
  }
}

// PUT: Actualizar una plantilla existente
export async function PUT(request) {
  try {
    const { id, nombre_template, mensaje, template_content_sid, parametro } = await request.json();

    const updatedTemplate = await prisma.template.update({
      where: { id },
      data: {
        nombre_template,
        mensaje,
        template_content_sid,
        parametro,
      },
    });

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error("❌ Error al actualizar plantilla:", error);
    return NextResponse.json({ error: "Error al actualizar plantilla" }, { status: 500 });
  }
}

// DELETE: Eliminar una plantilla
export async function DELETE(request) {
  try {
    const { id } = await request.json();

    const deletedTemplate = await prisma.template.delete({
      where: { id },
    });

    return NextResponse.json(deletedTemplate);
  } catch (error) {
    console.error("❌ Error al eliminar plantilla:", error);
    return NextResponse.json({ error: "Error al eliminar plantilla" }, { status: 500 });
  }
}
