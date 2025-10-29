"use client";

import React, { useState, useMemo } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Avatar,
  Chip,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  CircularProgress,
  Fade,
  InputAdornment
} from '@mui/material';

// Iconos
import GroupIcon from '@mui/icons-material/Group';
import TodayIcon from '@mui/icons-material/Today';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CallIcon from '@mui/icons-material/Call';
import ChatIcon from '@mui/icons-material/Chat';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';

import { useClientes } from '@/hooks/useClientes';
import ClientesFilters from '@/app/components/ClientesFilters';
import ActionComercialModal from '@/app/components/ActionComercialModal';
import ConversationModal from '@/app/components/ConversationModal';

// Estados disponibles con sus colores
const ESTADOS = {
  'Solicita devolucion de dinero': { color: '#b45309', bgcolor: '#fffbeb' },   // amber-600 / amber-50 (atención)
  'Interesado en reactivar':       { color: '#2563eb', bgcolor: '#eef2ff' },   // blue-600 / indigo-50 (interés/acción)
  'Reclamo activo':                { color: '#e11d48', bgcolor: '#fff1f2' },   // rose-600 / rose-50 (alerta)
  'Indeciso':                      { color: '#ca8a04', bgcolor: '#fefce8' },   // yellow-600 / yellow-50 (pendiente)
  'No interesado':                 { color: '#6b7280', bgcolor: '#f9fafb' },   // gray-500 / gray-50 (neutro)
  'Fecha de Pago':                 { color: '#059669', bgcolor: '#ecfdf5' }    // emerald-600 / emerald-50 (éxito)
};

const ESTADOS_ASESOR = {
  'Sin accion comercial': { color: '#b45309', bgcolor: '#fffbeb' }, // amber-600 / amber-50 (pendiente)
  'No interesado':        { color: '#6b7280', bgcolor: '#f9fafb' }, // gray-500 / gray-50 (neutro)
  'Promesa de Pago':      { color: '#0d9488', bgcolor: '#f0fdfa' }, // teal-600 / teal-50 (compromiso)
  'Volver a contactar':   { color: '#4f46e5', bgcolor: '#eef2ff' }, // indigo-600 / indigo-50 (acción próxima)
  'En seguimiento':       { color: '#0284c7', bgcolor: '#e0f2fe' }, // sky-600 / sky-100 (en progreso)
  'Reactivado':           { color: '#15803d', bgcolor: '#ecfdf5' }  // green-700 / emerald-50 (éxito)
};

// Header profesional más compacto
function ProfessionalHeader({ totalClientes, activeFilters }) {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        background: 'linear-gradient(135deg, #007391 0%, #00a8cc 100%)',
        borderRadius: 3,
        mb: 2,
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 32, height: 32 }}>
              <GroupIcon sx={{ fontSize: 18 }} />
            </Avatar>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600, fontSize: '1.25rem' }}>
              Gestión de Clientes
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip 
              icon={<PersonIcon sx={{ fontSize: 16 }} />}
              label={`${totalClientes} clientes`}
              size="small"
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontWeight: 500,
                height: 28
              }}
            />
            {activeFilters > 0 && (
              <Chip 
                icon={<FilterListIcon sx={{ fontSize: 16 }} />}
                label={`${activeFilters} filtros activos`}
                size="small"
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  fontWeight: 500,
                  height: 28
                }}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

// Tabla moderna de clientes
function ModernClientesTable({ 
  clientes, 
  totalClientes,
  loading, 
  pagination, 
  setPagination,
  handleAccionComercial,
  handleVerConversacion 
}) {
  const getEstadoColor = (estado, isAsesor = false) => {
    const estadosMap = isAsesor ? ESTADOS_ASESOR : ESTADOS;
    return estadosMap[estado] || { color: '#6b7280', bgcolor: '#f9fafb' };
  };

  return (
    <Paper elevation={1} sx={{ borderRadius: 2 }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#007391' }}>
              <TableCell sx={{ fontWeight: 600, color: '#ffffffff' }}>Cliente</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#ffffffff' }}>Contacto</TableCell>
              <TableCell sx={{ fontWeight: 600, color:  '#ffffffff' }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 600, color:  '#ffffffff' }}>Estado Asesor</TableCell>
              <TableCell sx={{ fontWeight: 600, color:  '#ffffffff' }}>Gestor</TableCell>
              <TableCell sx={{ fontWeight: 600, color:  '#ffffffff' }}>Pago</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, color:  '#ffffffff' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clientes.map((cliente) => (
              <TableRow key={cliente.id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ width: 40, height: 40, bgcolor: '#007391' }}>
                      {cliente.nombre?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {cliente.nombre}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Doc: {cliente.documento_identidad}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" display="flex" alignItems="center" gap={0.5}>
                      <PhoneIcon sx={{ fontSize: 16, color: '#64748b' }} />
                      {cliente.celular}
                    </Typography>
                    {cliente.email && (
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                        {cliente.email}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  {cliente.estado && (
                    <Chip
                      label={cliente.estado}
                      size="small"
                      sx={{
                        fontWeight: 500,
                        fontSize: '0.75rem',
                        ...getEstadoColor(cliente.estado),
                        bgcolor: getEstadoColor(cliente.estado).bgcolor,
                        color: getEstadoColor(cliente.estado).color,
                      }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  {cliente.accion && (
                    <Chip
                      label={cliente.accion}
                      size="small"
                      sx={{
                        fontWeight: 500,
                        fontSize: '0.75rem',
                        ...getEstadoColor(cliente.accion, true),
                        bgcolor: getEstadoColor(cliente.accion, true).bgcolor,
                        color: getEstadoColor(cliente.accion, true).color,
                      }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ width: 24, height: 24, bgcolor: '#64748b', fontSize: 12 }}>
                      {cliente.gestor?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="body2">
                      {cliente.gestor || 'Sin asignar'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label="Sin definir"
                    size="small"
                    sx={{
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      bgcolor: '#f3f4f6',
                      color: '#6b7280',
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Box display="flex" justifyContent="center" gap={0.5}>
                    <Tooltip title="Realizar llamada">
                      <IconButton 
                        size="small"
                        sx={{ color: '#059669' }}
                        onClick={() => handleAccionComercial(cliente)}
                      >
                        <CallIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ver conversación">
                      <IconButton 
                        size="small"
                        sx={{ color: '#0ea5e9' }}
                        onClick={() => handleVerConversacion(cliente.id)}
                      >
                        <ChatIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {clientes.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">
                    No se encontraron clientes
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        component="div"
        count={totalClientes}
        page={pagination.page}
        onPageChange={(event, newPage) => setPagination({ ...pagination, page: newPage })}
        rowsPerPage={pagination.pageSize}
        onRowsPerPageChange={(event) => {
          setPagination({ 
            ...pagination, 
            pageSize: parseInt(event.target.value, 10),
            page: 0 
          });
        }}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />
    </Paper>
  );
}

// Componente principal
export default function ClientesGestionPage() {
  // Hook para obtener datos - usar sus propios estados
  const { 
    clientes, 
    loading, 
    totalClientes,
    gestores, // Agregar gestores
    filters, 
    setFilters, 
    pagination, 
    setPagination,
    handleAccionComercial,
    handleVerConversacion,
    // Estados para modales
    openModal,
    openConversationModal,
    cliente,
    conversationData,
    conversationLoading,
    selectedConversation,
    setSelectedConversation,
    handleClose,
    handleCloseConversation,
    handleSaveCliente
  } = useClientes();

  // Calcular filtros activos
  const activeFilters = useMemo(() => {
    const filterValues = [
      filters.search,
      filters.estado !== "Todos" ? filters.estado : "",
      filters.bound !== "Todos" ? filters.bound : "",
      filters.fechaInicio,
      filters.fechaFin,
      filters.fechaRegistro
    ];
    return filterValues.filter(value => value !== '' && value !== null && value !== undefined).length;
  }, [filters]);

  return (
    <Container maxWidth="xl" sx={{ py: 4, position: 'relative' }}>
      {/* Header profesional */}
      <ProfessionalHeader 
        totalClientes={totalClientes}
        activeFilters={activeFilters}
      />

      {/* Área de contenido con loading */}
      <Box sx={{ position: 'relative' }}>
        {/* Loading spinner profesional */}
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(248, 250, 252, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              backdropFilter: 'blur(2px)',
              borderRadius: 2,
              minHeight: '400px'
            }}
          >
            <Box
              sx={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 3,
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0 8px 32px rgba(0, 115, 145, 0.15)',
                maxWidth: 300,
                textAlign: 'center',
                border: '1px solid rgba(0, 115, 145, 0.1)'
              }}
            >
              <CircularProgress 
                size={50} 
                thickness={4}
                sx={{ 
                  color: '#007391',
                  mb: 2,
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round'
                  }
                }} 
              />
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#254e59', 
                  fontWeight: 600,
                  mb: 1,
                  fontSize: '1rem'
                }}
              >
                Cargando Clientes
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#64748b',
                  fontWeight: 400,
                  lineHeight: 1.4
                }}
              >
                Obteniendo información actualizada...
              </Typography>
            </Box>
          </Box>
        )}

        {/* Filtros profesionales */}
        <ClientesFilters 
          filters={filters}
          setFilters={setFilters}
        />

        {/* Tabla moderna */}
        <Fade in timeout={500}>
          <Box>
            <ModernClientesTable
              clientes={clientes}
              totalClientes={totalClientes}
              loading={false} // Controlamos el loading desde aquí
              pagination={pagination}
              setPagination={setPagination}
              handleAccionComercial={handleAccionComercial}
              handleVerConversacion={handleVerConversacion}
            />
          </Box>
        </Fade>
      </Box>

      {/* Modales */}
      {/* Modal de Acción Comercial */}
      <ActionComercialModal
        open={openModal}
        onClose={handleClose}
        cliente={cliente}
        gestores={gestores}
        onSave={handleSaveCliente}
      />

      {/* Modal de Conversación */}
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
