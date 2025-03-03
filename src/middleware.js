import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // 🔹 Definir rutas protegidas
  const protectedRoutes = ["/dashboard", "/settings", "/clientes", "/campaigns", "/usuarios", "/promesasPago"];

  // 🔹 Si la ruta es protegida y el usuario no tiene token, redirigir a login
  if (!token && protectedRoutes.some((path) => req.nextUrl.pathname.startsWith(path))) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 🔹 Si la ruta no coincide con las rutas protegidas y tampoco es una API, redirigir a 404
  if (!protectedRoutes.some((path) => req.nextUrl.pathname.startsWith(path)) && !req.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.rewrite(new URL("/404", req.url)); // ✅ Redirigir a la página 404
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
  matcher: ["/api/:path*", "/dashboard", "/settings", "/clientes", "/campaigns", "/usuarios", "/promesasPago"],
};
