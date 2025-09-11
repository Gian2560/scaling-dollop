import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Divider,
  Grid,
  Paper,
  Avatar,
  Fade
} from "@mui/material";
import {
  CheckCircle,
  Error,
  Speed,
  Timer,
  TrendingUp,
  Assessment,
  WhatsApp,
  Campaign,
  Analytics,
  Settings
} from "@mui/icons-material";

const CampaignStatsCard = ({ campaignStats, sendingInProgress }) => {
  if (!campaignStats && !sendingInProgress) return null;

  // 🔹 Nueva estructura de datos para respuesta 202 de GCP
  const {
    // Nuevos campos de la respuesta básica
    campaignId,
    campaignName,
    totalRecipients = 0,
    status,
    estimatedTime,
    startedAt,
    
    // Campos legacy (para compatibilidad)
    total = totalRecipients,
    sent = 0,
    failed = 0,
    performance = {},
    errorBreakdown = {},
    configuration = {}
  } = campaignStats || {};

  // Calcular progreso estimado si está en progreso
  const getEstimatedProgress = () => {
    if (!sendingInProgress || !startedAt || !estimatedTime) return 0;
    
    const startTime = new Date(startedAt);
    const currentTime = new Date();
    const elapsed = (currentTime - startTime) / (1000 * 60); // minutos
    const estimated = parseInt(estimatedTime.replace(/\D/g, '')) || 5; // extraer número
    
    return Math.min((elapsed / estimated) * 100, 95); // máximo 95% mientras esté en progreso
  };

  const estimatedProgress = getEstimatedProgress();
  const successRate = total > 0 ? ((sent / total) * 100).toFixed(1) : 0;

  // Colores basados en el tema de la página de inicio
  const getStatusColor = () => {
    if (sendingInProgress) return "#007391"; // Color principal
    if (successRate >= 90) return "#388e3c"; // Verde éxito
    if (successRate >= 70) return "#ff9800"; // Naranja advertencia
    return "#d32f2f"; // Rojo error
  };

  const statusColor = getStatusColor();

  return (
    <Fade in={true}>
      <Box sx={{ mt: 3 }}>
        {sendingInProgress ? (
          // Card de progreso con estilo profesional
          <Paper
            elevation={3}
            sx={{
              background: 'linear-gradient(135deg, #007391 0%, #005c6b 100%)',
              color: 'white',
              p: 4,
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Patrón de fondo decorativo */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '200px',
                height: '200px',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                borderRadius: '50%',
                transform: 'translate(50px, -50px)'
              }}
            />
            
            <Box position="relative" zIndex={1}>
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48, mr: 2 }}>
                  <WhatsApp fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold" sx={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                    📡 {campaignName ? `Enviando: ${campaignName}` : 'Enviando Campaña WhatsApp'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {status || 'Procesamiento optimizado en curso...'}
                  </Typography>
                </Box>
              </Box>

              <LinearProgress 
                variant={estimatedProgress > 0 ? "determinate" : "indeterminate"}
                value={estimatedProgress}
                sx={{ 
                  height: 12, 
                  borderRadius: 6,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#ffc107',
                    borderRadius: 6
                  }
                }} 
              />
              
              <Box mt={3} p={3} sx={{ 
                bgcolor: 'rgba(255,255,255,0.1)', 
                borderRadius: 2,
                backdropFilter: 'blur(10px)'
              }}>
                <Typography variant="h6" mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Settings /> Información del Envío
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Destinatarios</Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {totalRecipients || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Tiempo Est.</Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {estimatedTime || "~5 min"}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Progreso</Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {estimatedProgress > 0 ? `${Math.round(estimatedProgress)}%` : "Iniciando..."}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Paper>
        ) : (
          // Card de resultados con estilo profesional
          <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            {/* Header con gradiente */}
            <Box
              sx={{
                background: `linear-gradient(135deg, ${statusColor} 0%, ${statusColor}cc 100%)`,
                color: 'white',
                p: 3,
                position: 'relative'
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                    <Assessment fontSize="large" />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="bold">
                      📊 Resultados de la Campaña
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Reporte completo del envío WhatsApp
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={`${successRate}% éxito`}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}
                />
              </Box>
            </Box>

            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={4}>
                {/* Métricas principales */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" color="#254e59" mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Campaign /> Resumen de Envío
                  </Typography>
                  
                  <Box mb={3}>
                    <Paper sx={{ p: 3, bgcolor: '#e8f5e8', border: '1px solid #4caf50' }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <CheckCircle sx={{ color: "#4caf50" }} />
                          <Typography variant="body1" fontWeight="bold">Mensajes Exitosos</Typography>
                        </Box>
                        <Typography variant="h6" fontWeight="bold" color="#4caf50">
                          {sent.toLocaleString()}
                        </Typography>
                      </Box>
                    </Paper>
                  </Box>

                  {failed > 0 && (
                    <Box mb={3}>
                      <Paper sx={{ p: 3, bgcolor: '#ffebee', border: '1px solid #f44336' }}>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Error sx={{ color: "#f44336" }} />
                            <Typography variant="body1" fontWeight="bold">Mensajes Fallidos</Typography>
                          </Box>
                          <Typography variant="h6" fontWeight="bold" color="#f44336">
                            {failed.toLocaleString()}
                          </Typography>
                        </Box>
                      </Paper>
                    </Box>
                  )}

                  {/* Barra de progreso estilizada */}
                  <Box>
                    <Typography variant="body2" color="textSecondary" mb={1}>
                      Tasa de Éxito General
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={parseFloat(successRate)} 
                      sx={{ 
                        height: 12, 
                        borderRadius: 6,
                        bgcolor: "#e0e0e0",
                        "& .MuiLinearProgress-bar": {
                          bgcolor: statusColor,
                          borderRadius: 6
                        }
                      }} 
                    />
                    <Typography variant="h6" fontWeight="bold" color={statusColor} mt={1}>
                      {successRate}% de {total.toLocaleString()} mensajes
                    </Typography>
                  </Box>
                </Grid>

                {/* Métricas de rendimiento */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" color="#254e59" mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Analytics /> Rendimiento
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, bgcolor: '#e3f2fd', textAlign: 'center' }}>
                        <Speed sx={{ color: "#2196f3", fontSize: 32, mb: 1 }} />
                        <Typography variant="body2" color="textSecondary">Velocidad</Typography>
                        <Typography variant="h6" fontWeight="bold" color="#2196f3">
                          {performance.messagesPerSecond || 0}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">msg/seg</Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, bgcolor: '#fff3e0', textAlign: 'center' }}>
                        <Timer sx={{ color: "#ff9800", fontSize: 32, mb: 1 }} />
                        <Typography variant="body2" color="textSecondary">Tiempo Total</Typography>
                        <Typography variant="h6" fontWeight="bold" color="#ff9800">
                          {performance.totalTimeMinutes || 0}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">minutos</Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  <Paper sx={{ p: 3, mt: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <Typography variant="body2" color="#254e59" fontWeight="bold" mb={1}>
                      🎯 Estimación de Capacidad
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Con esta velocidad promedio, puedes procesar aproximadamente{' '}
                      <strong>{Math.round((performance.messagesPerSecond || 50) * 60)} mensajes por minuto</strong>
                    </Typography>
                  </Paper>
                </Grid>

                {/* Desglose de errores */}
                {Object.keys(errorBreakdown).length > 0 && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" color="#d32f2f" mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Error /> Análisis de Errores
                    </Typography>
                    
                    <Box display="flex" flexWrap="wrap" gap={2}>
                      {Object.entries(errorBreakdown).map(([errorType, count]) => {
                        const errorLabels = {
                          'rejected': '🚫 Rechazados por Meta',
                          'unauthorized': '🔐 Sin autorización',
                          'rate_limited': '⏱️ Límite excedido',
                          'server_error': '🖥️ Error de servidor',
                          'network_failed': '🌐 Fallo de red',
                          'failed': '❌ Error general',
                          'invalid_phone': '📱 Teléfono inválido'
                        };

                        const errorColors = {
                          'rejected': '#d32f2f',
                          'unauthorized': '#e91e63',
                          'rate_limited': '#ff9800',
                          'server_error': '#9c27b0',
                          'network_failed': '#607d8b',
                          'failed': '#795548',
                          'invalid_phone': '#f57c00'
                        };

                        return (
                          <Paper
                            key={errorType}
                            sx={{
                              p: 2,
                              border: `2px solid ${errorColors[errorType] || '#666'}`,
                              bgcolor: `${errorColors[errorType] || '#666'}08`,
                              minWidth: '160px'
                            }}
                          >
                            <Typography variant="body2" color={errorColors[errorType]} fontWeight="bold">
                              {errorLabels[errorType] || errorType}
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color={errorColors[errorType]}>
                              {count} mensajes
                            </Typography>
                          </Paper>
                        );
                      })}
                    </Box>
                  </Grid>
                )}

                {/* Footer con configuración */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Paper sx={{ p: 3, bgcolor: '#f8fafc' }}>
                    <Typography variant="h6" color="#254e59" mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Settings /> Configuración Utilizada
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={2}>
                      <Chip 
                        label={`⚡ ${configuration.messagesPerSecond || 50} msg/seg`} 
                        sx={{ 
                          bgcolor: '#007391', 
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                      <Chip 
                        label={`📦 Lotes de ${configuration.batchSize || 100}`} 
                        sx={{ 
                          bgcolor: '#388e3c', 
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                      <Chip 
                        label={`🔄 ${configuration.concurrentBatches || 3} procesos paralelos`} 
                        sx={{ 
                          bgcolor: '#ff9800', 
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Paper>
        )}
      </Box>
    </Fade>
  );
};

export default CampaignStatsCard;
