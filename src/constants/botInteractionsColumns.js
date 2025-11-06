import React from 'react';
import { Box, Chip, Typography, Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

// Función para formatear fechas
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return 'N/A';
  }
};

// Función para formatear moneda
const formatCurrency = (amount) => {
  if (!amount || amount === 0) return 'S/ 0.00';
  return `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
};

// Componente para mostrar flags de operaciones
const OperationFlags = ({ cliente }) => {
  const flags = [
    { key: 'tiene_reingreso', label: 'Reingreso', color: '#2196f3' },
    { key: 'tiene_reincorporacion', label: 'Reincorp.', color: '#4caf50' },
    { key: 'tiene_acuerdo', label: 'Acuerdo', color: '#ff9800' },
    { key: 'tiene_pago_anticipado', label: 'P. Antic.', color: '#9c27b0' }
  ];

  const activeFlags = flags.filter(flag => cliente[flag.key]);

  if (activeFlags.length === 0) {
    return <Typography variant="body2" sx={{ color: '#666' }}>Sin operaciones</Typography>;
  }

  return (
    <Box display="flex" gap={0.5} flexWrap="wrap">
      {activeFlags.map(flag => (
        <Chip
          key={flag.key}
          label={flag.label}
          size="small"
          sx={{
            bgcolor: `${flag.color}20`,
            color: flag.color,
            fontSize: '0.7rem',
            height: 20
          }}
        />
      ))}
    </Box>
  );
};

// Columnas simplificadas para bot interactions
export const botInteractionsColumns = [
  {
    field: 'documento_identidad',
    headerName: 'Documento',
    width: 150,
    align: 'center',
    headerAlign: 'center'
  },
  {
    field: 'nombre_completo',
    headerName: 'Nombre Cliente',
    width: 300,
    headerAlign: 'center'
  },
  {
    field: 'codigo_asociado',
    headerName: 'Código Asociado',
    width: 150,
    align: 'center',
    headerAlign: 'center'
  },
  {
    field: 'fecha_operacion',
    headerName: 'Fecha de Operación',
    width: 180,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => {
      const fecha = params.row?.fecha_operacion;
      
      if (!fecha) return 'Sin fecha';
      
      try {
        // Si ya está en formato YYYY-MM-DD, parsearlo directamente
        const fechaStr = String(fecha);
        
        if (fechaStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [year, month, day] = fechaStr.split('-');
          return `${day}/${month}/${year}`;
        }
        
        // Fallback: intentar parsear como fecha normal
        const fechaObj = new Date(fechaStr);
        if (!isNaN(fechaObj.getTime())) {
          return fechaObj.toLocaleDateString('es-CL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        }
        
        return fechaStr; // Mostrar el valor original si no se puede formatear
      } catch (error) {
        console.error('Error formateando fecha:', error, fecha);
        return String(fecha || 'Error fecha');
      }
    }
  }
];