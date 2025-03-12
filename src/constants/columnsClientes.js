import { Button, Menu, MenuItem, IconButton, Chip } from "@mui/material";
import { useState } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useRouter } from "next/navigation";
import ActionButton from "@/app/components/ActionButton";

// 🔹 Función para estilizar etiquetas de estado
const getEstadoStyle = (estado) => {
  const styles = {
    "INTERESADO": { color: "rgba(255, 152, 0, 0.9)", backgroundColor: "rgba(255, 235, 59, 0.3)", fontWeight: "normal" },
    "EN SEGUIMIENTO": { color: "rgba(33, 150, 243, 0.9)", backgroundColor: "rgba(33, 150, 243, 0.3)", fontWeight: "normal" },
    "NO INTERESADO": { color: "rgba(244, 67, 54, 0.9)", backgroundColor: "rgba(244, 67, 54, 0.3)", fontWeight: "normal" },
    "PROMESA DE PAGO": { color: "rgba(255, 152, 0, 0.9)", backgroundColor: "rgba(255, 152, 0, 0.3)", fontWeight: "normal" },
    "FINALIZADO": { color: "rgba(76, 175, 80, 0.9)", backgroundColor: "rgba(76, 175, 80, 0.3)", fontWeight: "normal" },
  };

  return styles[estado?.toUpperCase()] || { color: "rgba(224, 224, 224, 0.9)", backgroundColor: "rgba(224, 224, 224, 0.3)", fontWeight: "normal" };
};

const getMotivoStyle = (motivo) => {
  const styles = {
    "MALA INFORMACIÓN": { color: "rgba(255, 152, 0, 0.9)", backgroundColor: "rgba(255, 235, 59, 0.3)", fontWeight: "normal" },
    "ADMINISTRATIVO": { color: "rgba(33, 150, 243, 0.9)", backgroundColor: "rgba(33, 150, 243, 0.3)", fontWeight: "normal" },
    "OLVIDO DE PAGO": { color: "rgba(244, 67, 54, 0.9)", backgroundColor: "rgba(244, 67, 54, 0.3)", fontWeight: "normal" },
    "DESCONOCIDO": { color: "rgba(255, 152, 0, 0.9)", backgroundColor: "rgba(255, 152, 0, 0.3)", fontWeight: "normal" },
    "ECONOMICO": { color: "rgba(76, 175, 80, 0.9)", backgroundColor: "rgba(76, 175, 80, 0.3)", fontWeight: "normal" },
  };

  return styles[motivo?.toUpperCase()] || { color: "rgba(224, 224, 224, 0.9)", backgroundColor: "rgba(224, 224, 224, 0.3)", fontWeight: "normal" };
};

export const columnsClientes = (edit, conversacion) => [
  { field: "nombre", headerName: "Nombre", flex: 1, minWidth: 150 },
  { field: "celular", headerName: "Teléfono", flex: 1, minWidth: 120 },

  {
    field: "estado",
    headerName: "Estado",
    flex: 1,
    minWidth: 120,
    renderCell: (params) => (
      <Chip
        label={params.value}
        sx={{
          color: getEstadoStyle(params.value).color,
          backgroundColor: getEstadoStyle(params.value).backgroundColor,
          fontWeight: "bold",
        }}
      />
    ),
  },
  {
    field: "motivo",
    headerName: "Motivo",
    flex: 1,
    minWidth: 100,
    renderCell: (params) => (
      <Chip
        label={params.value}
        sx={{
          color: getMotivoStyle(params.value).color,
          backgroundColor: getMotivoStyle(params.value).backgroundColor,
          fontWeight: "bold",
        }}
      />
    ),
  },

  {
    field: "accion",
    headerName: "Acción Comercial",
    flex: 1,
    minWidth: 150,
    renderCell: (params) => (
      <Chip
        label={params.value || "Sin acción"} // Si es null, mostrar "Sin acción"
        sx={{
          backgroundColor: params.value ? "#FFF9C4" : "#E0E0E0", // Amarillo claro si hay acción, gris si no
          color: "black",
          fontWeight: "bold",
        }}
      />
    ),
  },

  {
    field: "gestor",
    headerName: "Gestor",
    flex: 1,
    minWidth: 150,
    renderCell: (params) => (
      <Chip
        label={params.value || "Sin asignar"} // Si es null, mostrar "Sin gestor asignado"
        sx={{
          backgroundColor: params.value ? "#B3E5FC" : "#E0E0E0", // Azul claro si hay gestor, gris si no
          color: "black",
          fontWeight: "bold",
        }}
      />
    ),
  },

  {
    field: "acciones",
    headerName: "Acciones",
    flex: 1,
    renderCell: (params) => {
      const router = useRouter();

      return (
        <ActionButton
          options={[
            { label: "Acción Comercial", action: () => edit(params.row) },
            { label: "Ver Conversación", action: () => conversacion(params.row.id) },
            { label: "Ver Detalle", action: () => router.push(`/clientes/${params.row.id}`) },
          ]}
        />
      );
    },
  },
];
