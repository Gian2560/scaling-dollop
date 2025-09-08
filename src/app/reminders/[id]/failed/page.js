"use client";
import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ReplayIcon from '@mui/icons-material/Replay';

// Simulación de envíos fallidos con atributos completos
const initialRows = [
  {
    id: 1,
    reminder: 'R1 - Bienvenida',
    cliente: 'Ana López',
    telefono: '+51987654321',
    canal: 'WhatsApp',
    error: 'Número inválido',
    fechaEnvio: '2025-05-18 10:30'
  },
  {
    id: 2,
    reminder: 'R2 - Incentivo',
    cliente: 'Carlos Pérez',
    telefono: '+5112345678',
    canal: 'SMS',
    error: 'Opt-out',
    fechaEnvio: '2025-05-17 14:45'
  },
  {
    id: 3,
    reminder: 'R3 - Último Aviso',
    cliente: 'María Gómez',
    telefono: '+51999877665',
    canal: 'Correo',
    error: 'Buzón lleno',
    fechaEnvio: '2025-05-16 09:20'
  }
];

export default function FailedPage() {
  const [rows, setRows] = useState(initialRows);
  const [filterReminder, setFilterReminder] = useState('');
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState({ id: null, telefono: '' });

  const handleOpen = (row) => {
    setCurrent({ id: row.id, telefono: row.telefono });
    setOpen(true);
  };
  const handleClose = () => setOpen(false);
  const handleSave = () => {
    setRows(rows.map(r => r.id === current.id ? { ...r, telefono: current.telefono } : r));
    handleClose();
  };

  const markPending = (id) => {
    setRows(rows.map(r => r.id === id ? { ...r, error: 'Pendiente verificación' } : r));
  };

  const handleRetry = (id) => {
    alert(`Reintentando envío para ID ${id}`);
  };

  const filteredRows = rows.filter(r =>
    filterReminder ? r.reminder === filterReminder : true
  );

  const reminders = [...new Set(rows.map(r => r.reminder))];

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'reminder', headerName: 'Recordatorio', flex: 1 },
    { field: 'cliente', headerName: 'Cliente', flex: 1 },
    { field: 'telefono', headerName: 'Teléfono', flex: 1 },
    { field: 'canal', headerName: 'Canal', flex: 0.8 },
    {
      field: 'error', headerName: 'Error', flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'Pendiente verificación' ? 'warning' : 'error'}
          size="small"
        />
      )
    },
    { field: 'fechaEnvio', headerName: 'Fecha Envío', flex: 1.2 },
    {
      field: 'acciones', headerName: 'Acciones', flex: 1, sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton color="primary" size="small" onClick={() => handleOpen(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton color="secondary" size="small" onClick={() => markPending(params.row.id)}>
            <HourglassEmptyIcon />
          </IconButton>
          <IconButton color="success" size="small" onClick={() => handleRetry(params.row.id)}>
            <ReplayIcon />
          </IconButton>
        </Stack>
      )
    }
  ];

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, color: '#254e59', fontWeight: 600 }}>
        Fallos de Entrega
      </Typography>

      <Box sx={{ mb: 2, width: 300 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Recordatorio</InputLabel>
          <Select
            label="Recordatorio"
            value={filterReminder}
            onChange={e => setFilterReminder(e.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            {reminders.map(r => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Paper elevation={3} sx={{ height: 500, p: 2 }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
        />
      </Paper>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Actualizar Teléfono</DialogTitle>
        <DialogContent>
          <TextField
            label="Teléfono"
            fullWidth
            margin="dense"
            value={current.telefono}
            onChange={e => setCurrent({ ...current, telefono: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}