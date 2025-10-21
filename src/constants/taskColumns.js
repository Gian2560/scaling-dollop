import React from 'react';
import {
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Box,
  Typography
} from '@mui/material';
import CallIcon from '@mui/icons-material/Call';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChatIcon from '@mui/icons-material/Chat';
import PaymentIcon from '@mui/icons-material/Payment';
import { estadosConfig } from './estadosConfig';

// Columnas base (siempre presentes)
const baseColumns = (onAccionComercial, onVerConversacion, selectedEstado = null) => [
  {
    field: 'cliente',
    headerName: 'Cliente',
    minWidth: 150,
    flex: 1,
    renderCell: (value) => (
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    )
  },
  {
    field: 'telefono',
    headerName: 'Teléfono',
    minWidth: 120,
    flex: 1,
    renderCell: (value) => (
      <Typography variant="body2">
        {value}
      </Typography>
    )
  },
  {
    field: 'documento',
    headerName: 'Documento',
    minWidth: 100,
    flex: 1,
    renderCell: (value) => (
      <Typography variant="body2">
        {value}
      </Typography>
    )
  },
  {
    field: 'estado',
    headerName: 'Estado',
    minWidth: 130,
    flex: 1,
    renderCell: (value) => (
      <Chip
        label={estadosConfig[value]?.titulo || value}
        size="small"
        sx={{
          bgcolor: estadosConfig[value]?.colorBg || '#f5f5f5',
          color: estadosConfig[value]?.color || '#666',
          fontWeight: 600
        }}
      />
    )
  },
  {
    field: 'gestor',
    headerName: 'Gestor Asignado',
    minWidth: 150,
    flex: 1,
    renderCell: (value) => (
      <Box display="flex" alignItems="center">
        <Avatar sx={{ width: 32, height: 32, mr: 1, fontSize: '0.875rem' }}>
          {value?.charAt(0) || 'N'}
        </Avatar>
        <Typography variant="body2">{value}</Typography>
      </Box>
    )
  },
  {
    field: 'fechaCreacion',
    headerName: selectedEstado === 'En seguimiento' || selectedEstado === 'Promesa de Pago' 
      ? 'Última Gestión' 
      : 'Fecha Creación',
    minWidth: 120,
    flex: 1,
    renderCell: (value, row) => {
      // ✅ Para "En seguimiento" y "Promesa de Pago", mostrar fecha de acción comercial si existe
      const estadosEspeciales = ['En seguimiento', 'Promesa de Pago'];
      const esEstadoEspecial = estadosEspeciales.includes(selectedEstado);
      
      let fechaAMostrar = value; // Default: fechaCreacion del backend
      
      if (esEstadoEspecial && row.ultimaAccionComercial?.fechaUltimaAccion) {
        fechaAMostrar = row.ultimaAccionComercial.fechaUltimaAccion;
      }
      
      return (
        <Typography variant="body2">
          {fechaAMostrar}
        </Typography>
      );
    }
  },
  {
    field: 'llamado',
    headerName: 'Estado Tarea',
    minWidth: 130,
    flex: 1,
    renderCell: (value) => (
      value ? (
        <Chip
          icon={<CheckCircleIcon />}
          label="Completado"
          size="small"
          sx={{ bgcolor: '#e8f5e8', color: '#2e7d2e', fontWeight: 600 }}
        />
      ) : (
        <Chip
          icon={<CallIcon />}
          label="Pendiente"
          size="small"
          sx={{ bgcolor: '#fff3e0', color: '#f57c00', fontWeight: 600 }}
        />
      )
    )
  }
];

// Columnas específicas por estado
const estadoSpecificColumns = {
  'Promesa de Pago': () => [
    {
      field: 'promesa_pago',
      headerName: 'Promesa de Pago',
      minWidth: 150,
      flex: 1,
      renderCell: (value, row) => {
        const fechaPromesa = row.fecha_promesa || value?.fecha || null;
        const montoPromesa = row.monto_promesa || value?.monto || null;
        
        return (
          <Box>
            <Chip
              icon={<PaymentIcon />}
              label={fechaPromesa ? new Date(fechaPromesa).toLocaleDateString('es-PE') : 'Sin fecha'}
              size="small"
              sx={{ 
                bgcolor: fechaPromesa ? '#e0f2f1' : '#ffebee', 
                color: fechaPromesa ? '#00695c' : '#c62828',
                fontWeight: 600,
                mb: 0.5
              }}
            />
            {montoPromesa && (
              <Typography variant="caption" sx={{ display: 'block', color: '#666' }}>
                S/ {montoPromesa}
              </Typography>
            )}
          </Box>
        );
      }
    }
  ]
};

// Columnas de acciones (siempre al final)
const actionColumns = (onAccionComercial, onVerConversacion) => [
  {
    field: 'acciones',
    headerName: 'Acciones',
    minWidth: 120,
    flex: 0,
    sortable: false,
    renderCell: (value, row) => (
      <Box display="flex" gap={1}>
        <Tooltip title="Ver conversación">
          <IconButton
            size="small"
            onClick={() => onVerConversacion(row.id)}
            sx={{ color: '#007391' }}
          >
            <ChatIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={row.llamado ? "Completado" : "Realizar llamada"}>
          <span>
            <IconButton
              size="small"
              onClick={() => onAccionComercial(row)}
              disabled={row.llamado}
              sx={{ 
                color: row.llamado ? '#4caf50' : '#007391',
                '&.Mui-disabled': {
                  color: '#4caf50'
                }
              }}
            >
              {row.llamado ? <CheckCircleIcon fontSize="small" /> : <CallIcon fontSize="small" />}
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    )
  }
];

// Función principal que devuelve las columnas según el estado
export const taskColumns = (onAccionComercial, onVerConversacion, selectedEstado = null) => {
  // Columnas base
  let columns = [...baseColumns(onAccionComercial, onVerConversacion, selectedEstado)];
  
  // Agregar columnas específicas del estado si existen
  if (selectedEstado && estadoSpecificColumns[selectedEstado]) {
    const specificColumns = estadoSpecificColumns[selectedEstado]();
    columns = [...columns, ...specificColumns];
  }
  
  // Agregar columnas de acciones al final
  columns = [...columns, ...actionColumns(onAccionComercial, onVerConversacion)];
  
  return columns;
};
