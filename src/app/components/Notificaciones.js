"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Snackbar, Alert, IconButton, Badge } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

export default function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState([]); // Cola de notificaciones
  const router = useRouter();

  useEffect(() => {
    const eventSource = new EventSource("/api/notificaciones");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      setNotificaciones((prev) => {
        // Limitar a un máximo de 5 notificaciones en la cola
        const nuevasNotificaciones = [...prev, data].slice(-5);
        return nuevasNotificaciones;
      });
    };

    eventSource.onerror = () => {
      console.error("❌ Error en la conexión SSE.");
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const handleClose = (index) => {
    setNotificaciones((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClick = (url, index) => {
    router.push(url);
    handleClose(index);
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
          onClose={() => handleClose(index)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }} // Posición en la pantalla
          style={{ top: `${index * 60}px` }} // 🔹 Apila notificaciones dinámicamente
        >
          <Alert
            severity="info"
            onClick={() => handleClick(noti.url, index)}
            style={{ cursor: "pointer" }}
          >
            {noti.mensaje}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
}
