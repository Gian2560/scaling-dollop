"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Snackbar, Alert, IconButton, Badge } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

export default function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState([]); // Cola de notificaciones
  const [ultimaFecha, setUltimaFecha] = useState(null); // Última notificación recibida
  const router = useRouter();

  useEffect(() => {
    const fetchNotificaciones = async () => {
      try {
        const res = await fetch("/api/notificaciones"); // Polling cada 10 segundos
        if (!res.ok) throw new Error("Error al obtener notificaciones");
        const data = await res.json();

        if (data.length > 0) {
          // Filtrar solo las notificaciones NUEVAS
          const nuevasNotificaciones = data.filter(
            (notif) => !ultimaFecha || new Date(notif.fecha) > new Date(ultimaFecha)
          );

          if (nuevasNotificaciones.length > 0) {
            setNotificaciones((prev) => [...prev, ...nuevasNotificaciones].slice(-5)); // Máximo 5 notificaciones
            setUltimaFecha(nuevasNotificaciones[nuevasNotificaciones.length - 1].fecha); // Guardar última fecha
          }
        }
      } catch (error) {
        console.error("❌ Error en polling de notificaciones:", error);
      }
    };

    fetchNotificaciones(); // Primera carga
    const interval = setInterval(fetchNotificaciones, 10000); // Polling cada 10s

    return () => clearInterval(interval); // Limpieza al desmontar
  }, [ultimaFecha]);

  // Función para eliminar automáticamente la notificación más antigua
  useEffect(() => {
    if (notificaciones.length > 0) {
      const timer = setTimeout(() => {
        setNotificaciones((prev) => prev.slice(1)); // Elimina la más antigua
      }, 5000); // Se elimina después de 5s
      return () => clearTimeout(timer);
    }
  }, [notificaciones]);

  const handleClick = (url) => {
    if (url) router.push(url);
  };

  const handleRedirectToAvisos = () => {
    router.push("/avisos");
  };

  return (
    <>
      {/* 🔹 Redirige a la página de avisos al hacer clic en la campanita */}
      <IconButton color="inherit" onClick={handleRedirectToAvisos}>
        <Badge badgeContent={notificaciones.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      {notificaciones.map((noti, index) => (
        <Snackbar
          key={index}
          open={true}
          autoHideDuration={5000}
          onClose={() => setNotificaciones((prev) => prev.filter((_, i) => i !== index))}
          anchorOrigin={{ vertical: "top", horizontal: "right" }} // Posición en la pantalla
          style={{ top: `${index * 60}px`, transition: "top 0.5s ease-in-out" }} // 🔹 Apila dinámicamente
        >
          <Alert
            severity="info"
            onClick={() => handleClick(noti.url)}
            style={{ cursor: "pointer" }}
          >
            {noti.mensaje}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
}
