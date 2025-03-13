import { Button, Menu, MenuItem, IconButton, Chip } from "@mui/material";
import { useState } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useRouter } from "next/navigation";
import ActionButton from "@/app/components/ActionButton";

// 🔹 Función para estilizar etiquetas de estado
const getEstadoStyle = (estado) => {
  const styles = {
    "EN SEGUIMIENTO": { color: "#1565C0", backgroundColor: "#BBDEFB", fontWeight: "bold" }, // Azul medio
    "INTERESADO": { color: "#8C6E11", backgroundColor: "#FFECB3", fontWeight: "bold" }, // Amarillo suave
    "NO INTERESADO": { color: "#B71C1C", backgroundColor: "#FFCDD2", fontWeight: "bold" }, // Rojo suave
    "PROMESA DE PAGO": { color: "#2E7D32", backgroundColor: "#C8E6C9", fontWeight: "bold" }, // Verde suave
    "FINALIZADO": { color: "#5E35B1", backgroundColor: "#D1C4E9", fontWeight: "bold" }, // Morado claro
  };

  return styles[estado?.toUpperCase()] || { color: "#616161", backgroundColor: "#E0E0E0", fontWeight: "bold" }; // Gris neutro más suave
};


// 🔹 Función para estilizar etiquetas de motivo
const getMotivoStyle = (motivo) => {
  const styles = {
    "ECONOMICO": { color: "#D84315", backgroundColor: "#FFCCBC", fontWeight: "bold" }, // Naranja suave
    "MALA INFORMACION": { color: "#6A1B9A", backgroundColor: "#E1BEE7", fontWeight: "bold" }, // Lila suave
    "ADMINISTRATIVO": { color: "#795548", backgroundColor: "#D7CCC8", fontWeight: "bold" }, // Marrón suave
    "OLVIDO DE PAGO": { color: "#8D6E63", backgroundColor: "#FFECB3", fontWeight: "bold" }, // Amarillo pastel
  };

  return styles[motivo?.toUpperCase()] || { color: "#757575", backgroundColor: "#E0E0E0", fontWeight: "bold" }; // Gris neutro más suave
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
          width: "120px", // Hace que todos tengan el mismo ancho
          justifyContent: "center", // Centra el texto dentro del Chip
        }}
      />
    ),
  },
  {
    field: "motivo",
    headerName: "Motivo",
    flex: 1,
    minWidth: 120,
    renderCell: (params) => (
      <Chip
        label={params.value}
        sx={{
          color: getMotivoStyle(params.value).color,
          backgroundColor: getMotivoStyle(params.value).backgroundColor,
          fontWeight: "bold",
          width: "120px", // Hace que todos tengan el mismo ancho
          justifyContent: "center", // Centra el texto dentro del Chip
        }}
      />
    ),
  },
  
  
  { field: "accion", headerName: "Acción Comercial", flex: 1, minWidth: 120 },

  { field: "gestor", headerName: "Gestor", flex: 1, minWidth: 120 },

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
