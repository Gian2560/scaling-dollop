import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Comment as CommentIcon
} from '@mui/icons-material';

const HistoricoModal = ({ open, onClose, clienteId, clienteNombre }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    if (open && clienteId) {
      fetchHistorico();
    }
  }, [open, clienteId]);

  const fetchHistorico = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/clientes/${clienteId}/historico`);
      if (response.ok) {
        const data = await response.json();
        setHistorico(data.historico || []);
      } else {
        setError('Error al cargar el histórico');
      }
    } catch (err) {
      console.error('Error fetching historico:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoColor = (estado) => {
    const colores = {
      'En seguimiento': '#ff9800',
      'Promesa de Pago': '#2196f3',
      'Interesado en reactivar': '#4caf50',
      'Fecha de Pago': '#9c27b0',
      'Indeciso / Informacion': '#f44336'
    };
    return colores[estado] || '#666';
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '80vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#254e59' }}>
            Histórico de Acciones Comerciales
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
            Cliente: {clienteNombre}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={40} sx={{ color: '#007391' }} />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && historico.length === 0 && (
          <Alert severity="info">
            No se encontraron acciones comerciales para este cliente.
          </Alert>
        )}

        {!loading && !error && historico.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, color: '#666' }}>
              {historico.length} {historico.length === 1 ? 'acción registrada' : 'acciones registradas'} 
              (ordenadas de más reciente a más antigua)
            </Typography>

            {historico.map((accion, index) => (
              <Card 
                key={accion.accion_comercial_id} 
                sx={{ 
                  mb: 2, 
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardContent sx={{ pb: 2 }}>
                  {/* Header de la acción */}
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <AssignmentIcon sx={{ color: '#007391', fontSize: 20 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#254e59' }}>
                        Acción #{historico.length - index}
                      </Typography>
                      {accion.estado && (
                        <Chip 
                          label={accion.estado}
                          size="small"
                          sx={{ 
                            bgcolor: `${getEstadoColor(accion.estado)}20`,
                            color: getEstadoColor(accion.estado),
                            fontWeight: 600
                          }}
                        />
                      )}
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <TimeIcon sx={{ color: '#666', fontSize: 16 }} />
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        {formatFecha(accion.fecha_accion)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Contenido de la acción */}
                  {accion.nota && (
                    <Box mb={2}>
                      <Typography variant="body2" sx={{ 
                        color: '#333',
                        bgcolor: '#f8f9fa',
                        p: 1.5,
                        borderRadius: 1,
                        border: '1px solid #e9ecef'
                      }}>
                        {accion.nota}
                      </Typography>
                    </Box>
                  )}

                  {/* Gestor */}
                  {accion.gestor && (
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <PersonIcon sx={{ color: '#666', fontSize: 16 }} />
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        Gestor: {accion.gestor}
                      </Typography>
                    </Box>
                  )}

                  {/* Observaciones */}
                  {accion.observaciones && accion.observaciones.length > 0 && (
                    <Box mt={2}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <CommentIcon sx={{ color: '#007391', fontSize: 16 }} />
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#007391' }}>
                          Observaciones:
                        </Typography>
                      </Box>
                      {accion.observaciones.map((obs, obsIndex) => (
                        <Box 
                          key={obs.historico_observacion_id} 
                          sx={{ 
                            ml: 2, 
                            mb: 1,
                            pl: 2,
                            borderLeft: '3px solid #007391',
                            bgcolor: '#f0f8ff'
                          }}
                        >
                          <Typography variant="body2" sx={{ color: '#333', mb: 0.5 }}>
                            {obs.observacion}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#666' }}>
                            {formatFecha(obs.fecha_creacion)}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e0e0e0' }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ 
            borderColor: '#007391',
            color: '#007391',
            '&:hover': {
              borderColor: '#005c6b',
              bgcolor: '#f0f8ff'
            }
          }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HistoricoModal;