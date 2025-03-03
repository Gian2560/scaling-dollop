"use client";
import { usePathname } from "next/navigation";
import Layout from "./Layout";
import { SessionProvider } from "next-auth/react";
import { useAuth } from "../../hooks/useAuth";

export default function ClientWrapper({ children }) {
  const pathname = usePathname();

  // Si la página no existe, Next.js redirige a "/not-found"
  const is404 = pathname === "/not-found";
  
  // Rutas que NO deben tener Layout
  const excludedRoutes = ["/login", "/register", "/404"];
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
