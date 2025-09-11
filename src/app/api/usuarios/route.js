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
  } catch (err) {
    console.error("❌ Error obteniendo usuarios:", err);
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

    if (!username || !password || !nombre) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    // Validar longitudes según el schema
    if (username.length > 50) {
      return NextResponse.json({ error: "Username no puede exceder 50 caracteres" }, { status: 400 });
    }
    if (nombre.length > 120) {
      return NextResponse.json({ error: "Nombre no puede exceder 120 caracteres" }, { status: 400 });
    }
    if (primer_apellido.length > 120) {
      return NextResponse.json({ error: "Primer apellido no puede exceder 120 caracteres" }, { status: 400 });
    }
    if (segundo_apellido && segundo_apellido.length > 120) {
      return NextResponse.json({ error: "Segundo apellido no puede exceder 120 caracteres" }, { status: 400 });
    }
    if (celular && celular.length > 12) {
      return NextResponse.json({ error: "Celular no puede exceder 12 caracteres" }, { status: 400 });
    }

    // Convertir rol_id a número
    const parsedRolId = parseInt(rol_id);
    if (isNaN(parsedRolId)) {
      return NextResponse.json({ error: "rol_id debe ser un número válido" }, { status: 400 });
    }

    // Convertir activo a booleano
    const isActivo = activo === 1 || activo === true || activo === "true";

    // Hashear la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario primero
    let newUsuario;
    try {
      newUsuario = await prisma.usuario.create({
        data: {
          username,
          password: hashedPassword,
          rol_id: parsedRolId || 2,
          activo: isActivo,
        },
      });
      console.log("✅ Usuario creado con ID:", newUsuario.usuario_id);
    } catch (userError) {
      console.error("❌ Error creando usuario:", userError);
      throw new Error(`Error creando usuario: ${userError.message}`);
    }

    // Después crear persona con persona_id = usuario_id
    let newPersona;
    try {
      console.log("🔄 Intentando crear persona con ID:", newUsuario.usuario_id);
      newPersona = await prisma.persona.create({
        data: {
          persona_id: newUsuario.usuario_id,
          nombre,
          primer_apellido,
          segundo_apellido: segundo_apellido || null,
          celular: celular || null,
          num_leads: 0,
        },
      });
      console.log("✅ Persona creada con ID:", newPersona.persona_id);
    } catch (personaError) {
      console.error("❌ Error creando persona:", personaError);
      // Si falla la creación de persona, eliminar el usuario creado
      try {
        await prisma.usuario.delete({ where: { usuario_id: newUsuario.usuario_id } });
      } catch (deleteError) {
        console.error("❌ Error eliminando usuario tras fallo:", deleteError);
      }
      throw new Error(`Error creando persona: ${personaError.message}`);
    }

    // Obtener el usuario completo con persona y rol
    let usuarioCompleto;
    try {
      usuarioCompleto = await prisma.usuario.findUnique({
        where: { usuario_id: newUsuario.usuario_id },
        include: { 
          persona: true,
          rol: true 
        },
      });
      
      console.log("✅ Usuario completo obtenido:", usuarioCompleto);

      if (!usuarioCompleto) {
        throw new Error("Usuario no encontrado después de la creación");
      }
    } catch (findError) {
      console.error("❌ Error obteniendo usuario completo:", findError);
      throw new Error(`Error obteniendo usuario: ${findError.message}`);
    }

    return NextResponse.json(usuarioCompleto, { status: 201 });
  } catch (err) {
    console.error("❌ Error creando usuario:", err);
    
    return NextResponse.json(
      { error: "Error creando usuario", details: err.message },
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
  } catch (err) {
    console.error("❌ Error actualizando usuario:", err);
    return NextResponse.json({ error: "Error actualizando usuario" }, { status: 500 });
  }
}

