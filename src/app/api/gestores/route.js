import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 🔍 Obtener todos los usuarios con la relación de la tabla persona
    const gestores = await prisma.usuario.findMany({
      include: {
        persona: true, // 🔹 Incluir los datos de la persona asociada
      },
      where: {
        activo: true, // Opcional: Solo traer usuarios activos
      },
    });

    // 🔄 Formatear la respuesta para combinar nombres
    const gestoresFormateados = gestores.map((gestor) => ({
      id: gestor.usuario_id, // ID del usuario
      username: gestor.username, // Nombre de usuario
      rol: gestor.rol_id, // ID del rol
      activo: gestor.activo, // Estado del usuario
      nombre_completo: gestor.persona
        ? `${gestor.persona.nombre} ${gestor.persona.primer_apellido} ${gestor.persona.segundo_apellido || ""}`.trim()
        : gestor.username, // Formatear nombre completo
    }));

    return NextResponse.json(gestoresFormateados);
  } catch (error) {
    console.error("❌ Error al obtener gestores:", error);
    return NextResponse.json(
      { error: "Error al obtener gestores", message: error.message },
      { status: 500 }
    );
  }
}
