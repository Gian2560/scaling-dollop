import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
//import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log("🔍 Autenticando usuario:", credentials.username);

          // 🔹 Buscar usuario en MySQL
          const usuario = await prisma.usuario.findUnique({
            where: { username: credentials.username },
            include: { rol: true },
          });

          if (!usuario) throw new Error("Usuario no encontrado.");

          // 🔑 Validar contraseña (Si aún no está encriptada, usa comparación simple)
          //const esPasswordCorrecto = await bcrypt.compare(credentials.password, usuario.password);
          const esPasswordCorrecto = credentials.password === usuario.password;

          if (!esPasswordCorrecto) throw new Error("Contraseña incorrecta.");

          return {
            id: usuario.usuario_id,
            name: usuario.username,
            email: usuario.email,
            role: usuario.rol.nombre_rol, // 🔹 Se obtiene el rol del backend
            tokenExpires: Date.now() + 3600 * 1000, // 🔹 Expiración en 1 hora
          };
        } catch (error) {
          console.error("❌ Error en autenticación:", error.message);
          throw new Error(error.message);
        }
      },
    }),
  ],
  pages: {
    signIn: "/login", // 🔹 Página de inicio de sesión
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.expiresAt = user.tokenExpires;
      }

      // 🔹 Si el token expira, forzar cierre de sesión
      if (Date.now() > token.expiresAt) {
        console.warn("🔄 Token expirado. Cerrando sesión automáticamente.");
        return null;
      }

      return token;
    },
    async session({ session, token }) {
      if (!token) {
        console.warn("❌ Token inválido. Cerrando sesión.");
        return null;
      }

      session.user.role = token.role;
      return session;
    },
  },
  session: {
    strategy: "jwt", // 🔹 Manejo de sesión con JWT en lugar de BD
  },
  secret: process.env.NEXTAUTH_SECRET, // 🔹 Clave secreta de NextAuth
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
