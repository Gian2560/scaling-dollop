
import React from 'react';
import { 
  Visibility as VisibilityIcon, 
  Schedule as ScheduleIcon,
  HelpOutline as HelpIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

export const estadosConfig = {
  'Interesado en reactivar': {
    titulo: 'Interesado en reactivar',
    subtitulo: 'Cliente muestra interés en reactivar servicio',
    icono: <VisibilityIcon />,
    color: '#4caf50',
    gradiente: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
    colorBg: '#e8f5e8',
    descripcion: 'Cliente potencial que ha mostrado interés en reactivar su servicio'
  },
  'Fecha de Pago': {
    titulo: 'Fecha de Pago',
    subtitulo: 'Programación de pago establecida',
    icono: <ScheduleIcon />,
    color: '#2196f3',
    gradiente: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
    colorBg: '#e3f2fd',
    descripcion: 'Cliente ha acordado una fecha específica para realizar el pago'
  },
  'Indeciso / Informacion': {
    titulo: 'Indeciso / Información',
    subtitulo: 'Requiere más información para decidir',
    icono: <HelpIcon />,
    color: '#ff9800',
    gradiente: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
    colorBg: '#fff3e0',
    descripcion: 'Cliente necesita información adicional antes de tomar una decisión'
  },
  'En seguimiento': {
    titulo: 'En seguimiento',
    subtitulo: 'Seguimiento activo del cliente',
    icono: <AssignmentIcon />,
    color: '#607d8b',
    gradiente: 'linear-gradient(135deg, #607d8b 0%, #455a64 100%)',
    colorBg: '#eceff1',
    descripcion: 'Cliente bajo seguimiento continuo para próximas acciones'
  },
  'Promesa de Pago': {
    titulo: 'Promesa de Pago',
    subtitulo: 'Cliente comprometido a pagar',
    icono: <CheckCircleIcon />,
    color: '#009688',
    gradiente: 'linear-gradient(135deg, #009688 0%, #00695c 100%)',
    colorBg: '#e0f2f1',
    descripcion: 'Cliente ha prometido realizar el pago en fecha acordada'
  }
};