"use client";

import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  Alert,
  Divider,
  Chip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import BotInteractionsFilters from '../components/BotInteractionsFilters';
import { useBotInteractions } from '../../hooks/useBotInteractions';
import { botInteractionsColumns } from '../../constants/botInteractionsColumns';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RefreshIcon from '@mui/icons-material/Refresh';
import { startOfDay, endOfDay, subDays } from "date-fns";

export default function BotInteractionsPage() {
  const { 
    data, 
    loading, 
    error, 
    totalRecords, 
    stats,
    fetchBotInteractions, 
    exportToCSV,
    refreshData 
  } = useBotInteractions();

  const [currentFilters, setCurrentFilters] = useState(null);

  // Cargar datos iniciales al montar el componente
  useEffect(() => {
    const initialFilters = {
      fechaInicio: startOfDay(subDays(new Date(), 30)).toISOString().split('T')[0],
      fechaFin: endOfDay(new Date()).toISOString().split('T')[0],
      estados: [
        'Indeciso',
        'Reclamo activo', 
        'No interesado',
        'Solicita devolucion de dinero',
        'Interesado en reactivar',
        'Fecha de Pago'
      ]
    };
    
    setCurrentFilters(initialFilters);
    fetchBotInteractions(initialFilters);
  }, [fetchBotInteractions]);

  const handleSearch = (filters) => {
    setCurrentFilters(filters);
    fetchBotInteractions(filters);
  };

  const handleRefresh = () => {
    if (currentFilters) {
      refreshData(currentFilters);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const StatCard = ({ title, value, icon: Icon, color = '#007391', subtitle }) => (
    <Card sx={{ height: '100%', bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
            {title}
          </Typography>
          <Icon sx={{ color, fontSize: 28 }} />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#254e59', mb: 0.5 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box mb={4}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <SmartToyIcon sx={{ fontSize: 32, color: '#007391' }} />
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#254e59' }}>
            Interacciones con Bot
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Monitoreo y análisis de clientes que han interactuado con el bot automático
        </Typography>
        
        {/* Estados disponibles */}
        <Box display="flex" gap={1} flexWrap="wrap">
          {[
            'Indeciso',
            'Reclamo activo', 
            'No interesado',
            'Solicita devolucion de dinero',
            'Interesado en reactivar',
            'Fecha de Pago'
          ].map((estado) => (
            <Chip 
              key={estado}
              label={estado}
              size="small"
              variant="outlined"
              sx={{ 
                borderColor: '#007391',
                color: '#007391',
                fontSize: '0.75rem'
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Filtros */}
      <BotInteractionsFilters onSearch={handleSearch} loading={loading} />

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Estadísticas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} lg={4}>
          <StatCard
            title="Total Registros"
            value={stats.totalRegistros.toLocaleString()}
            icon={AssignmentIcon}
            subtitle="Registros encontrados"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <StatCard
            title="Documentos Únicos"
            value={stats.documentosUnicos.toLocaleString()}
            icon={PeopleIcon}
            color="#ff6b35"
            subtitle="Clientes únicos"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <StatCard
            title="Códigos Únicos"
            value={stats.codigosUnicos.toLocaleString()}
            icon={TrendingUpIcon}
            color="#28a745"
            subtitle="Códigos asociados"
          />
        </Grid>
      </Grid>

      {/* Acciones */}
      <Box display="flex" gap={2} mb={3} justifyContent="flex-end">
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
          sx={{
            borderColor: '#007391',
            color: '#007391',
            '&:hover': {
              borderColor: '#005c6b',
              bgcolor: '#f0f8ff'
            }
          }}
        >
          Actualizar
        </Button>
        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={exportToCSV}
          disabled={loading || data.length === 0}
          sx={{
            bgcolor: '#28a745',
            '&:hover': { bgcolor: '#218838' }
          }}
        >
          Exportar CSV
        </Button>
      </Box>

      {/* Tabla de datos */}
      <Paper sx={{ width: '100%', bgcolor: 'white', borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#254e59' }}>
            Resultados de Búsqueda
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {totalRecords} cliente{totalRecords !== 1 ? 's' : ''} encontrado{totalRecords !== 1 ? 's' : ''}
          </Typography>
        </Box>
        
        <DataGrid
          rows={data}
          columns={botInteractionsColumns}
          getRowId={(row) => row.id}
          loading={loading}
          disableRowSelectionOnClick
          autoHeight
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 25 }
            }
          }}
          pageSizeOptions={[25, 50, 100]}
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
            },
            '& .MuiDataGrid-footerContainer': {
              backgroundColor: '#f8fafc',
              borderTop: '2px solid #e0e0e0'
            }
          }}
          localeText={{
            noRowsLabel: 'No se encontraron datos',
            footerRowSelected: (count) => `${count.toLocaleString()} fila${count !== 1 ? 's' : ''} seleccionada${count !== 1 ? 's' : ''}`,
            footerTotalRows: 'Total de filas:',
            footerTotalVisibleRows: (visibleCount, totalCount) =>
              `${visibleCount.toLocaleString()} de ${totalCount.toLocaleString()}`,
          }}
        />
      </Paper>
    </Box>
  );
}