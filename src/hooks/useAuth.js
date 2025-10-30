// import { useSession, signOut } from "next-auth/react";
// import { useEffect } from "react";

// /**
//  * Hook personalizado para manejar autenticación y roles.
//  */
// export function useAuth() {
//   const { data: session, status } = useSession();

//   useEffect(() => {
//     if (session?.user?.token) {
//       const tokenExp = JSON.parse(atob(session.user.token.split(".")[1])).exp * 1000;
//       const currentTime = Date.now();

//       if (currentTime >= tokenExp) {
//         console.log("🔄 Token expirado. Cerrando sesión.");
//         signOut(); // 🔹 Cierra sesión automáticamente
//       }
//     }
//   }, [session]);

//   return {
//     isAuthenticated: status === "authenticated",
//     userRole: session?.user?.role || "guest",
//     loading: status === "loading",
//   };
// }
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

export function useAuth() {
  const { data: session, status } = useSession();

  // useEffect(() => {
  //   // Opción A: usar session.expires de NextAuth
  //   const expIso = session?.expires;
  //   const expMs = expIso ? new Date(expIso).getTime() : null;

  //   // O, si prefieres, usa el timestamp que mandamos:
  //   // const expMs = session?.expiresAt ? Number(session.expiresAt) : null;

  //   if (!expMs) return;

  //   const id = setInterval(() => {
  //     if (Date.now() >= expMs) {
  //       console.log("🔄 Sesión expirada. Cerrando sesión.");
  //       signOut();
  //     }
  //   }, 30000); // revisa cada 30s

  //   return () => clearInterval(id);
  // }, [session?.expires, session?.expiresAt]);

  return {
    isAuthenticated: status === "authenticated",
    userRole: (session && session.user && session.user.role) || "guest",
    loading: status === "loading",
  };
}
