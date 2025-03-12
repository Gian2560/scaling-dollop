"use client";

import React, { useRef, useState } from "react";
import { Box, Snackbar, Alert, Typography, Button } from "@mui/material";
import CalendarView from "../components/CalendarView";
import usePromesasPago from "@/hooks/usePromesasPago";

const PromesasPagoPage = () => {
  const { promesas, loading, fetchPromesasPago, error } = usePromesasPago();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const calendarRef = useRef(null);

  // Función para actualizar los datos
  const handleRefresh = () => {
    fetchPromesasPago();
    setSnackbarMessage("Datos actualizados");
    setSnackbarSeverity("success");
    setOpenSnackbar(true);
  };

  return (
    <Box sx={{ height: "auto", backgroundColor: "#F7FAFC", p: 3, overflow: "hidden" }}>
      {/* Título y subtítulo */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ fontWeight: "bold", color: "#333" }}  // Definir color del título
        >
          Promesas de Pago
        </Typography>
        <Typography 
          variant="body1" 
          color="textSecondary"  // Definir color para el subtítulo
          sx={{ color: "#555" }} // Color más suave para el subtítulo
        >
        </Typography>
      </Box>

      {/* Botón de actualización */}
      <Box sx={{ mb: 3 }}>
      <Button 
  variant="contained" 
  onClick={handleRefresh} 
  sx={{ 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    padding: "8px 20px", 
    borderRadius: "2px",  // Aumenta el radio de los bordes para un diseño más suave
    boxShadow: 3,  // Un poco más de sombra para darle un toque moderno
    textTransform: "none",  // Evitar que el texto se convierta en mayúsculas
    backgroundColor: "#007391",  // El color principal de tu diseño (ajústalo según tu paleta)
    "&:hover": { 
      backgroundColor: "#005c6b",  // Un tono más oscuro para el hover
      boxShadow: 6,  // Efecto de sombra más fuerte cuando se pasa el ratón
    },
    color: "#fff",  // Texto blanco para un buen contraste con el fondo
    transition: "all 0.3s ease-in-out",  // Suaviza la transición entre estados
  }}
>
  Actualizar 
</Button>

      </Box>

      {/* Vista del calendario */}
      <CalendarView calendarRef={calendarRef} events={promesas} loading={loading} />

      {/* Snackbar para mostrar el mensaje de éxito o error */}
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={4000} 
        onClose={() => setOpenSnackbar(false)}>
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={snackbarSeverity} 
          sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PromesasPagoPage;
