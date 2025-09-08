"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  Button,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const colors = {
  primaryBlue: "#007391",
  darkBlue: "#254e59",
  yellowAccent: "#FFD54F",
  lightBlueBg: "#E3F2FD",
  white: "#fff",
  errorRed: "#E53E3E",
  successGreen: "#38A169",
  warningYellow: "#D69E2E",
};

const clientsData = [
  { id: 1, name: "Juan Pérez", phone: "+51987654321", status: "Enviado" },
  { id: 2, name: "María López", phone: "+51912345678", status: "Error" },
  { id: 3, name: "Carlos Ruiz", phone: "+51987651234", status: "Pendiente" },
  { id: 4, name: "Ana Torres", phone: "+51911223344", status: "Enviado" },
  { id: 5, name: "Luis García", phone: "+51999887766", status: "Error" },
  { id: 6, name: "Sofía Martínez", phone: "+51988776655", status: "Pendiente" },
  { id: 7, name: "Pedro Alvarez", phone: "+51933445566", status: "Enviado" },
  { id: 8, name: "Lucía Vega", phone: "+51944556677", status: "Error" },
  { id: 9, name: "Diego Morales", phone: "+51955667788", status: "Enviado" },
  { id: 10, name: "Marta Díaz", phone: "+51966778899", status: "Pendiente" },
];

export default function CampaignDetail() {
  // Simulación de datos campaña (puede venir de props o fetch)
  const campaign = {
    name: "Campaña Mayo 2025",
    database: "Database1",
    columns: ["Name", "Segment", "Cluster", "Strategy"],
    template: "Template 1",
    clientSegment: "Segment 2",
    cluster: "Cluster 1",
    strategy: "Strategy 2",
    variable1: "Variable 1",
    variable2: "Variable 3",
    sendDate: new Date("2025-05-30"),
    sendTime: "10:30 AM",
  };

  const [statusFilter, setStatusFilter] = useState("Todos");
  const [page, setPage] = useState(0); // 0-based
  const [pageSize, setPageSize] = useState(5);
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(clientsData.length);

  useEffect(() => {
    let filtered = clientsData;
    if (statusFilter !== "Todos") {
      filtered = clientsData.filter((c) => c.status === statusFilter);
    }
    setRowCount(filtered.length);

    // Paginamos slice (en real backend, enviar page y pageSize)
    const paged = filtered.slice(page * pageSize, page * pageSize + pageSize);
    setRows(paged);
  }, [statusFilter, page, pageSize]);

  const columns = [
    { field: "name", headerName: "Cliente", flex: 1, headerAlign: "center", align: "left" },
    { field: "phone", headerName: "Teléfono", flex: 1, headerAlign: "center", align: "left" },
    {
      field: "status",
      headerName: "Estado de Envío",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Chip
          label={params.value}
          sx={{
            backgroundColor: statusColor(params.value),
            color: "white",
            fontWeight: "700",
            minWidth: 90,
            justifyContent: "center",
          }}
        />
      ),
      sortable: false,
      filterable: false,
    },
  ];

  // Color para estados
  function statusColor(status) {
    switch (status) {
      case "Enviado":
        return colors.successGreen;
      case "Error":
        return colors.errorRed;
      case "Pendiente":
        return colors.warningYellow;
      default:
        return colors.darkBlue;
    }
  }

  // Función botón enviar campaña
  const handleSendCampaign = () => {
    alert(`Enviando campaña: "${campaign.name}" a ${rowCount} clientes...`);
    // Aquí tu lógica real para enviar la campaña
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography
        variant="h3"
        color={colors.primaryBlue}
        fontWeight="700"
        gutterBottom
        textAlign="center"
      >
        Detalle de Campaña
      </Typography>

      <Paper sx={{ p: 4, mb: 5, borderRadius: 3, boxShadow: 4, bgcolor: colors.white }}>
        <Typography variant="h5" fontWeight="700" mb={3} color={colors.darkBlue}>
          Información General
        </Typography>
        <Grid container spacing={3}>
          {Object.entries(campaign).map(([key, value]) => {
            if (key === "sendDate" && value)
              value = value.toLocaleDateString();
            if (key === "sendTime" && value)
              value = value; // ya string
            const label = key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase());
            const displayValue = Array.isArray(value) ? value.join(", ") : value;

            return (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <Typography variant="subtitle2" color={colors.primaryBlue} fontWeight={600}>
                  {label}
                </Typography>
                <Typography variant="body1" color={colors.darkBlue} fontWeight={500}>
                  {displayValue || "-"}
                </Typography>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 4, bgcolor: colors.white }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems="center"
          mb={3}
          spacing={2}
        >
          <Typography variant="h5" fontWeight="700" color={colors.darkBlue}>
            Clientes y Estado de Envío
          </Typography>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Filtrar Estado</InputLabel>
            <Select
              value={statusFilter}
              label="Filtrar Estado"
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              sx={{ fontWeight: 600 }}
            >
              <MenuItem value="Todos">Todos</MenuItem>
              <MenuItem value="Enviado">Enviados</MenuItem>
              <MenuItem value="Error">Errores</MenuItem>
              <MenuItem value="Pendiente">Pendientes</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Box sx={{ height: 450, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={pageSize}
            rowsPerPageOptions={[5, 10, 25]}
            rowCount={rowCount}
            paginationMode="server"
            onPageChange={(newPage) => setPage(newPage)}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(0);
            }}
            page={page}
            disableSelectionOnClick
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
              "& .MuiChip-root": {
                fontWeight: 700,
              },
            }}
          />
        </Box>

        {/* Botón Enviar Campaña */}
        <Box textAlign="center" mt={4}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSendCampaign}
          >
            Enviar Campaña
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
