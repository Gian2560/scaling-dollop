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
import HistoryIcon from '@mui/icons-material/History';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import { estadosConfig } from './estadosConfig';
// Estados que deben mostrar "gestionado mes actual" si tienen acción en el mes
const HIGHLIGHT_STATES = ['Interesado en reactivar','Fecha de Pago','Indeciso / Informacion'];

// Helper para decidir si marcar/colorear la fila/celda
export function isGestionadoMesActual(row, selectedEstado) {
  if (!selectedEstado) return false;
  if (!HIGHLIGHT_STATES.includes(selectedEstado)) return false;

  const fechaStr = row?.ultimaAccionComercial?.fechaUltimaAccion;
  if (!fechaStr) return false;

  // Try to parse several common formats robustly
  function parseDateSmart(s) {
    if (!s) return null;
    if (s instanceof Date) return s;
    // If ISO-like
    if (typeof s === 'string' && s.includes('T')) {
      const d = new Date(s);
      return isNaN(d) ? null : d;
    }
    // Common localized formats like dd/mm/yyyy or mm/dd/yyyy
    if (typeof s === 'string' && /\d{1,2}\/\d{1,2}\/\d{2,4}/.test(s)) {
      const parts = s.split('/').map(p => parseInt(p, 10));
      if (parts.length === 3) {
        let [p1, p2, p3] = parts; // ambiguous
        // if p1 > 12 assume dd/mm/yyyy
        if (p1 > 12) {
          return new Date(p3, p2 - 1, p1);
        }
        // if p2 > 12 assume mm/dd/yyyy (rare for es-ES)
        if (p2 > 12) {
          return new Date(p3, p1 - 1, p2);
        }
        // default to dd/mm/yyyy (es-ES)
        return new Date(p3, p2 - 1, p1);
      }
    }
    // Fallback to Date constructor
    const d = new Date(s);
    return isNaN(d) ? null : d;
  }

  const parsed = parseDateSmart(fechaStr);
  if (!parsed) return false;

  const ahora = new Date();
  return parsed.getFullYear() === ahora.getFullYear() && parsed.getMonth() === ahora.getMonth();
}
// Columnas base (siempre presentes)
const baseColumns = (onAccionComercial, onVerConversacion, selectedEstado = null) => [
  {
    field: 'cliente',
    headerName: 'Cliente',
    minWidth: 150,
    flex: 1,
    // renderCell: (value) => (
    //   <Typography variant="body2" sx={{ fontWeight: 600 }}>
    //     {value}
    //   </Typography>
    // )
    renderCell: (value, row) => {
      return (
        <Box sx={{ px: 1, py: 0.5, borderRadius: 1, width: '100%' }}>
          <Typography variant="body2">
            {value}
          </Typography>
        </Box>
      );
    }
  },
  {
    field: 'telefono',
    headerName: 'Teléfono',
    minWidth: 120,
    flex: 1,
    // renderCell: (value) => (
    //   <Typography variant="body2">
    //     {value}
    //   </Typography>
    // )
    renderCell: (value, row) => {
      return (
        <Box sx={{ px: 1, py: 0.5, borderRadius: 1, width: '100%' }}>
          <Typography variant="body2">
            {value}
          </Typography>
        </Box>
      );
    }
  },
  {
    field: 'documento',
    headerName: 'Documento',
    minWidth: 100,
    flex: 1,
    // renderCell: (value) => (
    //   <Typography variant="body2">
    //     {value}
    //   </Typography>
    // )
    renderCell: (value, row) => {
      return (
        <Box sx={{ px: 1, py: 0.5, borderRadius: 1 }}>
          <Chip
            label={estadosConfig[value]?.titulo || value}
            size="small"
            sx={{
              bgcolor: estadosConfig[value]?.colorBg || '#f5f5f5',
              color: estadosConfig[value]?.color || '#666',
              fontWeight: 600
            }}
          />
        </Box>
      );
    }
  },
  {
    field: 'estado',
    headerName: 'Estado',
    minWidth: 130,
    flex: 1,
    /* renderCell: (value) => (
      <Chip
        label={estadosConfig[value]?.titulo || value}
        size="small"
        sx={{
          bgcolor: estadosConfig[value]?.colorBg || '#f5f5f5',
          color: estadosConfig[value]?.color || '#666',
          fontWeight: 600
        }}
      />
    ) */
  renderCell: (value, row) => {
    return (
      <Box sx={{ px: 1, py: 0.5, borderRadius: 1 }}>
          <Chip
            label={estadosConfig[value]?.titulo || value}
            size="small"
            sx={{
              bgcolor: estadosConfig[value]?.colorBg || '#f5f5f5',
              color: estadosConfig[value]?.color || '#666',
              fontWeight: 600
            }}
          />
        </Box>
      );
    }
  },
  {
    field: 'gestor',
    headerName: 'Gestor Asignado',
    minWidth: 150,
    flex: 1,
    // renderCell: (value) => (
    //   <Box display="flex" alignItems="center">
    //     <Avatar sx={{ width: 32, height: 32, mr: 1, fontSize: '0.875rem' }}>
    //       {value?.charAt(0) || 'N'}
    //     </Avatar>
    //     <Typography variant="body2">{value}</Typography>
    //   </Box>
    // )
    renderCell: (value, row) => {
      return (
        <Box display="flex" alignItems="center" sx={{ px: 1, py: 0.5, borderRadius: 1 }}>
          <Avatar sx={{ width: 32, height: 32, mr: 1, fontSize: '0.875rem' }}>
            {value?.charAt(0) || 'N'}
          </Avatar>
          <Typography variant="body2">{value}</Typography>
        </Box>
      );
    }
  },
  {
    field: 'fechaCreacion',
    headerName: selectedEstado === 'En seguimiento' || selectedEstado === 'Promesa de Pago' 
      ? 'Última Gestión' 
      : 'Fecha Creación',
    minWidth: 120,
    flex: 1,
    // permitir orden por timestamp (usado por DataGrid u otras tablas que lean valueGetter)
    sortable: true,
    valueGetter: (params) => {
     // si es estado especial, priorizamos la fecha de la última acción comercial
     const estadosEspeciales = ['En seguimiento', 'Promesa de Pago'];
    if (estadosEspeciales.includes(selectedEstado) && params.row.ultimaAccionComercial?.fechaUltimaAccion) {
       return new Date(params.row.ultimaAccionComercial.fechaUltimaAccion).getTime();
     }
     // fallback a fecha de creación si existe
     return params.row.fecha_creacion ? new Date(params.row.fecha_creacion).getTime() : null;
   },
    // renderCell: (value, row) => {
    //   // ✅ Para "En seguimiento" y "Promesa de Pago", mostrar fecha de acción comercial si existe
    //   const estadosEspeciales = ['En seguimiento', 'Promesa de Pago'];
    //   const esEstadoEspecial = estadosEspeciales.includes(selectedEstado);
      
    //   let fechaAMostrar = value; // Default: fechaCreacion del backend
      
    //   if (esEstadoEspecial && row.ultimaAccionComercial?.fechaUltimaAccion) {
    //     fechaAMostrar = row.ultimaAccionComercial.fechaUltimaAccion;
    //   }
      
    //   return (
    //     <Typography variant="body2">
    //       {fechaAMostrar}
    //     </Typography>
    //   );
    // }
    renderCell: (value, row) => {
      // ✅ Para "En seguimiento" y "Promesa de Pago", mostrar fecha de acción comercial si existe
      const estadosEspeciales = ['En seguimiento', 'Promesa de Pago'];
      const esEstadoEspecial = estadosEspeciales.includes(selectedEstado);
      
      let fechaAMostrar = value; // Default: fechaCreacion del backend
      
      if (esEstadoEspecial && row.ultimaAccionComercial?.fechaUltimaAccion) {
        fechaAMostrar = row.ultimaAccionComercial.fechaUltimaAccion;
      }
      
      return (
        <Box sx={{ px: 1, py: 0.5, borderRadius: 1 }}>
          <Typography variant="body2">
            {fechaAMostrar}
          </Typography>
        </Box>
      );
    }
  },
  {
    field: 'llamado',
    headerName: 'Estado Tarea',
    minWidth: 130,
    flex: 1,
    // renderCell: (value) => (
    //   value ? (
    //     <Chip
    //       icon={<CheckCircleIcon />}
    //       label="Completado"
    //       size="small"
    //       sx={{ bgcolor: '#e8f5e8', color: '#2e7d2e', fontWeight: 600 }}
    //     />
    //   ) : (
    //     <Chip
    //       icon={<CallIcon />}
    //       label="Pendiente"
    //       size="small"
    //       sx={{ bgcolor: '#fff3e0', color: '#f57c00', fontWeight: 600 }}
    //     />
    //   )
    // )
    renderCell: (value, row) => {
      return (
        <Box sx={{ px: 1, py: 0.5, borderRadius: 1 }}>
          {value ? (
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
          )}
        </Box>
      );
    }
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
const actionColumns = (onAccionComercial, onVerConversacion, onVerHistorico, onVerBitacora, selectedEstado) => [
  {
    field: 'gestionadoMes',
    headerName: '¿Gestionado mes actual?',
    minWidth: 180,
    flex: 0,
    sortable: false,
      renderCell: (value, row) => {
        const highlight = isGestionadoMesActual(row, selectedEstado);
        return (
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {highlight ? (
              <Chip
                label="Ya gestionado (mes actual)"
                size="small"
                sx={{ bgcolor: '#E6F7FB', color: '#007391', fontWeight: 700 }}
              />
            ) : (
              <Chip
                label="Todavía"
                size="small"
                sx={{ bgcolor: '#FFF4E6', color: '#f56c68ff', fontWeight: 700 }}
              />
            )}
          </Box>
        );
      }
  },
  {
    field: 'acciones',
    headerName: 'Acciones',
    minWidth: 200,
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
        <Tooltip title="Ver histórico">
          <IconButton
            size="small"
            onClick={() => onVerHistorico(row.id)}
            sx={{ color: '#6b46c1' }}
          >
            <HistoryIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Ver bitácora de llamadas">
          <IconButton
            size="small"
            onClick={() => onVerBitacora(row.id)}
            sx={{ color: '#ff6b35' }}
          >
            <RecordVoiceOverIcon fontSize="small" />
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
export const taskColumns = (onAccionComercial, onVerConversacion, selectedEstado = null, onVerHistorico, onVerBitacora) => {
  // Columnas base
  let columns = [...baseColumns(onAccionComercial, onVerConversacion, selectedEstado)];
  
  // Agregar columnas específicas del estado si existen
  if (selectedEstado && estadoSpecificColumns[selectedEstado]) {
    const specificColumns = estadoSpecificColumns[selectedEstado]();
    columns = [...columns, ...specificColumns];
  }
  
  // Agregar columnas de acciones al final
  columns = [...columns, ...actionColumns(onAccionComercial, onVerConversacion, onVerHistorico, onVerBitacora, selectedEstado)];
  
  return columns;
};
