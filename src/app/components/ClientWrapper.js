"use client";
import { usePathname } from "next/navigation";
import Layout from "./Layout";
import { SessionProvider } from "next-auth/react";
import { useAuth } from "../../hooks/useAuth";

export default function ClientWrapper({ children }) {
  const pathname = usePathname();

  // Detectar si es la página 404
  const is404 = pathname === "/not-found";

  // Rutas que NO deben tener Layout
  const excludedRoutes = ["/login", "/register", "/not-found"];
  const isExcluded = excludedRoutes.includes(pathname) || is404;

  return (
    <SessionProvider>
      <AuthWrapper>
        {isExcluded ? children : <Layout>{children}</Layout>}
      </AuthWrapper>
    </SessionProvider>
  );
}

function AuthWrapper({ children }) {
  useAuth();
  return children;
}
