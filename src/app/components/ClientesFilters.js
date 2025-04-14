"use client";

import { useState } from "react";
import { TextField, MenuItem, Button, Grid, FormControl, InputLabel, Select } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { es } from "date-fns/locale"; // 📌 Asegura el idioma correcto para español
import { startOfDay, endOfDay, subDays } from "date-fns";

const presets = [
  { label: "Hoy", value: "today" },
  { label: "Últimos 7 días", value: "7" },
  { label: "Últimos 30 días", value: "30" },
  { label: "Este mes", value: "month" },
  { label: "Personalizado", value: "custom" },
];

export default function ClientesFilters({ filters, setFilters }) {
  const [preset, setPreset] = useState("today");
  const [startDate, setStartDate] = useState(startOfDay(new Date()));
  const [endDate, setEndDate] = useState(endOfDay(new Date()));

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
    } else {
      return; // Si es "custom", no cambia fechas hasta que el usuario elija
    }

    setStartDate(newStart);
    setEndDate(newEnd);
    setFilters((prev) => ({
      ...prev,
      fechaInicio: newStart.toISOString(),
      fechaFin: newEnd.toISOString(),
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

        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={() => {
              setPreset("today");
              setStartDate(startOfDay(new Date()));
              setEndDate(endOfDay(new Date()));
              setFilters({
                search: "",
                estado: "Todos",
                fechaInicio: "",
                fechaFin: "",
              });
            }}
            sx={{
              backgroundColor: "#007391",
              "&:hover": { backgroundColor: "#005c6b" },
              padding: "8px 20px",
              borderRadius: "2px",
              fontWeight: "bold",
            }}
          >
            LIMPIAR
          </Button>
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
}
