import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";


export async function GET() {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: {
        persona: true,
        rol: true,
      },
    });

    return NextResponse.json(usuarios);
  } catch (error) {
    console.error("❌ Error obteniendo usuarios:", error);
    return NextResponse.json({ error: "Error obteniendo usuarios" }, { status: 500 });
  }
}


export async function POST(req) {
  try {
    const body = await req.json();
    console.log("📩 Recibiendo datos:", body);

    if (!body) {
      return NextResponse.json({ error: "No se enviaron datos" }, { status: 400 });
    }

    const { username, password, rol_id, activo, nombre, primer_apellido, segundo_apellido, celular } = body;

    if (!username || !password || !nombre || !primer_apellido) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    // Convertir rol_id a número
    const parsedRolId = parseInt(rol_id);
    if (isNaN(parsedRolId)) {
      return NextResponse.json({ error: "rol_id debe ser un número válido" }, { status: 400 });
    }

    // Hashear la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario y su persona asociada
    const newUsuario = await prisma.usuario.create({
      data: {
        username,
        password: hashedPassword,
        rol_id: parsedRolId || 2,
        activo: activo ?? 1,
        persona: {
          create: {
            nombre,
            primer_apellido,
            segundo_apellido,
            celular,
            num_leads: 1, // Asegúrate de que esto sea correcto en el modelo
          },
        },
      },
      include: { persona: true },
    });

    console.log("✅ Usuario creado:", newUsuario);

    return NextResponse.json(newUsuario, { status: 201 });
  } catch (error) {
    console.error("❌ Error creando usuario:", error);
    
    return NextResponse.json(
      { error: "Error creando usuario", details: error.message },
      { status: 500 }
    );
  }
}


export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const { username, password, rol_id, activo, nombre, primer_apellido, segundo_apellido, celular } = await req.json();

    // Buscar usuario existente
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { usuario_id: parseInt(id) },
      include: { persona: true },
    });

    if (!usuarioExistente) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Si hay contraseña nueva, la hasheamos
    let hashedPassword = usuarioExistente.password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
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

