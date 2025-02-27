import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key";
const JWT_EXPIRATION = "1h"; // ⏳ Expiración de 1 hora

export const autenticarUsuario = async ({ username, password }) => {
  try {
    console.log("🔍 Iniciando autenticación para usuario:", username);

    // 🔍 Buscar usuario en MySQL con Prisma
    const usuario = await prisma.usuario.findUnique({
      where: { username },
      include: { rol: true }, // 🔹 Incluye el rol del usuario
    });

    console.log("📌 Resultado de la búsqueda del usuario:", usuario);

    if (!usuario) {
      console.error("❌ Usuario no encontrado en la base de datos.");
      throw new Error("Usuario no encontrado.");
    }

    // 🔑 Validar contraseña
    console.log("🔑 Validando contraseña ingresada...");
    /*const esPasswordCorrecto = await bcrypt.compare(password, usuario.password);
    if (!esPasswordCorrecto) {
      console.error("❌ Contraseña incorrecta.");
      throw new Error("Contraseña incorrecta.");
    }*/
    if (usuario.password !== password) {
      console.error("❌ Contraseña incorrecta.");
      throw new Error("Contraseña incorrecta.");
    }

    console.log("✅ Contraseña válida.");

    // 🔹 Generar JWT con expiración
    console.log("🔹 Generando token JWT...");
    const token = jwt.sign(
      { id: usuario.usuario_id, username: usuario.username, role: usuario.rol.nombre_rol },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    console.log("✅ Token generado con éxito.");

    const response = {
      id: usuario.usuario_id,
      name: usuario.username,
      role: usuario.rol.nombre_rol,
      token,
      expiresAt: Date.now() + 3600 * 1000, // ⏳ Expira en 1 hora
    };

    console.log("📌 Respuesta final del proceso de autenticación:", response);
    return response;
  } catch (error) {
    console.error("❌ Error en autenticación:", error.message);
    throw new Error(error.message);
  }
};
