import React from 'react';
import { Card, CardContent, Typography, Box, Avatar, LinearProgress, Chip, Zoom } from '@mui/material';
import { estadosConfig } from '@/constants/estadosConfig';


export default function  EstadoCard({ estado, generalStats, onSelectEstado, selectedEstado }) {
  const config = estadosConfig[estado];
  const stats = generalStats || { total: 0, pendientes: 0, completados: 0 };
  const isSelected = selectedEstado === estado;
  const porcentajeCompletado = stats.total > 0 ? Math.round((stats.completados / stats.total) * 100) : 0;

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
          color: isSelected ? 'white' : '#254e59',
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
              <Typography variant="h7" sx={{ fontWeight: 700, mb: 0.5, color: 'inherit' }}>
                {config.titulo}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: isSelected ? 0.9 : 0.7,
                  fontSize: '0.875rem',
                  color: 'inherit'
                }}
              >
                {config.subtitulo}
              </Typography>
            </Box>
          </Box>
          
          {/* Métricas principales */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box textAlign="center">
              <Typography variant="h3" sx={{ fontWeight: 'bold', lineHeight: 1, color: 'inherit' }}>
                {stats.pendientes}
              </Typography>
              <Typography variant="caption" sx={{ opacity: isSelected ? 0.9 : 0.7, color: 'inherit' }}>
                Pendientes
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h3" sx={{ fontWeight: 'bold', lineHeight: 1, color: isSelected ? '#81c784' : '#4caf50' }}>
                {stats.completados}
              </Typography>
              <Typography variant="caption" sx={{ opacity: isSelected ? 0.9 : 0.7, color: 'inherit' }}>
                Completados
              </Typography>
            </Box>
          </Box>

          {/* Barra de progreso */}
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'inherit' }}>
                Progreso
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'inherit' }}>
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
                  bgcolor: isSelected ? '#81c784' : config.color,
                  borderRadius: 4
                }
              }}
            />
          </Box>

          {/* Footer con total */}
          <Box mt="auto">
            <Chip
              label={`${stats.total} tareas totales`}
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