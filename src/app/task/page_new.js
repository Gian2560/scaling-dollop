"use client";
import React, { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useClientes } from '@/hooks/useClientes';
import ActionComercialModal from '@/app/components/ActionComercialModal';
import ConversationModal from '@/app/components/ConversationModal';
import { fetchConversacion } from '../../../services/clientesService';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Box,
  Stack,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Tabs,
  Tab,
  Fade,
  Zoom,
  LinearProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Phone as PhoneIcon,
  Payment as PaymentIcon,
  Description as DescriptionIcon,
  ReportProblem as ReportProblemIcon,
  Person as PersonIcon,
  FileDownload as ExportIcon,
  Chat as ChatIcon,
  Call as CallIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Today as TodayIcon
} from '@mui/icons-material';

// Datos de tareas simuladas organizadas por los 4 estados
const initialTasks = [
  // Comunicación Inmediata
  { 
    id: 5, 
    cliente: 'Daniel', 
    telefono: '+51993538942', 
    email: 'ana.lopez@email.com',
    documento: '12345678',
    estado: 'comunicacion_inmediata', 
    fechaCreacion: '2025-08-08', 
    fechaLlamada: null, 
    llamado: false,
    gestor: 'Juan Pérez',
    observacion: 'Cliente con deuda vencida hace 15 días'
  },
  { 
    id: 2, 
    cliente: 'Carlos Pérez Silva', 
    telefono: '+51976543210', 
    email: 'carlos.perez@gmail.com',
    documento: '87654321',
    estado: 'comunicacion_inmediata', 
    fechaCreacion: '2025-08-07', 
    fechaLlamada: null, 
    llamado: false,
    gestor: 'María García',
    observacion: 'Requiere seguimiento urgente por promesa de pago incumplida'
  },
  
  // Negociación de Pago
  { 
    id: 3, 
    cliente: 'María Gómez Torres', 
    telefono: '+51965432187', 
    email: 'maria.gomez@hotmail.com',
    documento: '23456789',
    estado: 'negociacion_pago', 
    fechaCreacion: '2025-08-06', 
    fechaLlamada: null, 
    llamado: false,
    gestor: 'Luis Rodríguez',
    observacion: 'Interesada en plan de pagos fraccionado'
  },
  { 
    id: 4, 
    cliente: 'Luis Torres Mendoza', 
    telefono: '+51954321876', 
    email: 'luis.torres@yahoo.com',
    documento: '34567890',
    estado: 'negociacion_pago', 
    fechaCreacion: '2025-08-05', 
    fechaLlamada: null, 
    llamado: false,
    gestor: 'Carmen Díaz',
    observacion: 'Solicita descuento por pronto pago'
  },
  
  // Gestión de Contrato
  { 
    id: 6, 
    cliente: 'Elena Díaz Vargas', 
    telefono: '+51943218765', 
    email: 'elena.diaz@outlook.com',
    documento: '45678901',
    estado: 'gestion_contrato', 
    fechaCreacion: '2025-08-04', 
    fechaLlamada: null, 
    llamado: false,
    gestor: 'Roberto Castro',
    observacion: 'Revisión de términos contractuales pendiente'
  },
  { 
    id: 7, 
    cliente: 'José Ruiz Flores', 
    telefono: '+51932187654', 
    email: 'jose.ruiz@empresa.com',
    documento: '56789012',
    estado: 'gestion_contrato', 
    fechaCreacion: '2025-08-03', 
    fechaLlamada: null, 
    llamado: false,
    gestor: 'Ana Morales',
    observacion: 'Actualización de datos personales requerida'
  },
  
  // Reclamos
  { 
    id: 8, 
    cliente: 'Patricia Vega Sánchez', 
    telefono: '+51987123456', 
    email: 'patricia.vega@hotmail.com',
    documento: '89012345',
    estado: 'reclamos', 
    fechaCreacion: '2025-08-02', 
    fechaLlamada: null, 
    llamado: false,
    gestor: 'Carlos Mendoza',
    observacion: 'Reclamo por cobro indebido - URGENTE'
  },
  { 
    id: 9, 
    cliente: 'Roberto Silva Castro', 
    telefono: '+51976234567', 
    email: 'roberto.silva@empresa.pe',
    documento: '90123456',
    estado: 'reclamos', 
    fechaCreacion: '2025-08-01', 
    fechaLlamada: null, 
    llamado: false,
    gestor: 'Lucía Vásquez',
    observacion: 'Disconforme con atención recibida'
  }
];

// Configuración de los 4 estados con diseño profesional
const estadosConfig = {
  comunicacion_inmediata: {
    titulo: 'Comunicación Inmediata',
    subtitulo: 'Contactos urgentes requeridos',
    icono: <PhoneIcon />,
    color: '#e53935',
    gradiente: 'linear-gradient(135deg, #ff5722 0%, #e53935 100%)',
    colorBg: '#ffebee',
    descripcion: 'Clientes que requieren contacto urgente dentro de las próximas 24 horas'
  },
  negociacion_pago: {
    titulo: 'Negociación de Pago',
    subtitulo: 'Procesos de negociación activos',
    icono: <PaymentIcon />,
    color: '#ff9800',
    gradiente: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
    colorBg: '#fff3e0',
    descripcion: 'Clientes en proceso de negociación de condiciones de pago'
  },
  gestion_contrato: {
    titulo: 'Gestión de Contrato',
    subtitulo: 'Trámites contractuales',
    icono: <DescriptionIcon />,
    color: '#2196f3',
    gradiente: 'linear-gradient(135deg, #42a5f5 0%, #2196f3 100%)',
    colorBg: '#e3f2fd',
    descripcion: 'Gestiones administrativas y contractuales pendientes'
  },
  reclamos: {
    titulo: 'Reclamos',
    subtitulo: 'Atención prioritaria requerida',
    icono: <ReportProblemIcon />,
    color: '#9c27b0',
    gradiente: 'linear-gradient(135deg, #ab47bc 0%, #9c27b0 100%)',
    colorBg: '#f3e5f5',
    descripcion: 'Reclamos y quejas que requieren resolución inmediata'
  }
};

// Función para obtener el color del gestor
const getGestorColor = (gestor) => {
  const colors = ['#1976d2', '#388e3c', '#f57c00', '#7b1fa2', '#d32f2f'];
  const index = gestor.length % colors.length;
  return colors[index];
};

// Componente de Header Profesional
function ProfessionalHeader({ stats, onSearch, onFilter, searchTerm, selectedFilter }) {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative',
        mb: 4
      }}
    >
      {/* Patrón de fondo decorativo */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          zIndex: 0
        }}
      />
      
      <Box sx={{ p: 4, position: 'relative', zIndex: 1 }}>
        {/* Título principal */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center">
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 3, width: 64, height: 64 }}>
              <AssignmentIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                Centro de Tareas
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                Sistema integral de gestión comercial
              </Typography>
            </Box>
          </Box>
          <Box textAlign="right">
            <Chip 
              icon={<TodayIcon />}
              label={new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontWeight: 600,
                mb: 1
              }}
            />
            <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
              Última actualización: {new Date().toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Typography>
          </Box>
        </Box>

        {/* Estadísticas rápidas */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {stats.total}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total Tareas
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {stats.pendientes}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Pendientes
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {stats.completadas}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Completadas
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {Math.round((stats.completadas / stats.total) * 100) || 0}%
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Efectividad
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Barra de búsqueda y filtros */}
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            placeholder="Buscar por cliente, teléfono o documento..."
            variant="outlined"
            size="medium"
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'rgba(0,0,0,0.4)', mr: 1 }} />,
              sx: { bgcolor: 'white', borderRadius: 2 }
            }}
            sx={{ flex: 1 }}
          />
          <FormControl size="medium" sx={{ minWidth: 200 }}>
            <InputLabel sx={{ color: 'white' }}>Filtrar por estado</InputLabel>
            <Select
              value={selectedFilter}
              onChange={(e) => onFilter(e.target.value)}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.1)', 
                color: 'white',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.3)'
                }
              }}
            >
              <MenuItem value="">Todos los estados</MenuItem>
              {Object.entries(estadosConfig).map(([key, config]) => (
                <MenuItem key={key} value={key}>{config.titulo}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>
    </Paper>
  );
}

// Componente mejorado para las tarjetas de resumen de cada estado
function EstadoCard({ estado, tasks, onSelectEstado, selectedEstado }) {
  const config = estadosConfig[estado];
  const estadoTasks = tasks.filter(t => t.estado === estado);
  const pendientes = estadoTasks.filter(t => !t.llamado).length;
  const completados = estadoTasks.filter(t => t.llamado).length;
  const isSelected = selectedEstado === estado;
  const porcentajeCompletado = estadoTasks.length > 0 ? Math.round((completados / estadoTasks.length) * 100) : 0;

  return (
    <Zoom in timeout={500}>
      <Card
        elevation={isSelected ? 12 : 4}
        sx={{
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRadius: 3,
          overflow: 'visible',
          position: 'relative',
          height: 280,
          background: isSelected ? config.gradiente : 'white',
          color: isSelected ? 'white' : 'inherit',
          transform: isSelected ? 'translateY(-8px)' : 'none',
          '&:hover': {
            transform: 'translateY(-4px)',
            elevation: 8
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: config.gradiente,
            borderRadius: '12px 12px 0 0'
          }
        }}
        onClick={() => onSelectEstado(isSelected ? '' : estado)}
      >
        <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header con icono y título */}
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar 
              sx={{ 
                bgcolor: isSelected ? 'rgba(255,255,255,0.2)' : config.colorBg,
                color: isSelected ? 'white' : config.color,
                mr: 2,
                width: 56,
                height: 56
              }}
            >
              {config.icono}
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                {config.titulo}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: isSelected ? 0.9 : 0.7,
                  fontSize: '0.875rem'
                }}
              >
                {config.subtitulo}
              </Typography>
            </Box>
          </Box>
          
          {/* Métricas principales */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box textAlign="center">
              <Typography variant="h3" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                {pendientes}
              </Typography>
              <Typography variant="caption" sx={{ opacity: isSelected ? 0.9 : 0.7 }}>
                Pendientes
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h3" sx={{ fontWeight: 'bold', lineHeight: 1, color: isSelected ? '#4caf50' : 'success.main' }}>
                {completados}
              </Typography>
              <Typography variant="caption" sx={{ opacity: isSelected ? 0.9 : 0.7 }}>
                Completados
              </Typography>
            </Box>
          </Box>

          {/* Barra de progreso */}
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Progreso
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {porcentajeCompletado}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={porcentajeCompletado} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                bgcolor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: isSelected ? '#4caf50' : config.color,
                  borderRadius: 4
                }
              }}
            />
          </Box>

          {/* Footer con total */}
          <Box mt="auto">
            <Chip
              label={`${estadoTasks.length} tareas totales`}
              size="small"
              sx={{
                bgcolor: isSelected ? 'rgba(255,255,255,0.2)' : config.colorBg,
                color: isSelected ? 'white' : config.color,
                fontWeight: 600,
                width: '100%'
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Zoom>
  );
}

// Componente de tarjeta de tarea individual mejorado
function TaskCard({ task, onAccionComercial, onVerConversacion, config }) {
  return (
    <Fade in timeout={300}>
      <Card 
        elevation={task.llamado ? 2 : 6}
        sx={{ 
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          background: task.llamado 
            ? 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)' 
            : 'white',
          opacity: task.llamado ? 0.85 : 1,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
          },
          '&::before': task.llamado ? {} : {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: config.gradiente
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header con estado de la tarea */}
          {task.llamado && (
            <Box display="flex" justifyContent="flex-end" mb={1}>
              <Chip
                icon={<CheckCircleIcon />}
                label="Completado"
                size="small"
                color="success"
                sx={{ fontWeight: 600 }}
              />
            </Box>
          )}
          
          {/* Información del cliente */}
          <Box display="flex" alignItems="start" mb={2}>
            <Avatar 
              sx={{ 
                bgcolor: task.llamado ? '#4caf50' : config.color, 
                mr: 2, 
                width: 48, 
                height: 48 
              }}
            >
              <PersonIcon />
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                {task.cliente}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  icon={<PhoneIcon />}
                  label={task.telefono}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
                <Chip
                  icon={<PersonIcon />}
                  label={`Doc: ${task.documento}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              </Stack>
            </Box>
            <Chip
              label={task.gestor}
              size="small"
              sx={{ 
                bgcolor: getGestorColor(task.gestor),
                color: 'white',
                fontWeight: 600
              }}
            />
          </Box>

          {/* Observación */}
          {task.observacion && (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                mb: 2, 
                bgcolor: task.llamado ? 'rgba(255,255,255,0.7)' : '#f8f9fa',
                borderLeft: `3px solid ${config.color}`,
                borderRadius: 1
              }}
            >
              <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                {task.observacion}
              </Typography>
            </Paper>
          )}

          {/* Información temporal */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="caption" color="text.secondary" display="flex" alignItems="center">
                <ScheduleIcon sx={{ fontSize: 14, mr: 0.5 }} />
                Creado: {task.fechaCreacion}
              </Typography>
              {task.fechaLlamada && (
                <Typography variant="caption" color="success.main" display="flex" alignItems="center" mt={0.5}>
                  <CheckCircleIcon sx={{ fontSize: 14, mr: 0.5 }} />
                  Completado: {task.fechaLlamada}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Botones de acción */}
          <Box display="flex" gap={1} justifyContent="flex-end">
            <Button
              variant="outlined"
              size="small"
              startIcon={<ChatIcon />}
              onClick={() => onVerConversacion(task.id)}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Ver Chat
            </Button>
            <Button
              variant={task.llamado ? "outlined" : "contained"}
              color={task.llamado ? "success" : "primary"}
              size="small"
              startIcon={task.llamado ? <CheckCircleIcon /> : <CallIcon />}
              onClick={() => onAccionComercial(task)}
              disabled={task.llamado}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                minWidth: 140
              }}
            >
              {task.llamado ? 'Completado' : 'Realizar Llamada'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
}

// Componente mejorado para mostrar las tareas de un estado específico
function EstadoSection({ estado, tasks, onAccionComercial, onVerConversacion }) {
  const config = estadosConfig[estado];
  const estadoTasks = tasks.filter(t => t.estado === estado);
  const pendientes = estadoTasks.filter(t => !t.llamado);
  const completados = estadoTasks.filter(t => t.llamado);

  if (estadoTasks.length === 0) return null;

  return (
    <Box mb={4}>
      {/* Header de sección */}
      <Paper 
        elevation={2} 
        sx={{ 
          background: config.gradiente,
          color: 'white',
          borderRadius: 3,
          mb: 3,
          overflow: 'hidden'
        }}
      >
        <Box p={3}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2, width: 48, height: 48 }}>
                {config.icono}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {config.titulo}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {config.descripcion}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" gap={2}>
              <Box textAlign="center">
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {pendientes.length}
                </Typography>
                <Typography variant="caption">Pendientes</Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {completados.length}
                </Typography>
                <Typography variant="caption">Completados</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Grid de tareas */}
      <Grid container spacing={3}>
        {estadoTasks.map(task => (
          <Grid item xs={12} lg={6} key={task.id}>
            <TaskCard
              task={task}
              onAccionComercial={onAccionComercial}
              onVerConversacion={onVerConversacion}
              config={config}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

// Toolbar profesional mejorado
function ProfessionalToolbar({ onExport, stats, onViewChange, currentView }) {
  return (
    <Paper elevation={2} sx={{ borderRadius: 3, mb: 3, overflow: 'hidden' }}>
      <Box sx={{ 
        background: 'linear-gradient(90deg, #f8f9fa 0%, #e9ecef 100%)',
        p: 3
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#495057', mb: 1 }}>
              Panel de Control
            </Typography>
            <Box display="flex" gap={3}>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: '#007391', width: 24, height: 24, mr: 1 }}>
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}>
                    {stats.total}
                  </Typography>
                </Avatar>
                <Typography variant="body2" color="text.secondary">
                  Total
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: '#ff9800', width: 24, height: 24, mr: 1 }}>
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}>
                    {stats.pendientes}
                  </Typography>
                </Avatar>
                <Typography variant="body2" color="text.secondary">
                  Pendientes
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: '#4caf50', width: 24, height: 24, mr: 1 }}>
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}>
                    {stats.completadas}
                  </Typography>
                </Avatar>
                <Typography variant="body2" color="text.secondary">
                  Completadas
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Box display="flex" gap={2} alignItems="center">
            <Tabs 
              value={currentView} 
              onChange={(e, newValue) => onViewChange(newValue)}
              sx={{ minHeight: 'auto' }}
            >
              <Tab 
                label="Vista Resumen" 
                value="cards"
                sx={{ minHeight: 'auto', textTransform: 'none', fontWeight: 600 }}
              />
              <Tab 
                label="Vista Detallada" 
                value="detailed"
                sx={{ minHeight: 'auto', textTransform: 'none', fontWeight: 600 }}
              />
            </Tabs>
            <Button
              variant="contained"
              startIcon={<ExportIcon />}
              onClick={onExport}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                bgcolor: '#007391',
                '&:hover': { bgcolor: '#005f73' }
              }}
            >
              Exportar
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedEstado, setSelectedEstado] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openConversationModal, setOpenConversationModal] = useState(false);
  const [conversationData, setConversationData] = useState(null);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [currentView, setCurrentView] = useState('cards');
  const { data: session } = useSession();
  const { 
    gestores, 
    handleSaveCliente
  } = useClientes();

  // Función para abrir modal de acción comercial
  const handleAccionComercial = (task) => {
    setSelectedClient({
      id: task.id,
      nombre: task.cliente,
      celular: task.telefono,
      email: task.email,
      documento: task.documento,
      gestor: task.gestor,
      observacion: task.observacion
    });
    setOpenModal(true);
  };

  // Función para cerrar modal de acción comercial
  const handleClose = () => {
    setOpenModal(false);
    setSelectedClient(null);
  };

  // Función para ver conversación
  const handleVerConversacion = async (clienteId) => {
    setConversationLoading(true);
    setOpenConversationModal(true);

    try {
      const data = await fetchConversacion(clienteId);
      setConversationData(data);
    } catch (error) {
      console.error("Error al obtener la conversación:", error);
      setConversationData(null);
    } finally {
      setConversationLoading(false);
    }
  };

  // Función para cerrar modal de conversación
  const handleCloseConversation = () => {
    setOpenConversationModal(false);
    setConversationData(null);
    setSelectedConversation(0);
  };

  // Función personalizada para guardar cliente y marcar tarea como llamada
  const handleSaveClienteAndMarkTask = async (clienteData) => {
    try {
      // Primero guardar en la base de datos usando el hook
      await handleSaveCliente(clienteData);
      
      // Luego marcar la tarea como llamada localmente
      const now = new Date();
      const fechaHora = now.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

      setTasks(prev => prev.map(task => 
        task.id === clienteData.id 
          ? { ...task, llamado: true, fechaLlamada: fechaHora }
          : task
      ));
      
      // Cerrar el modal
      handleClose();
      
    } catch (error) {
      console.error('Error al guardar cliente:', error);
    }
  };

  // Función para exportar datos
  const handleExport = () => {
    const csv = [
      ['ID', 'Cliente', 'Teléfono', 'Email', 'Documento', 'Estado', 'Gestor', 'Fecha Creación', 'Llamado', 'Fecha Llamada', 'Observación'],
      ...filteredTasks.map(t => [
        t.id, 
        t.cliente, 
        t.telefono,
        t.email || 'N/A',
        t.documento,
        estadosConfig[t.estado].titulo,
        t.gestor, 
        t.fechaCreacion, 
        t.llamado ? 'Sí' : 'No', 
        t.fechaLlamada || 'N/A',
        t.observacion || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tareas_asesor_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calcular estadísticas
  const stats = useMemo(() => {
    const total = tasks.length;
    const completadas = tasks.filter(t => t.llamado).length;
    const pendientes = total - completadas;
    return { total, completadas, pendientes };
  }, [tasks]);

  // Filtrar tareas
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = searchTerm === '' || 
        task.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.telefono.includes(searchTerm) ||
        task.documento.includes(searchTerm);
      
      const matchesFilter = filterEstado === '' || task.estado === filterEstado;
      const matchesSelectedEstado = selectedEstado === '' || task.estado === selectedEstado;
      
      return matchesSearch && matchesFilter && matchesSelectedEstado;
    });
  }, [tasks, searchTerm, filterEstado, selectedEstado]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header profesional */}
      <ProfessionalHeader 
        stats={stats}
        onSearch={setSearchTerm}
        onFilter={setFilterEstado}
        searchTerm={searchTerm}
        selectedFilter={filterEstado}
      />

      {/* Toolbar profesional */}
      <ProfessionalToolbar 
        onExport={handleExport}
        stats={stats}
        onViewChange={setCurrentView}
        currentView={currentView}
      />

      {/* Vista de tarjetas de estados */}
      {currentView === 'cards' && !selectedEstado && (
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {Object.keys(estadosConfig).map(estado => (
            <Grid item xs={12} md={6} lg={3} key={estado}>
              <EstadoCard
                estado={estado}
                tasks={filteredTasks}
                onSelectEstado={setSelectedEstado}
                selectedEstado={selectedEstado}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Vista detallada */}
      {(currentView === 'detailed' || selectedEstado) && (
        <Box>
          {selectedEstado ? (
            // Vista de estado específico
            <Box>
              <Box display="flex" alignItems="center" mb={3}>
                <Button
                  variant="outlined"
                  onClick={() => setSelectedEstado('')}
                  sx={{ mr: 2, borderRadius: 2 }}
                >
                  ← Volver a todos los estados
                </Button>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {estadosConfig[selectedEstado].titulo}
                </Typography>
              </Box>
              <EstadoSection
                estado={selectedEstado}
                tasks={filteredTasks}
                onAccionComercial={handleAccionComercial}
                onVerConversacion={handleVerConversacion}
              />
            </Box>
          ) : (
            // Vista general de todos los estados
            <Box>
              {Object.keys(estadosConfig).map(estado => (
                <EstadoSection
                  key={estado}
                  estado={estado}
                  tasks={filteredTasks}
                  onAccionComercial={handleAccionComercial}
                  onVerConversacion={handleVerConversacion}
                />
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* Mensaje cuando no hay tareas */}
      {filteredTasks.length === 0 && (
        <Paper 
          elevation={2} 
          sx={{ 
            p: 6, 
            textAlign: 'center', 
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
          }}
        >
          <Avatar sx={{ bgcolor: '#6c757d', mx: 'auto', mb: 2, width: 64, height: 64 }}>
            <SearchIcon fontSize="large" />
          </Avatar>
          <Typography variant="h6" color="text.secondary" mb={1}>
            No se encontraron tareas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ajusta los filtros de búsqueda para ver más resultados
          </Typography>
        </Paper>
      )}

      {/* Modales */}
      <ActionComercialModal
        open={openModal}
        onClose={handleClose}
        cliente={selectedClient}
        onSave={handleSaveClienteAndMarkTask}
        gestores={gestores}
      />

      <ConversationModal
        open={openConversationModal}
        onClose={handleCloseConversation}
        conversationData={conversationData}
        conversationLoading={conversationLoading}
        selectedConversation={selectedConversation}
        setSelectedConversation={setSelectedConversation}
      />
    </Container>
  );
}
