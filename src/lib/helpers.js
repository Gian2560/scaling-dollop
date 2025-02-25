import prisma from "./prisma";

export async function obtenerTodasLasPersonas() {
  try {
    console.log("🔍 Obteniendo todas las personas de la base de datos...");

    // 🔹 Obtener todas las personas de la tabla `persona`
    const personas = await prisma.persona.findMany({
      select: {
        persona_id: true,
        nombre: true,
        primer_apellido: true,
        segundo_apellido: true,
      },
    });

    // 🔹 Imprimir en consola
    console.log("📌 Lista de personas en la BD:", personas);

    return personas;
  } catch (error) {
    console.error("❌ Error al obtener todas las personas:", error);
    return [];
  }
}
// ✅ Conexión a la base de datos antes de hacer consultas
async function verificarConexion() {
  try {
    await prisma.$connect();
    console.log("✅ Conexión a la base de datos establecida correctamente.");
  } catch (error) {
    console.error("❌ Error en la conexión a la base de datos:", error);
  }
}

// ✅ Función para obtener el ID de la persona a partir del nombre del gestor
export async function obtenerPersonaIdPorNombre(nombreGestor) {
  if (!nombreGestor) return null;

  try {
    console.log(`🔍 Buscando persona con nombreGestor: "${nombreGestor}"`);

    // 🔹 Separar el nombre completo en partes
    const partesNombre = nombreGestor.split(" ");
    const nombre = partesNombre[0] || "";
    const primerApellido = partesNombre[1] || "";
    const segundoApellido = partesNombre.slice(2).join(" ") || "";

    console.log(`📌 Comparando con BD → Nombre: "${nombre}", Primer Apellido: "${primerApellido}", Segundo Apellido: "${segundoApellido}"`);

    // 🔍 Buscar en la BD
    const persona = await prisma.persona.findFirst({
      where: {
        nombre: { equals: nombre,  },
        primer_apellido: { equals: primerApellido, },
        segundo_apellido: { equals: segundoApellido,  },
      },
      select: { persona_id: true },
    });

    console.log("🆔 Persona encontrada:", persona?.persona_id || "No encontrada");

    return persona ? persona.persona_id : null;
  } catch (error) {
    console.error("❌ Error al obtener persona_id del gestor:", error);
    return null;
  }
}
