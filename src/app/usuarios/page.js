"use client";

import { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { 
  Typography, Button, IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, MenuItem, Select, FormControl, InputLabel, 
  Box, Paper, Chip, Avatar, Card, CardContent, Fade, Tooltip, Divider,
  CircularProgress, Alert
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PhoneIcon from "@mui/icons-material/Phone";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import GroupIcon from "@mui/icons-material/Group";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        setError(null);
        const res = await fetch("/api/usuarios");
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Error al cargar usuarios');
        }
        
        setUsuarios(data);
      } catch (error) {
        console.error("❌ Error al obtener usuarios:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsuarios();
  }, []);

  const handleOpenModal = (user = null) => {
    setEditingUser(user);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setEditingUser(null);
    setOpenModal(false);
  };

  const handleSave = async (userData) => {
    const method = editingUser ? "PUT" : "POST";
    const url = editingUser ? `/api/usuarios/${editingUser.usuario_id}` : "/api/usuarios";
    
    try {
      setError(null);
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "x-user-role": "Usuario",
        },
        body: JSON.stringify(userData),
      });
  
      const newUser = await res.json();
  
      if (!res.ok) throw new Error(newUser.error || "Error en la operación");
  
      setOpenModal(false);
      setEditingUser(null);
  
      setUsuarios((prev) =>
        editingUser
          ? prev.map((u) => (u.usuario_id === newUser.usuario_id ? newUser : u))
          : [...prev, newUser]
      );
    } catch (error) {
      console.error("❌ Error al guardar usuario:", error);
      setError(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;
  
    try {
      const res = await fetch(`/api/usuarios/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (res.ok) {
        setUsuarios((prev) => prev.filter((usuario) => usuario.usuario_id !== id));
      } else {
        const errorData = await res.json();
        console.error("❌ Error al eliminar usuario:", errorData.error);
        alert(errorData.error);
      }
    } catch (error) {
      console.error("❌ Error en la eliminación:", error);
    }
  };

  const columns = [
    { 
      field: "usuario_id", 
      headerName: "ID", 
      width: 80,
      renderCell: (params) => (
        <Chip 
          label={`#${params.value}`} 
          size="small" 
          sx={{ 
            backgroundColor: '#e3f2fd', 
            color: '#1976d2',
            fontWeight: 'bold'
          }} 
        />
      )
    },
    { 
      field: "username", 
      headerName: "Usuario", 
      flex: 1, 
      minWidth: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32, backgroundColor: '#007391' }}>
            <PersonIcon />
          </Avatar>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
        </Box>
      )
    },
    {
      field: "nombre_completo",
      headerName: "Nombre Completo",
      flex: 1.5,
      minWidth: 200,
      renderCell: (params) => {
        const persona = params.row?.persona;
        
        if (!persona) {
          return (
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
              Sin datos de persona
            </Typography>
          );
        }
    
        return (
          <Box>
            <Typography variant="body2" fontWeight="medium" color="text.primary">
              {`${persona.nombre || ''} ${persona.primer_apellido || ''} ${persona.segundo_apellido || ''}`.trim()}
            </Typography>
            {persona.num_leads > 0 && (
              <Typography variant="caption" color="text.secondary">
                {persona.num_leads} leads
              </Typography>
            )}
          </Box>
        );
      }
    },
    {
      field: "celular",
      headerName: "Celular",
      flex: 1,
      minWidth: 140,
      renderCell: (params) => {
        const celular = params.row?.persona?.celular;
        return celular ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PhoneIcon sx={{ fontSize: 16, color: '#4caf50' }} />
            <Typography variant="body2">{celular}</Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No disponible
          </Typography>
        );
      }
    },
    {
      field: "nombre_rol",
      headerName: "Rol",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => {
        const rol = params.row?.rol;
        const isAdmin = rol?.nombre_rol === 'Administrador';
        
        return (
          <Chip
            icon={isAdmin ? <AdminPanelSettingsIcon /> : <PersonIcon />}
            label={rol?.nombre_rol || "Sin rol"}
            size="small"
            sx={{
              backgroundColor: isAdmin ? '#fff3e0' : '#e8f5e8',
              color: isAdmin ? '#e65100' : '#2e7d32',
              border: `1px solid ${isAdmin ? '#ffcc02' : '#4caf50'}`,
              '& .MuiChip-icon': {
                color: 'inherit'
              }
            }}
          />
        );
      }
    },
    { 
      field: "activo", 
      headerName: "Estado", 
      flex: 1, 
      minWidth: 120,
      renderCell: (params) => {
        const isActive = params.value;
        return (
          <Chip
            icon={isActive ? <CheckCircleIcon /> : <CancelIcon />}
            label={isActive ? "Activo" : "Inactivo"}
            size="small"
            sx={{
              backgroundColor: isActive ? '#e8f5e8' : '#ffebee',
              color: isActive ? '#2e7d32' : '#c62828',
              border: `1px solid ${isActive ? '#4caf50' : '#f44336'}`,
              '& .MuiChip-icon': {
                color: 'inherit'
              }
            }}
          />
        );
      }
    },
    {
      field: "acciones",
      headerName: "Acciones",
      flex: 1,
      minWidth: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Editar usuario">
            <IconButton 
              onClick={() => handleOpenModal(params.row)} 
              size="small"
              sx={{
                color: '#1976d2',
                backgroundColor: '#e3f2fd',
                '&:hover': {
                  backgroundColor: '#bbdefb'
                }
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar usuario">
            <IconButton 
              onClick={() => handleDelete(params.row.usuario_id)} 
              size="small"
              sx={{
                color: '#d32f2f',
                backgroundColor: '#ffebee',
                '&:hover': {
                  backgroundColor: '#ffcdd2'
                }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Fade in={true} timeout={800}>
      <Box 
        sx={{
          minHeight: '100vh',
          backgroundColor: '#f8fafc',
          padding: 3
        }}
      >
        <Box sx={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Header Section */}
          <Card 
            elevation={0}
            sx={{
              background: 'linear-gradient(135deg, #007391 0%, #005c6b 100%)',
              color: 'white',
              marginBottom: 3,
              borderRadius: 2
            }}
          >
            <CardContent sx={{ padding: '2rem' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar 
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)', 
                    width: 48, 
                    height: 48 
                  }}
                >
                  <GroupIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="600" gutterBottom>
                    Gestión de Usuarios
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Administra usuarios, roles y permisos del sistema
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ marginBottom: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {/* Stats Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, marginBottom: 3 }}>
            <Card elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      {usuarios.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Usuarios
                    </Typography>
                  </Box>
                  <Avatar sx={{ backgroundColor: '#e3f2fd' }}>
                    <GroupIcon sx={{ color: '#1976d2' }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>

            <Card elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ color: '#4caf50' }}>
                      {usuarios.filter(u => u.activo).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Usuarios Activos
                    </Typography>
                  </Box>
                  <Avatar sx={{ backgroundColor: '#e8f5e8' }}>
                    <CheckCircleIcon sx={{ color: '#4caf50' }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>

            <Card elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ color: '#ff9800' }}>
                      {usuarios.filter(u => u.rol?.nombre_rol === 'Administrador').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Administradores
                    </Typography>
                  </Box>
                  <Avatar sx={{ backgroundColor: '#fff3e0' }}>
                    <AdminPanelSettingsIcon sx={{ color: '#ff9800' }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Action Bar */}
          <Paper 
            elevation={1}
            sx={{
              padding: 2,
              marginBottom: 2,
              borderRadius: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography variant="h6" fontWeight="medium" color="text.primary">
              Lista de Usuarios
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenModal()}
              sx={{
                background: 'linear-gradient(45deg, #007391 30%, #005c6b 90%)',
                borderRadius: 2,
                padding: '10px 20px',
                textTransform: 'none',
                fontWeight: 'medium',
                '&:hover': {
                  background: 'linear-gradient(45deg, #005c6b 30%, #254e59 90%)',
                }
              }}
            >
              Nuevo Usuario
            </Button>
          </Paper>

          {/* Data Table */}
          <Paper 
            elevation={3}
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}
          >
            {loading ? (
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: 400 
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <CircularProgress size={60} sx={{ marginBottom: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Cargando usuarios...
                  </Typography>
                </Box>
              </Box>
            ) : (
              <DataGrid
                rows={usuarios}
                columns={columns}
                pageSize={10}
                pageSizeOptions={[5, 10, 25, 50]}
                getRowId={(row) => row.usuario_id}
                disableRowSelectionOnClick
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#f8fafc',
                    borderBottom: '2px solid #e2e8f0',
                    '& .MuiDataGrid-columnHeaderTitle': {
                      fontWeight: '600',
                      color: '#334155'
                    }
                  },
                  '& .MuiDataGrid-row': {
                    borderBottom: '1px solid #f1f5f9',
                    '&:hover': {
                      backgroundColor: '#f8fafc'
                    }
                  },
                  '& .MuiDataGrid-cell': {
                    borderBottom: 'none',
                    paddingY: 1
                  },
                  '& .MuiDataGrid-footerContainer': {
                    borderTop: '2px solid #e2e8f0',
                    backgroundColor: '#f8fafc'
                  }
                }}
              />
            )}
          </Paper>
        </Box>

        {openModal && (
          <UsuarioModal 
            open={openModal} 
            onClose={handleCloseModal} 
            onSave={handleSave} 
            user={editingUser} 
          />
        )}
      </Box>
    </Fade>
  );
}

function UsuarioModal({ open, onClose, onSave, user }) {
  const [formData, setFormData] = useState({
    nombre: user?.persona?.nombre || "",
    primer_apellido: user?.persona?.primer_apellido || "",
    segundo_apellido: user?.persona?.segundo_apellido || "",
    celular: user?.persona?.celular || "",
    username: user?.username || "",
    password: "",
    rol_id: user?.rol?.rol_id || "",
    activo: user?.activo || 1,
  });

  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      setFormData({
        nombre: "",
        primer_apellido: "",
        segundo_apellido: "",
        celular: "",
        username: "",
        password: "",
        rol_id: "",
        activo: 1,
      });
    } else {
      setFormData({
        nombre: user?.persona?.nombre || "",
        primer_apellido: user?.persona?.primer_apellido || "",
        segundo_apellido: user?.persona?.segundo_apellido || "",
        celular: user?.persona?.celular || "",
        username: user?.username || "",
        password: "",
        rol_id: user?.rol?.rol_id || "",
        activo: user?.activo ?? 1,
      });
    }
    setFormErrors({});
  }, [user]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nombre.trim()) errors.nombre = "El nombre es requerido";
    //if (!formData.primer_apellido.trim()) errors.primer_apellido = "El primer apellido es requerido";
    if (!formData.username.trim()) errors.username = "El usuario es requerido";
    if (!user && !formData.password.trim()) errors.password = "La contraseña es requerida";
    if (!formData.rol_id) errors.rol_id = "El rol es requerido";
    
    // Validar longitudes
    if (formData.username.length > 50) errors.username = "El usuario no puede exceder 50 caracteres";
    if (formData.nombre.length > 120) errors.nombre = "El nombre no puede exceder 120 caracteres";
    if (formData.primer_apellido.length > 120) errors.primer_apellido = "El primer apellido no puede exceder 120 caracteres";
    if (formData.segundo_apellido && formData.segundo_apellido.length > 120) errors.segundo_apellido = "El segundo apellido no puede exceder 120 caracteres";
    if (formData.celular && formData.celular.length > 12) errors.celular = "El celular no puede exceder 12 caracteres";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
        }
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #007391 0%, #005c6b 100%)',
          color: 'white',
          textAlign: 'center',
          fontWeight: 600
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <PersonIcon />
          {user ? "Editar Usuario" : "Crear Usuario"}
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ padding: 3, backgroundColor: '#fafafa' }}>
        <Box component="form" onSubmit={handleSubmit}>
          {/* Información Personal */}
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom sx={{ mt: 1, color: '#666' }}>
            Información Personal
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 2 }}>
            <TextField
              name="nombre"
              label="Nombre"
              value={formData.nombre}
              onChange={handleChange}
              fullWidth
              required
              error={!!formErrors.nombre}
              helperText={formErrors.nombre}
              variant="outlined"
            />
            {/*<TextField
              name="primer_apellido"
              label="Primer Apellido"
              value={formData.primer_apellido}
              onChange={handleChange}
              fullWidth
              required
              error={!!formErrors.primer_apellido}
              helperText={formErrors.primer_apellido}
              variant="outlined"
            />*/}
          </Box>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 2 }}>
            {/*<TextField
              name="segundo_apellido"
              label="Segundo Apellido"
              value={formData.segundo_apellido}
              onChange={handleChange}
              fullWidth
              error={!!formErrors.segundo_apellido}
              helperText={formErrors.segundo_apellido}
              variant="outlined"
            />*/}
            {/*<TextField
              name="celular"
              label="Celular"
              value={formData.celular}
              onChange={handleChange}
              fullWidth
              error={!!formErrors.celular}
              helperText={formErrors.celular}
              variant="outlined"
              placeholder="Ej: 123456789"
            />*/}
          </Box>

          {/* Información de Acceso */}
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom sx={{ mt: 3, color: '#666' }}>
            Información de Acceso
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minWidth(200px, 1fr))', gap: 2, mb: 2 }}>
            <TextField
              name="username"
              label="Usuario"
              value={formData.username}
              onChange={handleChange}
              fullWidth
              required
              error={!!formErrors.username}
              helperText={formErrors.username}
              variant="outlined"
            />
            <TextField
              name="password"
              label={user ? "Nueva Contraseña (opcional)" : "Contraseña"}
              type="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              required={!user}
              error={!!formErrors.password}
              helperText={formErrors.password || (user ? "Dejar en blanco para mantener actual" : "")}
              variant="outlined"
            />
          </Box>

          <FormControl fullWidth margin="dense" error={!!formErrors.rol_id}>
            <InputLabel>Rol</InputLabel>
            <Select 
              name="rol_id" 
              value={formData.rol_id} 
              onChange={handleChange} 
              required
              label="Rol"
            >
              <MenuItem value="1">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AdminPanelSettingsIcon sx={{ color: '#ff9800' }} />
                  Administrador
                </Box>
              </MenuItem>
              <MenuItem value="2">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon sx={{ color: '#4caf50' }} />
                  Usuario
                </Box>
              </MenuItem>
            </Select>
            {formErrors.rol_id && (
              <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                {formErrors.rol_id}
              </Typography>
            )}
          </FormControl>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ padding: 2, backgroundColor: '#f5f5f5', gap: 1 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: '#ccc',
            color: '#666',
            '&:hover': {
              borderColor: '#999',
              backgroundColor: '#f5f5f5'
            }
          }}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} /> : null}
          sx={{
            background: 'linear-gradient(45deg, #007391 30%, #005c6b 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #005c6b 30%, #254e59 90%)',
            }
          }}
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
