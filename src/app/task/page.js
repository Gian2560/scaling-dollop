"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { useClientes } from '@/hooks/useClientes';
import ActionComercialModal from '@/app/components/ActionComercialModal';
import ConversationModal from '@/app/components/ConversationModal';
import HistoricoModal from '@/app/components/HistoricoModal';
import BitacoraModal from '@/app/components/BitacoraModal';
import { fetchConversacion } from '../../../services/clientesService';
import ProfessionalHeader from '../components/taskComponets/ProfessionalHeader';
import EstadoCard from '../components/taskComponets/EstadoCard';
import TasksTable from '../components/taskComponets/TasksTable';
import { taskColumns } from '@/constants/taskColumns';
import {
  Container, Typography, Grid,
  Box,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  ReportProblem as ReportProblemIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { estadosConfig } from '@/constants/estadosConfig';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
export default function TasksPage() {
  // Estados principales
  const [selectedEstado, setSelectedEstado] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openConversationModal, setOpenConversationModal] = useState(false);
  const [openHistoricoModal, setOpenHistoricoModal] = useState(false);
  const [openBitacoraModal, setOpenBitacoraModal] = useState(false);
  const [conversationData, setConversationData] = useState(null);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(0);
  const [selectedClienteHistorico, setSelectedClienteHistorico] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [currentView, setCurrentView] = useState('cards');
  const TOP_KEYS = ['Interesado en reactivar','Fecha de Pago','Indeciso / Informacion'];
  const BOTTOM_KEYS = ['En seguimiento','Promesa de Pago'];
  const [selectedGestor, setSelectedGestor] = useState('');
  // Estados para paginación y carga
  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Estados para estadísticas
  const [generalStats, setGeneralStats] = useState({
    'Interesado en reactivar': { total: 0, pendientes: 0, completados: 0 },
    'Fecha de Pago': { total: 0, pendientes: 0, completados: 0 },
    'Indeciso / Informacion': { total: 0, pendientes: 0, completados: 0 },
    'En seguimiento': { total: 0, pendientes: 0, completados: 0 },
    'Promesa de Pago': { total: 0, pendientes: 0, completados: 0 }
  });
   const [mensajesStats, setMensajesStats] = useState({
    enviados: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const { gestores, handleSaveCliente } = useClientes();

  // Función para cargar estadísticas generales
  const loadGeneralStats = async () => {
    setLoadingStats(true);
    try {
      /* const response = await fetch('/api/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estados: Object.keys(estadosConfig) })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('📊 Estadísticas recibidas:', data);

          // Actualizar las estadísticas con los datos recibidos del API
          setGeneralStats(data.metricas || {});
        }
      } */
      const [respTop, respBottom] = await Promise.all([
      fetch('/api/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estados: TOP_KEYS })
      }),
      fetch('/api/task_accion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estados: BOTTOM_KEYS })
      })
      ]);

      const dataTop = respTop.ok ? await respTop.json() : { success:false, metricas:{} };
      const dataBottom = respBottom.ok ? await respBottom.json() : { success:false, metricas:{} };

      if (dataTop.success || dataBottom.success) {
        const metricas = { ...(dataTop.metricas||{}), ...(dataBottom.metricas||{}) };
        setGeneralStats(metricas);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Función para cargar estadísticas de mensajes
  const loadMensajesStats = async () => {
    try {
      const response = await fetch('/api/task', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMensajesStats({
            enviados: data.mensajesEnviados || 0
          });
        }
      }
    } catch (error) {
      console.error('Error cargando estadísticas de mensajes:', error);
    }
  };

  // Función para cargar tareas de un estado específico
  const loadTasks = async (estado, currentPage = 0, limit = 10, search = '') => {
    if (!estado) return;

    setLoading(true);
    try {
      const estadosToRequest = estado === 'En seguimiento'
      ? ['En seguimiento', 'Volver a contactar']
      : [estado];
      const params = new URLSearchParams({
        estado,
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(selectedGestor && { gestor: selectedGestor })
      });

      console.log('🔍 Cargando tareas con parámetros:', { estado, currentPage, limit, search });
      let response;
      if(estadosToRequest.some(s => ['En seguimiento','Volver a contactar','Promesa de Pago'].includes(s))){
        response = await fetch(`/api/task_accion?${params}`);
      }
      else {
        response = await fetch(`/api/task?${params}`);
      }
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('✅ Tareas cargadas:', data.data.length, 'elementos');
          setTasks(data.data);
          setPagination(data.pagination);
        } else {
          console.error('❌ Error en la respuesta:', data.error);
          setTasks([]);
        }
      } else {
        console.error('❌ Error HTTP:', response.status, await response.text());
        setTasks([]);
      }
    } catch (error) {
      console.error('❌ Error cargando tareas:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar estadísticas al montar el componente
  useEffect(() => {
    loadGeneralStats();
    loadMensajesStats();
  }, []);

  // Efecto para cargar tareas cuando cambia el estado seleccionado
  useEffect(() => {
    if (selectedEstado && currentView === 'detailed') {
      loadTasks(selectedEstado, page, rowsPerPage, searchTerm);
    }
  }, [selectedEstado, currentView, page, rowsPerPage, searchTerm,selectedGestor]);


  // Función para seleccionar estado y cambiar a vista detallada
  const handleSelectEstado = (estado) => {
    if (estado === selectedEstado) {
      setSelectedEstado('');
      setCurrentView('cards');
      setTasks([]);
    } else {
      setSelectedEstado(estado);
      setCurrentView('detailed');
    }
    setPage(0);
  };

  // Función para volver a vista resumen
  const handleBackToCards = () => {
    setCurrentView('cards');
    setSelectedEstado('');
    setSearchTerm('');
    setFilterEstado('');
    setTasks([]);
    setPage(0);
  };

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

  // Función para ver histórico
  const handleVerHistorico = async (clienteId) => {
    // Buscar el cliente en los datos actuales para obtener su nombre
    const cliente = tasks.find(t => t.id === clienteId);
    setSelectedClienteHistorico({
      id: clienteId,
      nombre: cliente?.cliente || 'Cliente desconocido'
    });
    setOpenHistoricoModal(true);
  };

  // Función para cerrar modal de histórico
  const handleCloseHistorico = () => {
    setOpenHistoricoModal(false);
    setSelectedClienteHistorico(null);
  };

  // Función para ver bitácora
  const handleVerBitacora = async (clienteId) => {
    // Buscar el cliente en los datos actuales para obtener su información
    const cliente = tasks.find(t => t.id === clienteId);
    console.log('🔍 Cliente encontrado para bitácora:', cliente);
    console.log('📄 Documento del cliente:', cliente?.documento);
    
    setSelectedClienteHistorico({
      id: clienteId,
      nombre: cliente?.cliente || 'Cliente desconocido',
      documento: cliente?.documento || ''
    });
    setOpenBitacoraModal(true);
  };

  // Función para cerrar modal de bitácora
  const handleCloseBitacora = () => {
    setOpenBitacoraModal(false);
    setSelectedClienteHistorico(null);
  };

  // Función personalizada para guardar cliente y marcar tarea como llamada
  const handleSaveClienteAndMarkTask = async (clienteData) => {
    try {
      // Primero guardar en la base de datos usando el hook
      await handleSaveCliente(clienteData);

      // Recargar las tareas para reflejar los cambios
      const currentPageNum = page + 1;
      await loadTasks(selectedEstado, currentPageNum, rowsPerPage, searchTerm);

      // Recargar estadísticas generales
      await loadGeneralStats();

      handleClose();
    } catch (error) {
      console.error("Error al guardar cliente:", error);
    }
  };

  // Funciones para manejo de búsqueda y filtros
  const handleSearch = (term) => {
    setSearchTerm(term);
    setPage(0); // Resetear página cuando se busca
  };

  const handleFilter = (estado) => {
    setFilterEstado(estado);
    setPage(0); // Resetear página cuando se filtra
  };

  // Funciones de paginación actualizadas
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };


  // Calcular estadísticas para el header
  const stats = useMemo(() => {
    const allStats = Object.values(generalStats);
    const total = allStats.reduce((sum, stat) => sum + stat.total, 0);
    const completadas = allStats.reduce((sum, stat) => sum + stat.completados, 0);
    const pendientes = total - completadas;
    return { total, completadas, pendientes };
  }, [generalStats]);

  return (
    <Container maxWidth="xl" sx={{ py: 4, position: 'relative' }}>
      {/* Loading profesional para estadísticas */}
      {loadingStats && (
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
            borderRadius: 2
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
              maxWidth: 350,
              textAlign: 'center',
              border: '1px solid rgba(0, 115, 145, 0.1)'
            }}
          >
            <CircularProgress
              size={60}
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
                mb: 1
              }}
            >
              Cargando Métricas
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#64748b',
                fontWeight: 400,
                lineHeight: 1.5
              }}
            >
              Obteniendo estadísticas actualizadas...
            </Typography>
            <Box
              sx={{
                width: '80%',
                height: 3,
                bgcolor: 'rgba(0, 115, 145, 0.1)',
                borderRadius: 2,
                mt: 2,
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  width: '40%',
                  height: '100%',
                  bgcolor: '#007391',
                  borderRadius: 2,
                  animation: 'loading-slide 1.8s ease-in-out infinite',
                  '@keyframes loading-slide': {
                    '0%': { transform: 'translateX(-100%)', width: '40%' },
                    '50%': { transform: 'translateX(0%)', width: '60%' },
                    '100%': { transform: 'translateX(150%)', width: '40%' }
                  }
                }}
              />
            </Box>
          </Box>
        </Box>
      )}

      {/* Header profesional */}
      <ProfessionalHeader
        stats={stats}
        onSearch={handleSearch}
        onFilter={handleFilter}
        searchTerm={searchTerm}
        selectedFilter={filterEstado}
        currentView={currentView}
        selectedEstado={selectedEstado}
      />

      {/* Vista de tarjetas de estados */}
      {currentView === 'cards' && !selectedEstado && (
        <Grid container spacing={4} sx={{ mb: 4, justifyContent: 'center' }}>
          {Object.keys(estadosConfig).map(estado => (
            <Grid item xs={12} md={6} lg={4} key={estado}>
              <EstadoCard
                estado={estado}
                generalStats={generalStats[estado]}
                onSelectEstado={handleSelectEstado}
                selectedEstado={selectedEstado}
              />
            </Grid>
          ))}

        </Grid>
      )}

      {/* Vista detallada */}
      {(currentView === 'detailed' || selectedEstado) && selectedEstado && (
        <Box>
          {/* Breadcrumb para navegación */}
          <Box display="flex" alignItems="center" mb={3}>
            <Button
              variant="outlined"
              onClick={handleBackToCards}
              startIcon={<ArrowBackIcon />}
              sx={{
                mr: 2,
                borderColor: '#007391',
                color: '#007391',
                '&:hover': {
                  borderColor: '#005c6b',
                  bgcolor: '#f0f8ff'
                }
              }}
            >
              Volver a Estados
            </Button>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#254e59' }}>
              / {estadosConfig[selectedEstado]?.titulo}
            </Typography>
            {/* Selector de Gestor (filtro lateral simple) */}
            <FormControl size="small" sx={{ minWidth: 240, ml: 93}}>
              <InputLabel id="gestor-select-label">Filtrar por Gestor</InputLabel>
              <Select
                labelId="gestor-select-label"
                value={selectedGestor}
                label="Filtrar por Gestor"
                onChange={(e) => { setSelectedGestor(e.target.value); setPage(0); }}
              >
                 <MenuItem value="">Todos</MenuItem>
                  {gestores?.map((g) => (
                    <MenuItem key={g.username} value={g.username}>
                      {g.username}
                    </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          {/* Selector de Gestor (filtro lateral simple) */}
          
          {loading ? (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress size={60} sx={{ color: '#007391' }} />
            </Box>
          ) : (
            <TasksTable
              columns={taskColumns(handleAccionComercial, handleVerConversacion, selectedEstado, handleVerHistorico, handleVerBitacora)}
              data={tasks}
              pagination={pagination}
              onChangePage={handleChangePage}
              onChangeRowsPerPage={handleChangeRowsPerPage}
              page={page}
              rowsPerPage={rowsPerPage}
              selectedEstado={selectedEstado}
            />
          )}
        </Box>
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
        conversationLoading={conversationLoading}
        conversationData={conversationData}
        selectedConversation={selectedConversation}
        setSelectedConversation={setSelectedConversation}
      />

      <HistoricoModal
        open={openHistoricoModal}
        onClose={handleCloseHistorico}
        clienteId={selectedClienteHistorico?.id}
        clienteNombre={selectedClienteHistorico?.nombre}
      />

      <BitacoraModal
        open={openBitacoraModal}
        onClose={handleCloseBitacora}
        clienteDocumento={selectedClienteHistorico?.documento}
        clienteNombre={selectedClienteHistorico?.nombre}
      />
    </Container>
  );
}
