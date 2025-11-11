import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  IconButton
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import CloseIcon from '@mui/icons-material/Close';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CampaignIcon from '@mui/icons-material/Campaign';
import CategoryIcon from '@mui/icons-material/Category';

const BitacoraModal = ({ open, onClose, clienteDocumento, clienteNombre }) => {
  const [bitacoraData, setBitacoraData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para formatear fechas
  const formatFecha = (fechaTimestamp) => {
    if (!fechaTimestamp) return 'Sin fecha';
    try {
      // Si es un objeto de BigQuery con value
      if (fechaTimestamp.value) {
        return new Date(fechaTimestamp.value).toLocaleString('es-PE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      // Si es un timestamp directo
      return new Date(fechaTimestamp).toLocaleString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Columnas para la tabla de bitácora
  const bitacoraColumns = [
    {
      field: 'fecha_llamada',
      headerName: 'Fecha y Hora',
      width: 160,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <CalendarTodayIcon sx={{ fontSize: 16, color: '#666' }} />
          <Typography variant="body2">
            {formatFecha(params.value)}
          </Typography>
        </Box>
      )
    },
    {
      field: 'asesor',
      headerName: 'Asesor',
      width: 150,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <PersonIcon sx={{ fontSize: 16, color: '#007391' }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.value}
          </Typography>
        </Box>
      )
    },
    {
      field: 'para_quien',
      headerName: 'Para',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value}
        </Typography>
      )
    },
    {
      field: 'campaña',
      headerName: 'Campaña',
      width: 140,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <CampaignIcon sx={{ fontSize: 16, color: '#ff6b35' }} />
          <Typography variant="body2">
            {params.value}
          </Typography>
        </Box>
      )
    },
    {
      field: 'categoria_1',
      headerName: 'Categoría 1',
      width: 130,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small" 
          sx={{ 
            bgcolor: '#e3f2fd', 
            color: '#1976d2',
            fontSize: '0.75rem' 
          }} 
        />
      )
    },
    {
      field: 'categoria_2',
      headerName: 'Categoría 2',
      width: 130,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small" 
          sx={{ 
            bgcolor: '#f3e5f5', 
            color: '#7b1fa2',
            fontSize: '0.75rem' 
          }} 
        />
      )
    },
    {
      field: 'categoria_3',
      headerName: 'Categoría 3',
      width: 130,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small" 
          sx={{ 
            bgcolor: '#e8f5e8', 
            color: '#388e3c',
            fontSize: '0.75rem' 
          }} 
        />
      )
    }
  ];

  // Cargar bitácora cuando se abre el modal
  useEffect(() => {
    if (open && clienteDocumento) {
      console.log('🎯 Modal abierto - Cargando bitácora para documento:', clienteDocumento);
      fetchBitacora();
    }
  }, [open, clienteDocumento]);

  const fetchBitacora = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📡 Haciendo fetch a la API con documento:', clienteDocumento);
      const response = await fetch(`/api/bigquery/bitacora?documento=${encodeURIComponent(clienteDocumento)}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('📥 Respuesta del API:', result);
      
      if (result.success) {
        setBitacoraData(result.data);
      } else {
        throw new Error(result.error || 'Error desconocido al obtener la bitácora');
      }
    } catch (err) {
      console.error('Error fetching bitácora:', err);
      setError(err.message);
      setBitacoraData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, maxHeight: '90vh' }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: '#007391', 
        color: 'white', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        py: 2
      }}>
        <Box display="flex" alignItems="center" gap={2}>
          <RecordVoiceOverIcon sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Bitácora de Llamadas
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {clienteNombre} - Doc: {clienteDocumento}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress size={40} />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Cargando bitácora...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <>
            {/* Resumen */}
            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Resumen de Llamadas
              </Typography>
              <Box display="flex" gap={3}>
                <Box display="flex" alignItems="center" gap={1}>
                  <RecordVoiceOverIcon sx={{ fontSize: 18, color: '#007391' }} />
                  <Typography variant="body2">
                    <strong>{bitacoraData.length}</strong> llamada{bitacoraData.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <PersonIcon sx={{ fontSize: 18, color: '#007391' }} />
                  <Typography variant="body2">
                    <strong>{new Set(bitacoraData.map(item => item.asesor)).size}</strong> asesor{new Set(bitacoraData.map(item => item.asesor)).size !== 1 ? 'es' : ''}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Tabla */}
            {bitacoraData.length > 0 ? (
              <Box sx={{ height: 400, width: '100%' }}>
                <DataGrid
                  rows={bitacoraData}
                  columns={bitacoraColumns}
                  getRowId={(row) => row.id}
                  disableRowSelectionOnClick
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 10 }
                    }
                  }}
                  pageSizeOptions={[10, 25, 50]}
                  sx={{
                    border: 'none',
                    '& .MuiDataGrid-columnHeaders': {
                      backgroundColor: '#f8fafc',
                      borderBottom: '2px solid #e0e0e0'
                    },
                    '& .MuiDataGrid-row': {
                      '&:hover': {
                        backgroundColor: '#f0f8ff'
                      }
                    },
                    '& .MuiDataGrid-cell': {
                      fontSize: '0.875rem'
                    }
                  }}
                  localeText={{
                    noRowsLabel: 'No se encontraron llamadas',
                    footerRowSelected: (count) => `${count.toLocaleString()} fila${count !== 1 ? 's' : ''} seleccionada${count !== 1 ? 's' : ''}`,
                    footerTotalRows: 'Total de filas:',
                    footerTotalVisibleRows: (visibleCount, totalCount) =>
                      `${visibleCount.toLocaleString()} de ${totalCount.toLocaleString()}`,
                  }}
                />
              </Box>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <RecordVoiceOverIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No hay registros de llamadas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No se encontraron llamadas para este cliente en la bitácora.
                </Typography>
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
        <Button 
          onClick={onClose} 
          variant="contained"
          sx={{ bgcolor: '#007391', '&:hover': { bgcolor: '#005c6b' } }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BitacoraModal;