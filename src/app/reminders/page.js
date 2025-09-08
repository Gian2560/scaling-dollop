"use client";

import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Switch,
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useRouter } from 'next/navigation';
import axiosInstance from "../../../services/api";
import { getCampaigns } from "../../../services/campaignService";
const colors = {
  primaryBlue: "#007391",
  darkBlue: "#254e59",
  white: "#fff",
  errorRed: "#E53E3E",
  successGreen: "#38A169",
  warningYellow: "#D69E2E",
  lightBlueBg: "#E3F2FD",
};

export default function CampaignScheduler() {
  const [campaigns, setCampaigns] = useState([]);
  const [filterDatabase, setFilterDatabase] = useState("");
  const [filterSegmento, setFilterSegmento] = useState("");
  const [filterCluster, setFilterCluster] = useState("");
  const [filterEstrategia, setFilterEstrategia] = useState("");
  const [filterActivo, setFilterActivo] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editCampaign, setEditCampaign] = useState(null);
  const [editFecha, setEditFecha] = useState(dayjs());
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailCampaign, setDetailCampaign] = useState(null);
  const router = useRouter();

  // Cargar las campañas desde la API usando Axios
  const fetchCampaigns = async () => {
    try {
      const response = await getCampaigns(); // Ajusta la ruta según tu API
      console.log("Campañas obtenidas:", response.data);
      setCampaigns(response.data); // Asignamos las campañas obtenidas
    } catch (error) {
      console.error("Error al obtener campañas:", error);
    }
  };

  useEffect(() => {
    fetchCampaigns(); // Llamar la función para cargar las campañas cuando el componente se monta
  }, []);

  // Filtrar las campañas
  const filteredCampaigns = campaigns.filter((c) => {
    if (filterDatabase && c.database !== filterDatabase) return false;
    if (filterSegmento && c.segmento !== filterSegmento) return false;
    if (filterCluster && c.cluster !== filterCluster) return false;
    if (filterEstrategia && c.estrategia !== filterEstrategia) return false;
    if (filterActivo) {
      if (filterActivo === "Activo" && !c.activo) return false;
      if (filterActivo === "Inactivo" && c.activo) return false;
    }
    return true;
  });

  // Columnas para la tabla
  const columns = [
    { field: "name", headerName: "Nombre Campaña", flex: 1, headerAlign: "center", align: "left" },
    { field: "database", headerName: "Base de Datos", width: 130, headerAlign: "center", align: "center" },
    { field: "segmento", headerName: "Segmento", width: 130, headerAlign: "center", align: "center" },
    { field: "cluster", headerName: "Cluster", width: 110, headerAlign: "center", align: "center" },
    { field: "estrategia", headerName: "Estrategia", width: 130, headerAlign: "center", align: "center" },
    {
      field: "fecha",
      headerName: "Fecha y Hora",
      width: 180,
      headerAlign: "center",
      align: "center",
      valueFormatter: (params) => dayjs(params.value).format("YYYY-MM-DD HH:mm"),
    },
    {
      field: "estado",
      headerName: "Estado",
      width: 120,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const color = params.value === "Programado" ? "primary" : "default";
        return <Chip label={params.value} color={color} size="small" />;
      },
    },
    {
      field: "activo",
      headerName: "Activo",
      width: 100,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Switch
          checked={params.value}
          onChange={() => handleToggleActivo(params.row.id)}
          color="primary"
        />
      ),
      sortable: false,
      filterable: false,
    },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 140,
      headerAlign: "center",
      align: "center",
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <>
          <IconButton
            color="primary"
            onClick={() => router.push(`/reminders/${params.id}`)}
            aria-label="Ver detalle"
            size="small"
          >
            <VisibilityIcon />
          </IconButton>
          <IconButton
            color="primary"
            onClick={() => handleOpenEdit(params.row)}
            aria-label="Editar fecha y hora"
            size="small"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDelete(params.row.id)}
            aria-label="Eliminar campaña"
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  const handleDelete = (id) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  };

  const handleToggleActivo = (id) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, activo: !c.activo } : c))
    );
  };

  const handleOpenEdit = (campaign) => {
    setEditCampaign(campaign);
    setEditFecha(campaign.fecha);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === editCampaign.id ? { ...c, fecha: editFecha } : c))
    );
    setEditDialogOpen(false);
  };

  const handleOpenDetail = (campaign) => {
    setDetailCampaign(campaign);
    setDetailDialogOpen(true);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" color={colors.darkBlue} fontWeight="700" gutterBottom textAlign="center">
        Gestión de Campañas y Recordatorios
      </Typography>

      {/* FILTROS */}
      {/* Filtros aquí... */}

      {/* TABLA DE CAMPAÑAS */}
      <Paper
        sx={{
          height: 520,
          borderRadius: 3,
          boxShadow: 4,
          bgcolor: colors.white,
          px: 2, // padding horizontal para que no quede tan pegado
          py: 1,
        }}
      >
        <DataGrid
          rows={filteredCampaigns}
          columns={columns}
          pageSizeOptions={[5, 10, 25]}
          initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
          disableRowSelectionOnClick
          paginationModel={{ pageSize: 5, page: 0 }}
          pagination
          sx={{
            borderRadius: 3,
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: colors.lightBlueBg,
              color: colors.darkBlue,
              fontWeight: "700",
            },
            "& .MuiDataGrid-cell": {
              color: colors.darkBlue,
              fontWeight: 600,
            },
            "& .MuiTablePagination-root": {
              color: colors.darkBlue,
            },
          }}
        />
      </Paper>

      {/* MODAL EDITAR FECHA/HORA */}
      {/* Modal para editar fecha... */}

      {/* BOTÓN AGREGAR NUEVA CAMPAÑA */}
      <Box textAlign="center" mt={4} onClick={() => router.push('reminders/new')} >
        <Button variant="contained" color="primary" size="large">
          + Nueva Campaña
        </Button>
      </Box>
    </Container>
  );
}
