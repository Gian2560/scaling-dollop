import ActionButton from "@/app/components/ActionButton";
import { useRouter } from "next/navigation";
import { Box } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";

export const CAMPAIGN_COLUMNS = (onEdit, onDelete) => [
  {
    field: "id",
    headerName: "ID",
    width: 80,
    headerClassName: "header-cell",
    cellClassName: "data-cell",
    renderCell: (params) => (
      <Box sx={{
        textAlign: 'center', 
        padding: '8px', 
        fontWeight: 'bold', 
        color: '#254e59',
        backgroundColor: '#f1f8e9', // Fondo sutil
        borderRadius: '4px',
      }}>
        {params.value}
      </Box>
    ),
  },
  {
    field: "nombre_campanha",
    headerName: "Nombre",
    width: 200,
    renderCell: (params) => (
      <Box sx={{
        textAlign: 'center', 
        padding: '8px', 
        color: '#333',
        backgroundColor: '#ffffff',
        borderRadius: '4px',
        '&:hover': {
          backgroundColor: '#f4f4f4',
        },
      }}>
        {params.value}
      </Box>
    ),
  },
  {
    field: "descripcion",
    headerName: "Descripción",
    width: 250,
    renderCell: (params) => (
      <Box sx={{
        textAlign: 'center', 
        padding: '8px', 
        color: '#333',
        backgroundColor: '#ffffff',
        borderRadius: '4px',
        '&:hover': {
          backgroundColor: '#f4f4f4',
        },
      }}>
        {params.value}
      </Box>
    ),
  },
  {
    field: "estado_campanha",
    headerName: "Estado",
    width: 100,
    renderCell: (params) => (
      <Box sx={{
        textAlign: 'center', 
        padding: '8px', 
        fontWeight: 'bold', 
        color: '#388e3c',
        backgroundColor: '#e8f5e9', // Fondo verde sutil
        borderRadius: '4px',
      }}>
        {params.value}
      </Box>
    ),
  },
  {
    field: "fecha_creacion",
    headerName: "Fecha creación",
    width: 200,
    renderCell: (params) => (
      <Box sx={{
        textAlign: 'center', 
        padding: '8px', 
        color: '#333',
        backgroundColor: '#ffffff',
        borderRadius: '4px',
        '&:hover': {
          backgroundColor: '#f4f4f4',
        },
      }}>
        {params.value}
      </Box>
    ),
  },
  {
    field: "acciones",
    headerName: "Acciones",
    width: 180,
    renderCell: (params) => {
      const router = useRouter();
      return (
        <ActionButton
          options={[
            {
              label: "Editar",
              action: () => onEdit(params.row),
              color: "#007391", // Azul claro
              sx: { 
                backgroundColor: "#007391", 
                "&:hover": { backgroundColor: "#005c6b" }, 
                color: "#fff",
                padding: "6px 12px",
                borderRadius: "8px", // Bordes redondeados
                marginRight: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)", // Sombra sutil
                transition: "all 0.3s ease-in-out",
              },
              icon: <EditIcon sx={{ color: "#fff" }} />,
            },
            {
              label: "Detalle",
              action: () => router.push(`/campaigns/${params.row.id}`),
              color: "#388e3c", // Verde
              sx: { 
                backgroundColor: "#388e3c", 
                "&:hover": { backgroundColor: "#00600f" }, 
                color: "#fff",
                padding: "6px 12px",
                borderRadius: "8px",
                marginRight: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                transition: "all 0.3s ease-in-out",
              },
              icon: <VisibilityIcon sx={{ color: "#fff" }} />,
            },
            {
              label: "Eliminar",
              action: () => onDelete(params.row.id),
              color: "#D32F2F", // Rojo
              sx: { 
                backgroundColor: "#D32F2F", 
                "&:hover": { backgroundColor: "#9A0007" }, 
                color: "#fff",
                padding: "6px 12px",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                transition: "all 0.3s ease-in-out",
              },
              icon: <DeleteIcon sx={{ color: "#fff" }} />,
            },
          ]}
        />
      );
    },
  },
];
