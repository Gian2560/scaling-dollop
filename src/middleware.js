import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // 🔹 Definir rutas protegidas
  const protectedRoutes = ["/dashboard", "/settings","/clientes"];

  // 🔹 Redirigir al login si no hay token y la ruta es protegida
  if (!token && protectedRoutes.some((path) => req.nextUrl.pathname.startsWith(path))) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  const res = NextResponse.next();

  // 🔥 Habilitar CORS solo en las API (/api/*)
  if (req.nextUrl.pathname.startsWith("/api")) {
    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }

  return res;
}

// 🔹 Aplica el middleware solo en rutas de API y protegidas
export const config = {
  matcher: ["/api/:path*", "/dashboard", "/settings"], // Agrega más rutas si es necesario
};
