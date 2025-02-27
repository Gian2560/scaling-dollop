"use client";

import { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import bcrypt from "bcryptjs";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const userRole = localStorage.getItem("userRole"); // O úsalo desde un contexto global

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const res = await fetch("/api/usuarios");
        const data = await res.json();
        setUsuarios(data);

      } catch (error) {
        console.error("❌ Error al obtener usuarios:", error);
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
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "x-user-role": localStorage.getItem("userRole") || "Usuario", // Enviar el rol actual
        },
        body: JSON.stringify(userData),
      });
  
      if (!res.ok) throw new Error("Error en la operación");
  
      setOpenModal(false);
      setEditingUser(null);
      setUsuarios((prev) =>
        editingUser ? prev.map((u) => (u.usuario_id === userData.usuario_id ? userData : u)) : [...prev, userData]
      );
    } catch (error) {
      console.error("❌ Error al guardar usuario:", error);
    }
  };
  

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;
    try {
      const res = await fetch(`/api/usuarios/${id}`, {
        method: "DELETE",
        headers: {
          "x-user-role": localStorage.getItem("userRole") || "Usuario",
        },
      });
      
      if (res.ok) setUsuarios((prev) => prev.filter((usuario) => usuario.usuario_id !== id));
    } catch (error) {
      console.error("❌ Error en la eliminación:", error);
    }
  };
  

  const columns = [
    { field: "username", headerName: "Usuario", flex: 1, minWidth: 150 },
    {
        field: "nombre_completo",
        headerName: "Nombre Completo",
        flex: 1.5,
        minWidth: 200,
        renderCell: (params) => {
          const persona = params.row?.persona;
      
          if (!persona) return <span style={{ color: "gray" }}>Desconocido</span>; // Muestra un texto en gris si no hay datos
      
          return (
            <span>
              {persona.nombre || ""} {persona.primer_apellido || ""} {persona.segundo_apellido || ""}
            </span>
          );
        }
      }
      ,
      {
        field: "celular",
        headerName: "Celular",
        flex: 1,
        minWidth: 120,
        renderCell: (params) => params.row?.persona?.celular || "No disponible"
      }
      ,
      {
        field: "nombre_rol",
        headerName: "Rol",
        flex: 1,
        minWidth: 120,
        renderCell: (params) => params.row?.rol?.celular || "No disponible"
      },
    { field: "activo", headerName: "Estado", flex: 1, minWidth: 100 },
    {
      field: "acciones",
      headerName: "Acciones",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => handleOpenModal(params.row)} color="primary">
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row.id)} color="error">
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <div style={{ width: "100%", height: "80vh", padding: "20px" }}>
      <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
        Crear Usuario
      </Button>
      <DataGrid 
  rows={usuarios} 
  columns={columns} 
  pageSize={10} 
  loading={loading}
  getRowId={(row) => row.usuario_id} // Especificamos que el identificador único es usuario_id
/>

      {openModal && <UsuarioModal open={openModal} onClose={handleCloseModal} onSave={handleSave} user={editingUser} />}
    </div>
  );
}

function UsuarioModal({ open, onClose, onSave, user, userRole }) {
    const [formData, setFormData] = useState({
      nombre: user?.persona?.nombre || "",
      primer_apellido: user?.persona?.primer_apellido || "",
      segundo_apellido: user?.persona?.segundo_apellido || "",
      celular: user?.persona?.celular || "",
      username: user?.username || "",
      password: "", // No cargamos la contraseña existente
      rol_id: user?.rol?.rol_id || "",
      activo: user?.activo || 1,
    });
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };
  
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>{user ? "Editar Usuario" : "Crear Usuario"}</DialogTitle>
        <DialogContent>
          <TextField name="nombre" label="Nombre" value={formData.nombre} onChange={handleChange} fullWidth margin="dense" required />
          <TextField name="primer_apellido" label="Primer Apellido" value={formData.primer_apellido} onChange={handleChange} fullWidth margin="dense" required />
          <TextField name="segundo_apellido" label="Segundo Apellido" value={formData.segundo_apellido} onChange={handleChange} fullWidth margin="dense" />
          <TextField name="celular" label="Celular" value={formData.celular} onChange={handleChange} fullWidth margin="dense" />
          <TextField name="username" label="Usuario" value={formData.username} onChange={handleChange} fullWidth margin="dense" required />
  
          {/* Solo los Administradores pueden cambiar la contraseña */}
          {userRole === "Administrador" && (
            <TextField name="password" label="Nueva Contraseña" type="password" value={formData.password} onChange={handleChange} fullWidth margin="dense" />
          )}
  
          <FormControl fullWidth margin="dense">
            <InputLabel>Rol</InputLabel>
            <Select name="rol_id" value={formData.rol_id} onChange={handleChange} required>
              <MenuItem value="1">Administrador</MenuItem>
              <MenuItem value="2">Usuario</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">Guardar</Button>
        </DialogActions>
      </Dialog>
    );
  }
  