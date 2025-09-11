import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Grid,
  Box,
  IconButton,
  Avatar,
  Chip,
  Badge
} from "@mui/material";

import {
  Close as CloseIcon,
  Person as PersonIcon,
  SmartToy as BotIcon,
  AccessTime as TimeIcon,
  Message as MessageIcon,
  WhatsApp as WhatsAppIcon
} from "@mui/icons-material";

import React, { useEffect, useRef } from "react";

const ConversationModal = ({
  open,
  onClose,
  conversationLoading,
  conversationData,
  selectedConversation,
  setSelectedConversation
}) => {
  
  // Ref para el contenedor de mensajes
  const messagesEndRef = useRef(null);
  
  // Función para hacer scroll al final
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  // Effect para scroll automático cuando se cargan los datos
  useEffect(() => {
    if (conversationData && conversationData.length > 0 && !conversationLoading) {
      // Scroll inmediato sin animación para evitar que se vea el movimiento
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "instant" });
        }
      }, 50);
    }
  }, [conversationData, conversationLoading]);
  
  const formatDate = (dateString) => {
    try {
      // Si ya está en formato legible español, devolverlo tal como está
      if (typeof dateString === 'string' && dateString.includes('de')) {
        return dateString;
      }
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Devolver el string original si no se puede parsear
      }
      
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="lg"
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          minHeight: '70vh',
          overflowX: 'hidden'
        }
      }}
    >
      {/* Header Profesional */}
      <DialogTitle 
        sx={{
          background: 'linear-gradient(135deg, #007391 0%, #005c6b 100%)',
          color: 'white',
          py: 3,
          px: 4,
          position: 'relative',
          borderRadius: '16px 16px 0 0'
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" flex={1}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2, width: 48, height: 48 }}>
              <MessageIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: 'white' }}>
                Conversación del Cliente
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, color: 'white' }}>
                Historial completo de mensajes WhatsApp
              </Typography>
            </Box>
          </Box>
          
          <IconButton 
            onClick={onClose}
            sx={{ 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Decorative element */}
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            zIndex: 0
          }}
        />
      </DialogTitle>

      <DialogContent sx={{ p: 0, bgcolor: '#f8f9fa' }}>
        {conversationLoading ? (
          <Box 
            display="flex" 
            flexDirection="column"
            justifyContent="center" 
            alignItems="center" 
            height="400px"
            sx={{ background: 'white', m: 3, borderRadius: 3 }}
          >
            <CircularProgress 
              size={60}
              sx={{ color: '#007391', mb: 3 }}
            />
            <Typography variant="h6" sx={{ color: '#254e59', mb: 1 }}>
              Cargando conversación...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Obteniendo el historial de mensajes
            </Typography>
          </Box>
        ) : conversationData && conversationData.length > 0 ? (
          <Grid container sx={{ minHeight: '500px' }}>
            {/* Sidebar de conversaciones */}
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={0}
                sx={{ 
                  height: '100%',
                  borderRadius: 0,
                  bgcolor: 'white',
                  borderRight: '1px solid #e0e0e0'
                }}
              >
                <Box sx={{ p: 3, bgcolor: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#254e59', mb: 1 }}>
                    Conversaciones
                  </Typography>
                  <Chip 
                    icon={<WhatsAppIcon />}
                    label={`${conversationData.length} mensajes`}
                    size="small"
                    sx={{ 
                      bgcolor: '#e8f5e8',
                      color: '#2e7d2e',
                      fontWeight: 600
                    }}
                  />
                </Box>
                
                <List sx={{ p: 0 }}>
                  <ListItem 
                    sx={{ 
                      py: 2,
                      px: 3,
                      bgcolor: '#e3f2fd',
                      borderLeft: '4px solid #007391'
                    }}
                  >
                    <Avatar sx={{ bgcolor: '#007391', mr: 2 }}>
                      <MessageIcon />
                    </Avatar>
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: 600, color: '#254e59' }}>
                          Conversación Activa
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ color: '#007391', display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          
                          Última actividad
                        </Typography>
                      }
                    />
                    <Badge badgeContent={conversationData.length} color="primary" />
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            {/* Área de mensajes */}
            <Grid item xs={12} md={8}>
              <Paper 
                elevation={0}
                sx={{ 
                  height: '500px',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 0,
                  bgcolor: 'white'
                }}
              >
                {/* Header del chat */}
                <Box sx={{ 
                  p: 3, 
                  bgcolor: '#f8f9fa', 
                  borderBottom: '1px solid #e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: '#25d366', mr: 2 }}>
                      <WhatsAppIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#254e59' }}>
                        Chat WhatsApp
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Conversación en tiempo real
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Chip
                    label="En línea"
                    size="small"
                    sx={{ 
                      bgcolor: '#e8f5e8',
                      color: '#2e7d2e',
                      fontWeight: 600
                    }}
                  />
                </Box>

                {/* Área de mensajes con scroll */}
                <Box sx={{ 
                  flex: 1, 
                  p: 3, 
                  overflowY: 'auto',
                  bgcolor: '#f8f9fa',
                  backgroundImage: `
                    radial-gradient(circle at 20% 20%, rgba(0,115,145,0.05) 0%, transparent 20%),
                    radial-gradient(circle at 80% 80%, rgba(0,115,145,0.05) 0%, transparent 20%)
                  `,
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {conversationData.map((message, index) => (
                    <Box mb={3} key={message._id || `message-${index}`}>
                      {/* Mensaje del cliente */}
                      {message.sender ? (
                        <Box display="flex" justifyContent="flex-end" mb={2}>
                          <Box sx={{ maxWidth: '75%' }}>
                            <Paper
                              elevation={3}
                              sx={{
                                p: 2.5,
                                borderRadius: '20px 20px 5px 20px',
                                background: 'linear-gradient(135deg, #007391 0%, #005c6b 100%)',
                                color: 'white',
                                position: 'relative',
                                '&::after': {
                                  content: '""',
                                  position: 'absolute',
                                  bottom: 0,
                                  right: -8,
                                  width: 0,
                                  height: 0,
                                  borderLeft: '8px solid #005c6b',
                                  borderTop: '8px solid transparent'
                                }
                              }}
                            >
                              <Typography variant="body1" sx={{ mb: 1, lineHeight: 1.5 }}>
                                {message.mensaje}
                              </Typography>
                              <Box display="flex" alignItems="center" justifyContent="flex-end">
                               
                                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                  {formatDate(message.fecha)}
                                </Typography>
                              </Box>
                            </Paper>
                            
                            <Box display="flex" alignItems="center" justifyContent="flex-end" mt={1}>
                              <Avatar sx={{ width: 24, height: 24, bgcolor: '#007391', mr: 1 }}>
                                <PersonIcon sx={{ fontSize: 14 }} />
                              </Avatar>
                              <Typography variant="caption" sx={{ color: '#254e59', fontWeight: 600 }}>
                                Cliente
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      ) : (
                        /* Mensaje del bot */
                        <Box display="flex" justifyContent="flex-start" mb={2}>
                          <Box sx={{ maxWidth: '75%' }}>
                            <Paper
                              elevation={2}
                              sx={{
                                p: 2.5,
                                borderRadius: '20px 20px 20px 5px',
                                bgcolor: 'white',
                                border: '1px solid #e0e0e0',
                                position: 'relative',
                                '&::after': {
                                  content: '""',
                                  position: 'absolute',
                                  bottom: 0,
                                  left: -8,
                                  width: 0,
                                  height: 0,
                                  borderRight: '8px solid white',
                                  borderTop: '8px solid transparent'
                                }
                              }}
                            >
                              <Typography variant="body1" sx={{ mb: 1, color: '#254e59', lineHeight: 1.5 }}>
                                {message.mensaje}
                              </Typography>
                              <Box display="flex" alignItems="center" justifyContent="flex-start">
                               
                                <Typography variant="caption" color="text.secondary">
                                  {formatDate(message.fecha)}
                                </Typography>
                              </Box>
                            </Paper>
                            
                            <Box display="flex" alignItems="center" justifyContent="flex-start" mt={1}>
                              <Avatar sx={{ width: 24, height: 24, bgcolor: '#25d366', mr: 1 }}>
                                <BotIcon sx={{ fontSize: 14 }} />
                              </Avatar>
                              <Typography variant="caption" sx={{ color: '#254e59', fontWeight: 600 }}>
                                Bot Asistente
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  ))}
                  
                  {/* Elemento invisible para el scroll automático */}
                  <div ref={messagesEndRef} />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        ) : (
          /* Estado vacío */
          <Box 
            display="flex" 
            flexDirection="column"
            justifyContent="center" 
            alignItems="center" 
            height="400px"
            sx={{ m: 3 }}
          >
            <Avatar sx={{ 
              bgcolor: '#f5f5f5', 
              width: 80, 
              height: 80, 
              mb: 3,
              color: '#757575'
            }}>
              <MessageIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h6" sx={{ color: '#254e59', mb: 1, fontWeight: 600 }}>
              No hay conversaciones disponibles
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: 300 }}>
              Este cliente aún no tiene historial de conversaciones o no se pudieron cargar los datos.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions 
        sx={{ 
          p: 3, 
          bgcolor: '#f8f9fa',
          borderTop: '1px solid #e0e0e0',
          borderRadius: '0 0 16px 16px'
        }}
      >
        <Button 
          onClick={onClose}
          variant="contained"
          sx={{
            bgcolor: '#007391',
            color: 'white',
            borderRadius: 2,
            px: 4,
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: '0 4px 12px rgba(0,115,145,0.3)',
            '&:hover': {
              bgcolor: '#005c6b',
              boxShadow: '0 6px 16px rgba(0,115,145,0.4)'
            }
          }}
        >
          Cerrar Conversación
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConversationModal;