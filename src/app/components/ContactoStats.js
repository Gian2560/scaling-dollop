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
} from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ReplyIcon from '@mui/icons-material/Reply';
import GroupIcon from '@mui/icons-material/Group';

const ESTADO_COLORS = {
  'Enviado': '#1976d2',
  'Entregado': '#2e7d32', 
  'Fallido': '#d32f2f',
  'Respondido': '#5e35b1',
  'En cola': '#ff9800',
  'Enviando': '#00bcd4',
  'Desconocido': '#616161',
  // Estados antiguos para compatibilidad
  'Leído': '#1976d2',
  'Pendiente': '#9e9e9e',
};

// Función para obtener estadísticas de campaña
const fetchCampaignStats = async (campaignId) => {
  try {
    const response = await fetch(`/api/campaigns/${campaignId}/stats`);
    if (!response.ok) throw new Error('Error fetching campaign stats');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    // Datos dummy como fallback
    return {
      totalEnviados: 0,
      entregados: 0,
      leidos: 0,
      fallidos: 0,
      respondidos: 0,
      clientesContactados: 0,
      tasaEntrega: 0,
      tasaLectura: 0,
      tasaRespuesta: 0,
      barData: [],
      mensajesRecientes: [],
    };
  }
};

export default function ContactoStats({ campaignId }) {
  const [statsData, setStatsData] = useState({
    totalEnviados: 0,
    entregados: 0,
    leidos: 0,
    fallidos: 0,
    respondidos: 0,
    clientesContactados: 0,
    tasaEntrega: 0,
    tasaLectura: 0,
    tasaRespuesta: 0,
    barData: [],
    mensajesRecientes: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (campaignId) {
        setLoading(true);
        const data = await fetchCampaignStats(campaignId);
        setStatsData(data);
        setLoading(false);
      }
    };
    loadStats();
  }, [campaignId]);

  const kpiCards = [
    { title: 'Total Enviados', value: statsData.totalEnviados, icon: <CheckCircleIcon sx={{ color: '#1976d2', fontSize: 32 }} /> },
    { title: 'Entregados', value: statsData.entregados, icon: <CheckCircleIcon sx={{ color: '#2e7d32', fontSize: 32 }} /> },
   // { title: 'Leídos', value: statsData.leidos, icon: <VisibilityIcon sx={{ color: '#1976d2', fontSize: 32 }} /> },
    { title: 'Fallidos', value: statsData.fallidos, icon: <ErrorIcon sx={{ color: '#d32f2f', fontSize: 32 }} /> },
    { title: 'Respondidos', value: statsData.respondidos, icon: <ReplyIcon sx={{ color: '#5e35b1', fontSize: 32 }} /> },
    { title: 'Clientes Contactados', value: statsData.clientesContactados, icon: <GroupIcon sx={{ color: '#ff9800', fontSize: 32 }} /> },
  ];

  const funnelData = [
    { name: 'Enviados', value: statsData.totalEnviados },
    { name: 'Entregados', value: statsData.entregados },
   // { name: 'Leídos', value: statsData.leidos },
    { name: 'Respondidos', value: statsData.respondidos },
  ];

  // Usar datos reales del API o datos por defecto
  const barData = statsData.barData && statsData.barData.length > 0 ? statsData.barData : [
    { dia: 'Lun', enviados: 0, entregados: 0, leidos: 0, respondidos: 0 },
    { dia: 'Mar', enviados: 0, entregados: 0, leidos: 0, respondidos: 0 },
    { dia: 'Mié', enviados: 0, entregados: 0, leidos: 0, respondidos: 0 },
    { dia: 'Jue', enviados: 0, entregados: 0, leidos: 0, respondidos: 0 },
    { dia: 'Vie', enviados: 0, entregados: 0, leidos: 0, respondidos: 0 },
  ];

  // Usar mensajes reales del API o datos por defecto
  const mensajesRecientes = statsData.mensajesRecientes && statsData.mensajesRecientes.length > 0 ? statsData.mensajesRecientes : [
    { id: 1, destinatario: 'Sin datos', estado: 'Pendiente', fecha: '', respuesta: '' },
  ];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 2, mb: 2 }}>
        <Typography variant="h6">Cargando estadísticas...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 2 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="#1976d2">
        Dashboard de WhatsApp - Campaña #{campaignId}
      </Typography>

      {/* KPIs y PieChart en una sola fila */}
      <Grid container spacing={2} alignItems="stretch" mb={2}>
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            {kpiCards.map((stat) => (
              <Grid item xs={6} sm={4} key={stat.title}>
                <Card elevation={3} sx={{ borderRadius: 2, bgcolor: '#e3f2fd', height: '100%' }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                    {stat.icon}
                    <Box>
                      <Typography variant="subtitle2" color="#1976d2">
                        {stat.title}
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="#254e59">
                        {stat.value}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', py: 2 }}>
            <Typography variant="subtitle1" color="#1976d2" mb={1}>
              Distribución de Estados
            </Typography>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={funnelData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  label
                >
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(ESTADO_COLORS)[index % 4]} opacity={0.85} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos compactos en una fila */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ pb: 1 }}>
              <Typography variant="subtitle1" color="#1976d2" mb={1}>
                Embudo de Conversión
              </Typography>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={funnelData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1976d2" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ pb: 1 }}>
              <Typography variant="subtitle1" color="#1976d2" mb={1}>
                Actividad por Día
              </Typography>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dia" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="enviados" fill="#1976d2" />
                  <Bar dataKey="entregados" fill="#2e7d32" />
                  <Bar dataKey="leidos" fill="#1976d2" />
                  <Bar dataKey="respondidos" fill="#5e35b1" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabla de mensajes recientes compacta */}
      <Card elevation={2} sx={{ borderRadius: 2 }}>
        <CardContent sx={{ pb: 1 }}>
          <Typography variant="subtitle1" color="#1976d2" mb={1}>
            Mensajes Recientes
          </Typography>
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Destinatario</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Respuesta</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mensajesRecientes.map((msg) => (
                  <TableRow key={msg.id}>
                    <TableCell>{msg.id}</TableCell>
                    <TableCell>{msg.destinatario}</TableCell>
                    <TableCell>
                      <Chip label={msg.estado} sx={{ bgcolor: ESTADO_COLORS[msg.estado], color: '#fff', fontWeight: 'bold', opacity: 0.85 }} />
                    </TableCell>
                    <TableCell>{msg.fecha}</TableCell>
                    <TableCell>{msg.respuesta || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Container>
  );
}

