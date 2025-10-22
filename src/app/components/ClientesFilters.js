"use client";

import { useState } from "react";
import { TextField, MenuItem, Button, Grid, FormControl, InputLabel, Select, Box, Divider } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { es } from "date-fns/locale"; // 📌 Asegura el idioma correcto para español
import { startOfDay, endOfDay, subDays } from "date-fns";
import DownloadIcon from '@mui/icons-material/Download';

const presets = [
  { label: "Todos", value: "all" }, 
  { label: "Hoy", value: "today" },
  { label: "Últimos 7 días", value: "7" },
  { label: "Últimos 30 días", value: "30" },
  { label: "Este mes", value: "month" },
  { label: "Personalizado", value: "custom" },
];

export default function ClientesFilters({ filters, setFilters }) {
  const [preset, setPreset] = useState("all");
  const [startDate, setStartDate] = useState(startOfDay(new Date()));
  const [endDate, setEndDate] = useState(endOfDay(new Date()));
  const [exportLoading, setExportLoading] = useState(false);

  // Función para exportar clientes
  const handleExportClientes = async () => {
    setExportLoading(true);
    try {
      console.log('📥 Iniciando descarga de clientes...');
      
      const response = await fetch('/api/clientes/export');
      
      if (!response.ok) {
        throw new Error('Error al exportar clientes');
      }

      // Obtener el blob del archivo
      const blob = await response.blob();
      
      // Crear URL temporal para el archivo
      const url = window.URL.createObjectURL(blob);
      
      // Crear elemento temporal para descargar
      const link = document.createElement('a');
      link.href = url;
      
      // Obtener nombre del archivo desde el header o usar uno por defecto
      const contentDisposition = response.headers.get('Content-Disposition');
      let fileName = 'clientes_export.csv';
      
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) {
          fileName = match[1];
        }
      }
      
      link.download = fileName;
      
      // Trigger descarga
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Descarga completada');
    } catch (error) {
      console.error('❌ Error al exportar clientes:', error);
      alert('Error al exportar clientes. Por favor, intenta nuevamente.');
    } finally {
      setExportLoading(false);
    }
  };

  const handlePresetChange = (event) => {
    const value = event.target.value;
    setPreset(value);

    let newStart, newEnd;
    if (value === "today") {
      newStart = startOfDay(new Date());
      newEnd = endOfDay(new Date());
    } else if (value === "7" || value === "30") {
      newStart = startOfDay(subDays(new Date(), parseInt(value, 10)));
      newEnd = endOfDay(new Date());
    } else if (value === "month") {
      const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      newStart = startOfDay(firstDay);
      newEnd = endOfDay(new Date());
    } else if (value === "all") {
      // Si se selecciona "Todos", no se establece ningún filtro de fecha
      newStart = undefined;
      newEnd = undefined;
    } else {
      return; // Si es "custom", no cambia fechas hasta que el usuario elija
    }

    setStartDate(newStart);
    setEndDate(newEnd);
    setFilters((prev) => ({
      ...prev,
      fechaInicio: newStart ? newStart.toISOString() : "", 
      fechaFin: newEnd ? newEnd.toISOString() : "",
    }));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Grid container spacing={2} alignItems="center" sx={{ padding: 3 }}>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Buscar..."
            size="small"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            fullWidth
            variant="outlined"
            sx={{
              borderRadius: "8px",
              backgroundColor: "#f9f9f9",
            }}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            select
            label="Estado"
            size="small"
            value={filters.estado}
            onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
            fullWidth
            variant="outlined"
            sx={{
              borderRadius: "8px",
              backgroundColor: "#f9f9f9",
            }}
          >
            <MenuItem value="Todos">Todos</MenuItem>
            <MenuItem value="Interesado">Interesado</MenuItem>
            <MenuItem value="Promesa de Pago">Promesa de Pago</MenuItem>
            <MenuItem value="No interesado">No interesado</MenuItem>
            <MenuItem value="Finalizado">Finalizado</MenuItem>
            <MenuItem value="En seguimiento">En seguimiento</MenuItem>
            <MenuItem value="No contactado">No contactado</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControl fullWidth size="small" variant="outlined">
            <InputLabel>Rango de Fechas</InputLabel>
            <Select
              value={preset}
              onChange={handlePresetChange}
              label="Rango de Fechas"
              sx={{ borderRadius: "8px", backgroundColor: "#f9f9f9" }}
            >
              {presets.map((preset) => (
                <MenuItem key={preset.value} value={preset.value}>
                  {preset.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
         {/* Filtro de Acción Comercial */}
         <Grid item xs={12} sm={4}>
          <TextField
            select
            label="Acción Comercial"
            size="small"
            value={filters.accionComercial || "Todos"}
            onChange={(e) => setFilters({ ...filters, accionComercial: e.target.value })}
            fullWidth
            variant="outlined"
            sx={{
              borderRadius: "8px",
              backgroundColor: "#f9f9f9",
            }}
          >
            <MenuItem value="Todos">Todos</MenuItem>
            <MenuItem value="No interesado">No interesado</MenuItem>
            <MenuItem value="Promesa de Pago">Promesa de Pago</MenuItem>
            <MenuItem value="Volver a contactar">Volver a contactar</MenuItem>
            <MenuItem value="Pago">Pago</MenuItem>
            <MenuItem value="Sin accion comercial">Sin acción comercial</MenuItem> 
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}>
  <TextField
    select
    label="Interacción con Bot"
    size="small"
    value={filters.interaccionBot || "Todos"} // Valor por defecto "Todos"
    onChange={(e) => setFilters({ ...filters, interaccionBot: e.target.value })}
    fullWidth
    variant="outlined"
    sx={{
      borderRadius: "8px",
      backgroundColor: "#f9f9f9",
    }}
  >
    <MenuItem value="Todos">Todos</MenuItem>
    <MenuItem value="Con interacción">Con interacción</MenuItem>
    <MenuItem value="Sin interacción">Sin interacción</MenuItem>
  </TextField>
</Grid>

        {preset === "custom" && (
          <>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Fecha Inicio"
                value={startDate}
                onChange={(newValue) => {
                  setStartDate(newValue);
                  setFilters((prev) => ({
                    ...prev,
                    fechaInicio: newValue ? newValue.toISOString() : "",
                  }));
                }}
                format="dd/MM/yyyy"
                renderInput={(params) => <TextField {...params} fullWidth size="small" variant="outlined" />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Fecha Fin"
                value={endDate}
                onChange={(newValue) => {
                  setEndDate(newValue);
                  setFilters((prev) => ({
                    ...prev,
                    fechaFin: newValue ? newValue.toISOString() : "",
                  }));
                }}
                format="dd/MM/yyyy"
                renderInput={(params) => <TextField {...params} fullWidth size="small" variant="outlined" />}
              />
            </Grid>
          </>
        )}
<Grid item xs={12} sm={4}>
  <DatePicker
    label="Fecha de Registro"
    views={['year', 'month']}
    value={filters.fechaRegistro || null}
    onChange={(newValue) => {
      setFilters((prev) => ({
        ...prev,
        fechaRegistro: newValue || null,
      }));
    }}    
    format="MMMM yyyy"
    slotProps={{
      textField: {
        fullWidth: true,
        size: "small",
        variant: "outlined",
        sx: {
          borderRadius: "8px",
          backgroundColor: "#f9f9f9",
        },
      },
    }}
  />
</Grid>


        <Grid item xs={12}>
          <Box display="flex" gap={2} flexWrap="wrap">
            {/* Botón de Exportar */}
            <Button
              variant="outlined"
              onClick={handleExportClientes}
              disabled={exportLoading}
              startIcon={<DownloadIcon />}
              sx={{
                borderColor: "#007391",
                color: "#007391",
                "&:hover": { 
                  borderColor: "#005c6b",
                  backgroundColor: "#f0f8ff"
                },
                padding: "8px 20px",
                borderRadius: "2px",
                fontWeight: "bold",
                minWidth: "160px"
              }}
            >
              {exportLoading ? 'Exportando...' : 'Exportar CSV'}
            </Button>

            {/* Botón de Limpiar */}
            <Button
              variant="contained"
              onClick={() => {
                setPreset("today");
                setStartDate(startOfDay(new Date()));
                setEndDate(endOfDay(new Date()));
                setFilters({
                  search: "",
                  estado: "Todos",
                  accionComercial: "Todos",
                  interaccionBot: "Todos",
                  fechaInicio: "",
                  fechaFin: "",
                  fechaRegistro: "",
                });
              }}
              sx={{
                backgroundColor: "#007391",
                "&:hover": { backgroundColor: "#005c6b" },
                padding: "8px 20px",
                borderRadius: "2px",
                fontWeight: "bold",
                minWidth: "120px"
              }}
            >
              LIMPIAR
            </Button>
          </Box>
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
}
