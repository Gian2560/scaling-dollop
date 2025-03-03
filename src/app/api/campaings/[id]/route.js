import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";


export async function PUT(req, { params }) {
    try {
      const id = parseInt(params.id); // ✅ Convertimos el ID a número
      if (isNaN(id)) {
        return NextResponse.json({ error: "ID de campaña no válido" }, { status: 400 });
      }
  
      const body = await req.json();
      const { nombre_campanha, descripcion, fecha_fin, estado_campanha, template_id } = body;
  
      // 🔹 Validar si la campaña existe antes de actualizar
      const existingCampaign = await prisma.campanha.findUnique({ where: { campanha_id: id } });
      if (!existingCampaign) {
        return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
      }
  
      // 🔹 Actualizar campaña en la base de datos
      const updatedCampaign = await prisma.campanha.update({
        where: { campanha_id: id },
        data: {
          nombre_campanha,
          descripcion,
          fecha_fin: fecha_fin ? new Date(fecha_fin) : null,
          estado_campanha,
          template_id: template_id ? parseInt(template_id) : null,
        },
      });
  
      return NextResponse.json(updatedCampaign);
    } catch (error) {
      console.error("❌ Error al actualizar campaña:", error);
      return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
  }