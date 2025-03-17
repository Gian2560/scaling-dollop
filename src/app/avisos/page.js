"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Typography, List, ListItem, ListItemText, Divider, Paper, Button, Box } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

export default function Avisos() {
  const [notificaciones, setNotificaciones] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchNotificaciones = async () => {
      const res = await fetch("/api/notificaciones/historial");
      const data = await res.json();
      setNotificaciones(data);
    };

    fetchNotificaciones();
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      {/* Encabezado */}
      <Paper elevation={3} sx={{ bgcolor: "#007391", p: 3, borderRadius: 2, textAlign: "center", color: "white" }}>
        <Typography variant="h4" fontWeight="bold">
          Notificaciones
        </Typography>
        <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
          Revisa las notificaciones recientes y accede a los clientes con promesas de pago.
        </Typography>
      </Paper>

      {/* Lista de Notificaciones */}
      <Box sx={{ mt: 4, borderRadius: 2, overflow: "hidden", bgcolor: "white", boxShadow: 2 }}>
        <List>
          {notificaciones.length > 0 ? (
            notificaciones.map((noti, index) => (
              <div key={index}>
                <ListItem
                  component="button"
                  onClick={() => router.push(`/clientes/${noti.cliente_id}`)}
                  sx={{
                    "&:hover": { bgcolor: "#f0f0f0" },
                    transition: "background 0.2s ease-in-out",
                  }}
                >
                  <NotificationsIcon sx={{ color: "#007391", mr: 2 }} />
                  <ListItemText
                    primary={
                      <Typography variant="body1" fontWeight="bold" sx={{ color: "#254e59" }}>
                        {noti.mensaje}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" sx={{ color: "#666" }}>
                        {new Date(noti.fecha).toLocaleString()}
                      </Typography>
                    }
                  />
                </ListItem>
                <Divider />
              </div>
            ))
          ) : (
            <Typography variant="body1" sx={{ textAlign: "center", p: 3, color: "#666" }}>
              No hay notificaciones recientes.
            </Typography>
          )}
        </List>
      </Box>

      {/* Botón para regresar a Home */}
      <Box textAlign="center" sx={{ mt: 4 }}>
        <Button
          variant="contained"
          sx={{
            bgcolor: "#007391",
            "&:hover": { bgcolor: "#005c6b" },
            fontWeight: "bold",
            px: 4,
            py: 1,
          }}
          onClick={() => router.push("/")}
        >
          Volver al Inicio
        </Button>
      </Box>
    </Container>
  );
}
