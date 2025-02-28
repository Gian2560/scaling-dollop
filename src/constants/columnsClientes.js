import { Button, Menu, MenuItem, IconButton, Chip } from "@mui/material";
import { useState } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useRouter } from "next/navigation";
import ActionButton from "@/app/components/ActionButton";
// 🔹 Función para estilizar etiquetas de estado
// 🔹 Función para estilizar etiquetas de estado
const getEstadoStyle = (estado) => {
  const styles = {
    "INTERESADO": { 
      color: "rgba(255, 152, 0, 0.9)", // Naranja intenso
      backgroundColor: "rgba(255, 235, 59, 0.3)", // Amarillo claro
      fontWeight: "normal" 
    },
    "EN SEGUIMIENTO": { 
      color: "rgba(33, 150, 243, 0.9)", // Azul intenso
      backgroundColor: "rgba(33, 150, 243, 0.3)", // Azul claro
      fontWeight: "normal" 
    },
    "NO INTERESADO": { 
      color: "rgba(244, 67, 54, 0.9)", // Rojo intenso
      backgroundColor: "rgba(244, 67, 54, 0.3)", // Rojo claro
      fontWeight: "normal" 
    },
    "PROMESA DE PAGO": { 
      color: "rgba(255, 152, 0, 0.9)", // Naranja intenso
      backgroundColor: "rgba(255, 152, 0, 0.3)", // Naranja claro
      fontWeight: "normal" 
    },
    "FINALIZADO": { 
      color: "rgba(76, 175, 80, 0.9)", // Verde intenso
      backgroundColor: "rgba(76, 175, 80, 0.3)", // Verde claro
      fontWeight: "normal" 
    },
  };

  return styles[estado.toUpperCase()] || { 
    color: "rgba(224, 224, 224, 0.9)", // Gris intenso
    backgroundColor: "rgba(224, 224, 224, 0.3)", // Gris claro
    fontWeight: "normal" 
  };
};

const getMotivoStyle = (motivo) => {
  const styles = {
    "MALA INFORMACIÓN": { 
      color: "rgba(255, 152, 0, 0.9)", // Naranja intenso
      backgroundColor: "rgba(255, 235, 59, 0.3)", // Amarillo claro
      fontWeight: "normal" 
    },
    "ADMINISTRATIVO": { 
      color: "rgba(33, 150, 243, 0.9)", // Azul intenso
      backgroundColor: "rgba(33, 150, 243, 0.3)", // Azul claro
      fontWeight: "normal" 
    },
    "OLVIDO DE PAGO": { 
      color: "rgba(244, 67, 54, 0.9)", // Rojo intenso
      backgroundColor: "rgba(244, 67, 54, 0.3)", // Rojo claro
      fontWeight: "normal" 
    },
    "DESCONOCIDO": { 
      color: "rgba(255, 152, 0, 0.9)", // Naranja intenso
      backgroundColor: "rgba(255, 152, 0, 0.3)", // Naranja claro
      fontWeight: "normal" 
    },
    "ECONÓMICO": { 
      color: "rgba(76, 175, 80, 0.9)", // Verde intenso
      backgroundColor: "rgba(76, 175, 80, 0.3)", // Verde claro
      fontWeight: "normal" 
    },
  };

  return styles[motivo.toUpperCase()] || { 
    color: "rgba(224, 224, 224, 0.9)", // Gris intenso
    backgroundColor: "rgba(224, 224, 224, 0.3)", // Gris claro
    fontWeight: "normal" 
  };
};


  

export const columnsClientes = (edit, conversacion)=> [
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


  /*{
    field: "score",
    headerName: "Score",
    flex: 1,
    minWidth: 100,
    renderCell: (params) => (
      <Chip
        label={params.value}
        sx={{
          backgroundColor: "#FFEB3B",
          color: "black",
          fontWeight: "bold",
        }}
      />
    ),
  },*/
  /*
  {
    field: "bound",
    headerName: "Bound",
    flex: 1,
    minWidth: 100,
    renderCell: (params) => (
      <span style={{ fontWeight: "bold", color: params.value === "INBOUND" ? "#2E7D32" : "#D32F2F" }}>
        {params.value}
      </span>
    ),
  },*/

  { field: "gestor", headerName: "Gestor", flex: 1, minWidth: 150 },

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
