import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";


export async function PUT(req, { params }) {
    try {
      const { id } = params;
      const { username, password, rol_id, activo, nombre, primer_apellido, segundo_apellido, celular } = await req.json();
  
      // Obtener el rol del usuario autenticado desde el frontend
      const userRole = req.headers.get("x-user-role"); // Asegúrate de que el frontend envíe esto
  
      console.log(`🔍 Usuario autenticado con rol: ${userRole}`);
  
      // Buscar usuario existente
      const usuarioExistente = await prisma.usuario.findUnique({
        where: { usuario_id: parseInt(id) },
        include: { persona: true },
      });
  
      if (!usuarioExistente) {
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
      }
  
      let hashedPassword = usuarioExistente.password;
  
      // Solo los administradores pueden cambiar la contraseña
      if (password && userRole === "Administrador") {
        console.log("🔑 Cambiando contraseña...");
        hashedPassword = await bcrypt.hash(password, 10);
      } else if (password) {
        return NextResponse.json(
          { error: "No tienes permisos para cambiar la contraseña" },
          { status: 403 }
        );
      }
  
      // Actualizar usuario y persona asociada
      const updatedUsuario = await prisma.usuario.update({
        where: { usuario_id: parseInt(id) },
        data: {
          username,
          password: hashedPassword,
          rol_id,
          activo,
          persona: {
            update: {
              nombre,
              primer_apellido,
              segundo_apellido,
              celular,
            },
          },
        },
        include: { persona: true },
      });
  
      return NextResponse.json(updatedUsuario);
    } catch (error) {
      console.error("❌ Error actualizando usuario:", error);
      return NextResponse.json({ error: "Error actualizando usuario" }, { status: 500 });
    }
  }
  
  

  export async function DELETE(req, { params }) {
    try {
      const { id } = params;
  
      // Buscar usuario con persona asociada
      const usuarioExistente = await prisma.usuario.findUnique({
        where: { usuario_id: parseInt(id) },
        include: { persona: true },
      });
  
      if (!usuarioExistente) {
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
      }
  
      // Primero eliminamos la persona, luego el usuario
      if (usuarioExistente.persona) {
        await prisma.persona.delete({
          where: { persona_id: usuarioExistente.persona.persona_id },
        });
      }
  
      await prisma.usuario.delete({
        where: { usuario_id: parseInt(id) },
      });
  
      return NextResponse.json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
      console.error("❌ Error eliminando usuario:", error);
      return NextResponse.json({ error: "Error eliminando usuario" }, { status: 500 });
    }
  }
  