

import React from 'react';
import { 
  Box, 
  Typography, 
    Avatar,
    Chip,
    Paper,
    Grid,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TodayIcon from '@mui/icons-material/Today';
import SearchIcon from '@mui/icons-material/Search';


export default function ProfessionalHeader({ stats, onSearch, onFilter, searchTerm, selectedFilter, currentView, selectedEstado }) {
  const shouldShowSearch = currentView === 'cards' && !selectedEstado;
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        background: 'linear-gradient(135deg, #007391 0%, #005c6b 100%)',
        color: 'white',
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative',
        mb: 4
      }}
    >
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
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center">
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 3, width: 64, height: 64 }}>
              <AssignmentIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5, color: 'white' }}>
                Centro de Tareas
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, color: 'white' }}>
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
            <Typography variant="caption" display="block" sx={{ opacity: 0.8, color: 'white' }}>
              Última actualización: {new Date().toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: 'white' }}>
                {stats.total}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, color: 'white' }}>
                Total Tareas
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: 'white' }}>
                {stats.pendientes}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, color: 'white' }}>
                Pendientes
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: 'white' }}>
                {stats.completadas}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, color: 'white' }}>
                Completadas
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: 'white' }}>
                {Math.round((stats.completadas / stats.total) * 100) || 0}%
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, color: 'white' }}>
                Efectividad
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {false && shouldShowSearch && (
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
        )}
      </Box>
    </Paper>
  );
}