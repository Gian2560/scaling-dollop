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

// Header profesional más compacto
function ProfessionalHeader({ totalClientes, activeFilters, onSearch, searchTerm }) {
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
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
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
                label={`${activeFilters} filtros`}
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

        <Box>
          <TextField
            placeholder="Buscar por nombre, teléfono, documento..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'rgba(0,0,0,0.4)' }} />
                </InputAdornment>
              ),
              sx: { bgcolor: 'white', borderRadius: 1.5 }
            }}
            sx={{ width: '100%', maxWidth: 400 }}
          />
        </Box>
      </Box>
    </Paper>
  );
}

// Filtros profesionales más compactos
function ProfessionalFilters({ filters, setFilters }) {
  return (
    <Paper elevation={1} sx={{ mb: 2, borderRadius: 2 }}>
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Estado</InputLabel>
              <Select
                value={filters.estado}
                label="Estado"
                onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="activo">Activo</MenuItem>
                <MenuItem value="inactivo">Inactivo</MenuItem>
                <MenuItem value="moroso">Moroso</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Gestor</InputLabel>
              <Select
                value={filters.gestor}
                label="Gestor"
                onChange={(e) => setFilters({ ...filters, gestor: e.target.value })}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="gestor1">Gestor 1</MenuItem>
                <MenuItem value="gestor2">Gestor 2</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Segmento</InputLabel>
              <Select
                value={filters.segmento}
                label="Segmento"
                onChange={(e) => setFilters({ ...filters, segmento: e.target.value })}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="premium">Premium</MenuItem>
                <MenuItem value="regular">Regular</MenuItem>
                <MenuItem value="basico">Básico</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setFilters({ estado: '', gestor: '', segmento: '' })}
              sx={{ height: 40 }}
            >
              Limpiar Filtros
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}

// Tabla moderna de clientes
function ModernClientesTable({ 
  clientes, 
  loading, 
  pagination, 
  setPagination,
  handleAccionComercial,
  handleVerConversacion 
}) {
  return (
    <Paper elevation={1} sx={{ borderRadius: 2 }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Cliente</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Contacto</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Gestor</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, color: '#475569' }}>Acciones</TableCell>
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
                        Doc: {cliente.documento}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" display="flex" alignItems="center" gap={0.5}>
                      <PhoneIcon sx={{ fontSize: 16, color: '#64748b' }} />
                      {cliente.telefono}
                    </Typography>
                    {cliente.email && (
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                        {cliente.email}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={cliente.estado}
                    size="small"
                    color={
                      cliente.estado === 'activo' ? 'success' :
                      cliente.estado === 'moroso' ? 'error' : 'default'
                    }
                    sx={{ fontWeight: 500 }}
                  />
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
                <TableCell align="center">
                  <Box display="flex" justifyContent="center" gap={0.5}>
                    <Tooltip title="Realizar llamada">
                      <IconButton 
                        size="small"
                        sx={{ color: '#059669' }}
                        onClick={() => handleAccionComercial(cliente.id)}
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
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
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
        count={pagination.total}
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
  const [filters, setFilters] = useState({
    estado: '',
    gestor: '',
    segmento: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 10,
    total: 0
  });

  // Hook para obtener datos
  const { clientes, loading, totalClientes } = useClientes({
    filters,
    searchTerm,
    pagination
  });

  // Calcular filtros activos
  const activeFilters = useMemo(() => {
    return Object.values(filters).filter(value => value !== '').length + 
           (searchTerm ? 1 : 0);
  }, [filters, searchTerm]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPagination({ ...pagination, page: 0 });
  };

  const handleAccionComercial = (clienteId) => {
    console.log('Acción comercial para cliente:', clienteId);
  };

  const handleVerConversacion = (clienteId) => {
    console.log('Ver conversación para cliente:', clienteId);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4, position: 'relative' }}>
      {/* Header profesional */}
      <ProfessionalHeader 
        totalClientes={totalClientes}
        activeFilters={activeFilters}
        onSearch={handleSearch}
        searchTerm={searchTerm}
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
        <ProfessionalFilters 
          filters={filters}
          setFilters={setFilters}
        />

        {/* Tabla moderna */}
        <Fade in timeout={500}>
          <Box>
            <ModernClientesTable
              clientes={clientes}
              loading={false} // Controlamos el loading desde aquí
              pagination={pagination}
              setPagination={setPagination}
              handleAccionComercial={handleAccionComercial}
              handleVerConversacion={handleVerConversacion}
            />
          </Box>
        </Fade>
      </Box>
    </Container>
  );
}
