"use client";

import React, { useState, useEffect, useMemo } from "react";
import axiosInstance from "../../../services/api";  // Importa la instancia de axios configurada
import {
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const colors = {
  primaryBlue: "#007391",
  darkBlue: "#254e59",
  white: "#fff",
  errorRed: "#E53E3E",
  lightBlueBg: "#E3F2FD",
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);
  const [nombreTemplate, setNombreTemplate] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [parametro, setParametro] = useState(1);
  const [templateContentSid, setTemplateContentSid] = useState("");

  const [filterNombre, setFilterNombre] = useState("");
  const [filterParam, setFilterParam] = useState("");

  // Obtener las plantillas al cargar la página
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await axiosInstance.get('/plantillas');  // Usamos axiosInstance para hacer la solicitud GET
        setTemplates(res.data);
      } catch (error) {
        console.error("Error al obtener las plantillas:", error);
      }
    };

    fetchTemplates();
  }, []);

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      if (filterNombre && !t.nombre_template.toLowerCase().includes(filterNombre.toLowerCase())) return false;
      if (filterParam && String(t.parametro) !== filterParam) return false;
      return true;
    });
  }, [templates, filterNombre, filterParam]);

  const handleOpenNew = () => {
    setEditTemplate(null);
    setNombreTemplate("");
    setMensaje("");
    setParametro(1);
    setTemplateContentSid("");
    setModalOpen(true);
  };

  const handleOpenEdit = (template) => {
    setEditTemplate(template);
    setNombreTemplate(template.nombre_template);
    setMensaje(template.mensaje);
    setParametro(template.parametro);
    setTemplateContentSid(template.template_content_sid);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!nombreTemplate.trim() || !mensaje.trim() || !templateContentSid.trim()) {
      alert("Por favor complete todos los campos");
      return;
    }

    const templateData = {
      nombre_template: nombreTemplate,
      mensaje,
      template_content_sid: templateContentSid,
      parametro,
    };

    if (editTemplate) {
      // Actualizar plantilla existente
      try {
        const res = await axiosInstance.put('/plantillas', {  // Usamos PUT con axiosInstance
          ...templateData,
          id: editTemplate.id,
        });
        const updatedTemplate = res.data;
        setTemplates((prev) =>
          prev.map((t) => (t.id === editTemplate.id ? { ...t, ...updatedTemplate } : t))
        );
      } catch (error) {
        console.error("Error al actualizar plantilla:", error);
      }
    } else {
      // Crear nueva plantilla
      try {
        const res = await axiosInstance.post('/plantillas', templateData);  // Usamos POST con axiosInstance
        const newTemplate = res.data;
        setTemplates((prev) => [
          ...prev,
          {
            id: templates.length ? Math.max(...templates.map((t) => t.id)) + 1 : 1,
            ...newTemplate,
          },
        ]);
      } catch (error) {
        console.error("Error al crear plantilla:", error);
      }
    }
    setModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Está seguro de eliminar esta plantilla?")) {
      try {
        const res = await axiosInstance.delete('/plantillas', {  // Usamos DELETE con axiosInstance
          data: { id },
        });
        if (res.status === 200) {
          setTemplates((prev) => prev.filter((t) => t.id !== id));
        }
      } catch (error) {
        console.error("Error al eliminar plantilla:", error);
      }
    }
  };

  const uniqueParametros = [...new Set(templates.map((t) => String(t.parametro)))];

  const columns = [
    { field: "id", headerName: "ID", width: 70, headerAlign: "center", align: "center" },
    { field: "nombre_template", headerName: "Nombre Plantilla", flex: 1, headerAlign: "center", align: "left" },
    { field: "mensaje", headerName: "Mensaje", flex: 2, headerAlign: "center", align: "left" },
    { field: "parametro", headerName: "Parámetros", width: 120, headerAlign: "center", align: "center" },
    { field: "template_content_sid", headerName: "Template Content SID", width: 180, headerAlign: "center", align: "center" },
    { field: "created_at", headerName: "Creado En", width: 160, headerAlign: "center", align: "center" },
    { field: "acciones", headerName: "Acciones", width: 140, headerAlign: "center", align: "center", renderCell: (params) => (
      <Stack direction="row" spacing={1} justifyContent="center">
        <IconButton color="primary" size="small" aria-label="Editar plantilla" onClick={() => handleOpenEdit(params.row)}><EditIcon /></IconButton>
        <IconButton color="error" size="small" aria-label="Eliminar plantilla" onClick={() => handleDelete(params.id)}><DeleteIcon /></IconButton>
      </Stack>
    )}
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h3" sx={{ color: colors.primaryBlue, fontWeight: "700", mb: 4, textAlign: "center" }}>
        Gestión de Plantillas
      </Typography>

      {/* Filtros */}
      <Paper elevation={6} sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: colors.white, boxShadow: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField label="Buscar por nombre" fullWidth value={filterNombre} onChange={(e) => setFilterNombre(e.target.value)} sx={{ bgcolor: colors.lightBlueBg, borderRadius: 2 }} />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Número de parámetros</InputLabel>
              <Select value={filterParam} label="Número de parámetros" onChange={(e) => setFilterParam(e.target.value)} sx={{ bgcolor: colors.lightBlueBg, borderRadius: 2 }}>
                <MenuItem value="">Todos</MenuItem>
                {uniqueParametros.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3} textAlign="right">
            <Button variant="contained" color="primary" onClick={handleOpenNew}>+ Nueva Plantilla</Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla de plantillas */}
      <Paper elevation={6} sx={{ p: 2, borderRadius: 3, bgcolor: colors.white, boxShadow: 3, height: 600, width: "100%" }}>
        <DataGrid rows={filteredTemplates} columns={columns} pageSizeOptions={[5, 10, 25]} pagination sx={{
          borderRadius: 3,
          "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.lightBlueBg, color: colors.darkBlue, fontWeight: "700" },
          "& .MuiDataGrid-cell": { color: colors.darkBlue, fontWeight: 600 },
          "& .MuiTablePagination-root": { color: colors.darkBlue }
        }} />
      </Paper>

      {/* Modal de Crear / Editar */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editTemplate ? "Editar Plantilla" : "Nueva Plantilla"}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField label="Nombre de la plantilla" fullWidth value={nombreTemplate} onChange={(e) => setNombreTemplate(e.target.value)} autoFocus />
            </Grid>

            <Grid item xs={12}>
              <TextField label="Mensaje" fullWidth multiline minRows={3} maxRows={6} value={mensaje} onChange={(e) => setMensaje(e.target.value)} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField label="Número de Parámetros" type="number" fullWidth inputProps={{ min: 0, max: 10 }} value={parametro} onChange={(e) => setParametro(Number(e.target.value))} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField label="Template Content SID" fullWidth value={templateContentSid} onChange={(e) => setTemplateContentSid(e.target.value)} />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>{editTemplate ? "Guardar Cambios" : "Crear Plantilla"}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
