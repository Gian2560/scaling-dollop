"use client";

import { useState } from "react";
import { 
  Box, 
  Grid, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Chip,
  OutlinedInput,
  Typography
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { es } from "date-fns/locale";
import { startOfDay, endOfDay, subDays } from "date-fns";
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

const ESTADOS_BOT = [
  'Indeciso',
  'Reclamo activo',
  'No interesado',
  'Solicita devolucion de dinero',
  'Interesado en reactivar',
  'Fecha de Pago'
];

const PRESETS_FECHA = [
  { label: "Últimos 7 días", value: 7 },
  { label: "Últimos 15 días", value: 15 },
  { label: "Últimos 30 días", value: 30 },
  { label: "Este mes", value: "month" },
  { label: "Personalizado", value: "custom" },
];

export default function BotInteractionsFilters({ onSearch, loading }) {
  const [fechaInicio, setFechaInicio] = useState(startOfDay(subDays(new Date(), 30)));
  const [fechaFin, setFechaFin] = useState(endOfDay(new Date()));
  const [estadosSeleccionados, setEstadosSeleccionados] = useState(ESTADOS_BOT);

  const handlePresetChange = (preset) => {
    const now = new Date();
    
    if (preset === 7 || preset === 15 || preset === 30) {
      setFechaInicio(startOfDay(subDays(now, preset)));
      setFechaFin(endOfDay(now));
    } else if (preset === "month") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setFechaInicio(startOfDay(firstDay));
      setFechaFin(endOfDay(now));
    }
  };

  const handleSearch = () => {
    if (!fechaInicio || !fechaFin) {
      alert('Por favor selecciona un rango de fechas válido');
      return;
    }

    if (fechaInicio > fechaFin) {
      alert('La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }

    onSearch({
      fechaInicio: fechaInicio.toISOString().split('T')[0],
      fechaFin: fechaFin.toISOString().split('T')[0],
      estados: estadosSeleccionados
    });
  };

  const handleEstadoChange = (event) => {
    const value = event.target.value;
    setEstadosSeleccionados(typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box 
        sx={{ 
          p: 3, 
          bgcolor: 'white', 
          borderRadius: 2, 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          mb: 3
        }}
      >
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <FilterListIcon sx={{ color: '#007391' }} />
          <Typography variant="h6" sx={{ color: '#254e59', fontWeight: 600 }}>
            Filtros de Búsqueda - Interacciones con Bot
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Presets de fecha */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#666' }}>
              Rangos de fecha rápidos:
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {PRESETS_FECHA.map((preset) => (
                <Chip
                  key={preset.label}
                  label={preset.label}
                  onClick={() => handlePresetChange(preset.value)}
                  variant="outlined"
                  sx={{
                    '&:hover': {
                      bgcolor: '#f0f8ff',
                      borderColor: '#007391'
                    }
                  }}
                />
              ))}
            </Box>
          </Grid>

          {/* Fechas */}
          <Grid item xs={12} md={6}>
            <DatePicker
              label="Fecha de inicio"
              value={fechaInicio}
              onChange={setFechaInicio}
              slotProps={{
                textField: {
                  fullWidth: true,
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: '#007391'
                      }
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#007391'
                    }
                  }
                }
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <DatePicker
              label="Fecha de fin"
              value={fechaFin}
              onChange={setFechaFin}
              slotProps={{
                textField: {
                  fullWidth: true,
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: '#007391'
                      }
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#007391'
                    }
                  }
                }
              }}
            />
          </Grid>

          {/* Estados del bot */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Estados de Bot</InputLabel>
              <Select
                multiple
                value={estadosSeleccionados}
                onChange={handleEstadoChange}
                input={<OutlinedInput label="Estados de Bot" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip 
                        key={value} 
                        label={value} 
                        size="small"
                        sx={{
                          bgcolor: '#f0f8ff',
                          color: '#007391',
                          fontSize: '0.75rem'
                        }}
                      />
                    ))}
                  </Box>
                )}
                sx={{
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#007391'
                  }
                }}
              >
                {ESTADOS_BOT.map((estado) => (
                  <MenuItem key={estado} value={estado}>
                    {estado}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Botón de búsqueda */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              startIcon={<SearchIcon />}
              sx={{
                bgcolor: '#007391',
                '&:hover': { bgcolor: '#005c6b' },
                padding: '12px 24px',
                borderRadius: 2,
                fontWeight: 600,
                minWidth: 200
              }}
            >
              {loading ? 'Buscando...' : 'Buscar Clientes'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
}