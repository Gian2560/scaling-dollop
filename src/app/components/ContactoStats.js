"use client";
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Container,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import SendIcon from '@mui/icons-material/Send';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import GroupIcon from '@mui/icons-material/Group';

const ESTADO_COLORS = {
  'sent': '#2196f3',
  'delivered': '#4caf50',
  'read': '#9c27b0',
  'failed': '#f44336',
};

// Función para traducir texto usando Google Translate API gratuita
const translateText = async (text, targetLang = 'es') => {
  if (!text) return text;
  
  try {
    // Usar la API gratuita de Google Translate (sin autenticación)
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    // La respuesta está en data[0][0][0]
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      return data[0][0][0];
    }
    
    return text; // Si falla, retornar el texto original
  } catch (error) {
    console.error('Error translating:', error);
    return text; // Si hay error, retornar el texto original
  }
};

// Función para obtener estadísticas de campaña
const fetchCampaignStats = async (campaignId) => {
  try {
    const response = await fetch(`/api/campaigns/${campaignId}/stats`);
    if (!response.ok) throw new Error('Error fetching campaign stats');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// Función para exportar CSV
const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  const headers = ['Nombre', 'Celular', 'Documento', 'Estado', 'Código Error', 'Mensaje Error', 'Fecha Envío'];
  const rows = data.map(row => [
    row.nombre || '',
    row.celular || '',
    row.documento || '',
    row.estado || '',
    row.errorCode || '',
    row.errorMessage || '',
    new Date(row.fechaEnvio).toLocaleString('es-PE'),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function ContactoStats({ campaignId }) {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [translatedErrors, setTranslatedErrors] = useState({});

  useEffect(() => {
    const loadStats = async () => {
      if (campaignId) {
        setLoading(true);
        setError(null);
        try {
          const data = await fetchCampaignStats(campaignId);
          setStatsData(data);
          
          // Traducir los mensajes de error
          if (data.errorData && data.errorData.length > 0) {
            const translations = {};
            for (const errorItem of data.errorData) {
              if (errorItem.message) {
                const translated = await translateText(errorItem.message);
                translations[errorItem.code] = translated;
              }
            }
            setTranslatedErrors(translations);
          }
        } catch (err) {
          setError('Error al cargar estadísticas');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };
    loadStats();
  }, [campaignId]);

  const handleExportCSV = () => {
    if (statsData?.contactabilityDetails) {
      exportToCSV(
        statsData.contactabilityDetails,
        `contactabilidad_campana_${campaignId}_${new Date().toISOString().split('T')[0]}.csv`
      );
    }
  };

  if (loading) {
    return null;
  }

  if (error || !statsData) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error || 'No se pudieron cargar las estadísticas'}</Alert>
      </Container>
    );
  }

  const kpiCards = [
    { title: 'Total', value: statsData.total, icon: <GroupIcon sx={{ fontSize: 40 }} />, color: '#607d8b', bgColor: '#eceff1' },
    { title: 'Enviados', value: statsData.sent, icon: <SendIcon sx={{ fontSize: 40 }} />, color: '#2196f3', bgColor: '#e3f2fd' },
    { title: 'Entregados', value: statsData.delivered, icon: <DoneAllIcon sx={{ fontSize: 40 }} />, color: '#4caf50', bgColor: '#e8f5e9' },
    { title: 'Leídos', value: statsData.read, icon: <VisibilityIcon sx={{ fontSize: 40 }} />, color: '#9c27b0', bgColor: '#f3e5f5' },
    { title: 'Fallidos', value: statsData.failed, icon: <ErrorIcon sx={{ fontSize: 40 }} />, color: '#f44336', bgColor: '#ffebee' },
  ];

  const statusData = [
    { name: 'Enviados', value: statsData.sent, color: '#2196f3' },
    { name: 'Entregados', value: statsData.delivered, color: '#4caf50' },
    { name: 'Leídos', value: statsData.read, color: '#9c27b0' },
    { name: 'Fallidos', value: statsData.failed, color: '#f44336' },
  ].filter(item => item.value > 0);

  // Usar datos reales del API o datos por defecto
  const barData = statsData.barData && statsData.barData.length > 0 ? statsData.barData : [];

  // Usar mensajes reales del API
  const mensajesRecientes = statsData.mensajesRecientes || [];

  // Datos de errores
  const errorData = statsData.errorData || [];

  // Datos del funnel
  const funnelData = statsData.funnelData || [];
  const conversionRates = statsData.conversionRates || {};

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header con título y botón de exportar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ 
          background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          📊 Contactabilidad de Campaña
        </Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExportCSV}
          sx={{
            background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
            color: 'white',
            fontWeight: 'bold',
            px: 3,
            '&:hover': {
              background: 'linear-gradient(45deg, #1976d2, #00bcd4)',
            }
          }}
        >
          Exportar CSV
        </Button>
      </Box>

      {/* KPIs Cards */}
      <Grid container spacing={3} mb={3}>
        {kpiCards.map((stat) => (
          <Grid item xs={6} sm={6} md={2.4} key={stat.title}>
            <Card 
              elevation={4} 
              sx={{ 
                borderRadius: 3,
                bgcolor: stat.bgColor,
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Box sx={{ color: stat.color, mb: 1 }}>
                  {stat.icon}
                </Box>
                <Typography variant="h4" fontWeight="bold" color={stat.color}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight="500">
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Métricas Principales */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" color="#2196f3" mb={2} textAlign="center">
                Tasa de Entrega
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h3" fontWeight="bold" color="#4caf50">
                  {statsData.tasaEntrega}%
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" textAlign="center" mt={1}>
                Mensajes entregados exitosamente
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" color="#2196f3" mb={2} textAlign="center">
                Tasa de Lectura
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h3" fontWeight="bold" color="#9c27b0">
                  {statsData.tasaLectura}%
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" textAlign="center" mt={1}>
                Mensajes leídos por los destinatarios
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" color="#2196f3" mb={2} textAlign="center">
                Tasa de Fallo
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h3" fontWeight="bold" color="#f44336">
                  {statsData.tasaFallo}%
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" textAlign="center" mt={1}>
                Mensajes que fallaron al enviarse
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos - Fila 1: Distribución y Funnel */}
      <Grid container spacing={3} mb={3}>
        {/* Distribución de Estados (Pie Chart) */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" color="#2196f3" mb={2} textAlign="center">
                Distribución de Estados
              </Typography>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={5}>
                  No hay datos disponibles
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Funnel de Conversión */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" color="#2196f3" mb={2} textAlign="center">
                Funnel de Conversión
              </Typography>
              {funnelData.length > 0 ? (
                <Box>
                  {/* Funnel Visual con forma de Trapecio */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    gap: 0.5, 
                    mb: 2,
                    py: 1,
                  }}>
                    {funnelData.map((stage, index) => {
                      // Calcular el ancho basado en el índice para crear efecto embudo
                      const widthPercentage = 100 - (index * 15); // 100%, 85%, 70%
                      
                      return (
                        <Box 
                          key={index}
                          sx={{
                            position: 'relative',
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                          }}
                        >
                          {/* Trapecio con clip-path */}
                          <Box
                            sx={{
                              width: `${widthPercentage}%`,
                              bgcolor: stage.color,
                              color: 'white',
                              py: 1.5,
                              px: 2,
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              gap: 1.5,
                              transition: 'all 0.3s ease',
                              boxShadow: 2,
                              clipPath: index < funnelData.length - 1 
                                ? 'polygon(5% 0%, 95% 0%, 90% 100%, 10% 100%)'  // Trapecio para los primeros
                                : 'polygon(8% 0%, 92% 0%, 85% 100%, 15% 100%)', // Más estrecho para el último
                              '&:hover': {
                                boxShadow: 4,
                                transform: 'scale(1.02)',
                              },
                            }}
                          >
                            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '13px' }}>
                              {stage.name}
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '16px' }}>
                              {stage.value} ({stage.percentage}%)
                            </Typography>
                          </Box>
                          
                          {/* Flecha de transición */}
                          {index < funnelData.length - 1 && (
                            <Box sx={{ 
                              fontSize: '14px', 
                              color: '#9e9e9e',
                              position: 'absolute',
                              bottom: '-10px',
                              zIndex: 1,
                            }}>
                              ▼
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                  
                  {/* Tasas de Conversión - más compactas */}
                  <Box sx={{ mt: 3, pt: 2, borderTop: '2px solid #e0e0e0' }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" mb={1.5} sx={{ fontSize: '13px' }}>
                      Tasas de Conversión:
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={12}>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          bgcolor: '#f5f5f5',
                          p: 1,
                          borderRadius: 1,
                        }}>
                          <Typography variant="body2" sx={{ fontSize: '12px' }}>
                            Enviados → Entregados:
                          </Typography>
                          <Chip 
                            label={`${conversionRates.sentToDelivered}%`} 
                            size="small" 
                            sx={{ 
                              bgcolor: '#4caf50', 
                              color: 'white', 
                              fontWeight: 'bold',
                              height: '24px',
                              fontSize: '12px',
                            }}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          bgcolor: '#f5f5f5',
                          p: 1,
                          borderRadius: 1,
                        }}>
                          <Typography variant="body2" sx={{ fontSize: '12px' }}>
                            Entregados → Leídos:
                          </Typography>
                          <Chip 
                            label={`${conversionRates.deliveredToRead}%`} 
                            size="small" 
                            sx={{ 
                              bgcolor: '#9c27b0', 
                              color: 'white', 
                              fontWeight: 'bold',
                              height: '24px',
                              fontSize: '12px',
                            }}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          bgcolor: '#e3f2fd',
                          p: 1,
                          borderRadius: 1,
                          border: '1px solid #2196f3',
                        }}>
                          <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '12px' }}>
                            Conversión Total:
                          </Typography>
                          <Chip 
                            label={`${conversionRates.overallConversion}%`} 
                            size="small" 
                            sx={{ 
                              bgcolor: '#2196f3', 
                              color: 'white', 
                              fontWeight: 'bold',
                              height: '24px',
                              fontSize: '12px',
                            }}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={5}>
                  No hay datos de conversión disponibles
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos - Fila 2: Actividad por Día y Errores */}
      <Grid container spacing={3} mb={3}>
        {/* Actividad por Día */}
        <Grid item xs={12} md={errorData.length > 0 ? 6 : 12}>
          <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" color="#2196f3" mb={2} textAlign="center">
                Actividad por Día (Últimos 7 días)
              </Typography>
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dia" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="enviados" fill="#2196f3" name="Enviados" />
                    <Bar dataKey="entregados" fill="#4caf50" name="Entregados" />
                    <Bar dataKey="leidos" fill="#9c27b0" name="Leídos" />
                    <Bar dataKey="fallidos" fill="#f44336" name="Fallidos" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={5}>
                  No hay datos de actividad
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Análisis de Errores */}
        {errorData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" color="#2196f3" mb={2} textAlign="center">
                Errores Detectados
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={errorData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="code" width={80} />
                    <Tooltip 
                      content={({ payload }) => {
                        if (payload && payload[0]) {
                          const errorCode = payload[0].payload.code;
                          const originalMessage = payload[0].payload.message;
                          const translatedMessage = translatedErrors[errorCode] || originalMessage;
                          
                          return (
                            <Paper sx={{ p: 2, maxWidth: 350 }}>
                              <Typography variant="body2" fontWeight="bold" color="error">
                                Código: {errorCode}
                              </Typography>
                              <Typography variant="body2" fontSize="12px" sx={{ mt: 1, mb: 1 }}>
                                {translatedMessage}
                              </Typography>
                              <Typography variant="body2" color="primary" fontWeight="bold">
                                Cantidad: {payload[0].value}
                              </Typography>
                            </Paper>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" fill="#f44336" name="Cantidad" />
                  </BarChart>
                </ResponsiveContainer>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" fontStyle="italic" fontSize="12px">
                    Los códigos de error más frecuentes pueden indicar problemas sistemáticos
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Tabla de mensajes recientes */}
     {/* <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card elevation={3} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" color="#2196f3" mb={2}>
                📋 Mensajes Recientes
              </Typography>
              {mensajesRecientes.length > 0 ? (
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Destinatario</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Celular</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Error</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mensajesRecientes.map((msg) => (
                        <TableRow key={msg.id} hover>
                          <TableCell>{msg.destinatario}</TableCell>
                          <TableCell>{msg.celular}</TableCell>
                          <TableCell>
                            <Chip 
                              label={msg.estado} 
                              size="small"
                              sx={{ 
                                bgcolor: ESTADO_COLORS[msg.estado],
                                color: '#fff',
                                fontWeight: 'bold',
                              }} 
                            />
                          </TableCell>
                          <TableCell>{msg.fecha}</TableCell>
                          <TableCell>
                            {msg.errorCode ? (
                              <Chip 
                                label={`${msg.errorCode}`}
                                size="small"
                                color="error"
                                title={msg.errorMessage}
                              />
                            ) : (
                              '-'
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                  No hay mensajes recientes
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>*/}
    </Container>
  );
}

