"use client";

import { useParams } from "next/navigation";
import { useClienteDetalle } from "@/hooks/useClienteDetalle";
import { Typography, Box, Tabs, Tab, Divider, Card, CardContent, CircularProgress } from "@mui/material";
import ConversationModal from "@/app/components/ConversationModal";
import { useState } from "react";
import Historico from "@/app/components/Historico";

export default function ClienteDetallePage() {
  const { id } = useParams();
  const {
    cliente,
    loading,
    conversationData,
    conversationLoading,
    selectedConversation,
    setSelectedConversation,
    loadConversacion,
  } = useClienteDetalle(id);

  const [tab, setTab] = useState(0);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!cliente) {
    return (
      <Box textAlign="center" mt={5}>
        <Typography variant="h5" sx={{ color: "#ff4d4d" }}>❌ Cliente no encontrado.</Typography>
      </Box>
    );
  }

  return (
    <Box p={4} sx={{ maxWidth: "900px", margin: "auto", bgcolor: "#F7FAFC", borderRadius: 3, boxShadow: 3 }}>
      {/* 🔹 ENCABEZADO */}
      <Box textAlign="center" mb={3} p={2} sx={{ bgcolor: "#007391", color: "white", borderRadius: 2 }}>
        <Typography variant="h4" fontWeight="bold">{cliente.nombre}</Typography>
        <Typography variant="subtitle1">📞 {cliente.celular}</Typography>
      </Box>

      {/* 🔹 PESTAÑAS DE NAVEGACIÓN */}
      <Tabs
  value={tab}
  onChange={(_, newValue) => setTab(newValue)}
  sx={{
    bgcolor: "#007391", // Fondo de pestañas
    borderRadius: 2,
    "& .MuiTab-root": {
      color: "white", // Color de texto en pestañas inactivas
      fontWeight: "bold",
      textTransform: "none",
    },
    "& .Mui-selected": {
      color: "#ffcc00", // Color cuando la pestaña está activa
      backgroundColor: "#005c6b", // Fondo de la pestaña activa
      borderRadius: "10px 10px 0 0",
    },
    "& .MuiTabs-indicator": {
      backgroundColor: "#ffcc00", // Color del subrayado de la pestaña activa
    },
  }}
  centered
>
  <Tab label="Información General" />
  <Tab label="Conversaciones" onClick={loadConversacion} />
</Tabs>

      {/* 🔹 CONTENIDO DE LAS PESTAÑAS */}
      {tab === 0 && (
        <Box mt={3}>
          <Typography variant="h5" fontWeight="bold" sx={{ color: "#005c6b" }}>📌 Información General</Typography>
          <Divider sx={{ my: 1, backgroundColor: "#005c6b" }} />

          <Card sx={{ bgcolor: "white", boxShadow: 2, mt: 2 }}>
            <CardContent>
              <Typography sx={{ color: "#007391", fontWeight: "bold" }}>📞 Numero de celular:</Typography>
              <Typography>{cliente.celular|| "No registrado"}</Typography>

              <Divider sx={{ my: 1 }} />

              <Typography sx={{ color: "#007391", fontWeight: "bold" }}>🤖 Última Interacción con el Bot:</Typography>
              <Typography>{cliente.fecha_ultima_interaccion_bot || "No disponible"}</Typography>

              <Divider sx={{ my: 1 }} />

              <Typography sx={{ color: "#007391", fontWeight: "bold" }}>📝 Observaciones:</Typography>
              <Typography>{cliente.observaciones || "Sin observaciones"}</Typography>
            </CardContent>
          </Card>
        </Box>
      )}
      <Historico  clienteId={id} />

      {/* 🔹 MODAL DE CONVERSACIONES */}
      {tab === 1 && (
        <ConversationModal
          open={true}
          conversationData={conversationData}
          conversationLoading={conversationLoading}
          selectedConversation={selectedConversation}
          setSelectedConversation={setSelectedConversation}
          onClose={() => setTab(0)}
        />
      )}
    </Box>
  );
}
