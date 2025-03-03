import { useState, useEffect } from "react";
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Button, MenuItem, Box, Typography
} from "@mui/material";

const CampaignModal = ({ open, onClose, campaign, templates, onSave }) => {
  const [form, setForm] = useState({
    nombre_campanha: "",
    descripcion: "",
    template_id: "",
    fecha_fin: "",
  });
  const [selectedTemplateMessage, setSelectedTemplateMessage] = useState(""); // 🔹 Estado para mensaje del template

  // 🔹 Cargar datos de la campaña en el formulario
  useEffect(() => {
    console.log("este es el tamplet",templates);
    if (campaign) {
      setForm({
        nombre_campanha: campaign.nombre_campanha || "",
        descripcion: campaign.descripcion || "",
        template_id: campaign.template_id ? String(campaign.template_id) : "",
        fecha_fin: campaign.fecha_fin ? campaign.fecha_fin.split("T")[0] : "",
      });
    } else {
      setForm({
        nombre_campanha: "",
        descripcion: "",
        template_id: "",
        fecha_fin: "",
      });
    }
  }, [campaign, templates]); // ✅ Se ejecuta cuando `campaign` cambia

  // 🔹 Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === "template_id") {
      // 🔹 Buscar el mensaje del template seleccionado
      const selectedTemplate = templates.find(t => String(t.id) === e.target.value);
      setSelectedTemplateMessage(selectedTemplate?.mensaje || ""); // Si no hay mensaje, dejar vacío
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{campaign ? "Editar Campaña" : "Nueva Campaña"}</DialogTitle>
      <DialogContent>
        <TextField 
          name="nombre_campanha" 
          label="Nombre de campaña" 
          fullWidth 
          margin="dense" 
          value={form.nombre_campanha} 
          onChange={handleChange} 
        />
        <TextField 
          name="descripcion" 
          label="Descripción" 
          fullWidth 
          margin="dense" 
          value={form.descripcion} 
          onChange={handleChange} 
        />

        {/* 🔹 Selección de Template */}
        <TextField 
          select 
          name="template_id" 
          label="Seleccionar Template" 
          fullWidth 
          margin="dense" 
          value={form.template_id} 
          onChange={handleChange}
        >
          {templates.map((template) => (
            <MenuItem key={template.id} value={String(template.id)}>
              {template.nombre_template}
            </MenuItem>
          ))}
        </TextField>

        <Box mt={2} p={2} sx={{ backgroundColor: "#f5f5f5", borderRadius: 1 }}>
          <Typography variant="subtitle1"><strong>Mensaje del Template:</strong></Typography>
          <Typography variant="body2" sx={{ fontStyle: "italic", color: "#555" }}>
            {selectedTemplateMessage || "Seleccione un template para ver el mensaje"}
          </Typography>
        </Box>

        {/* 🔹 Fecha de Finalización */}
        <TextField 
          name="fecha_fin" 
          label="Fecha de Fin" 
          type="date" 
          fullWidth 
          margin="dense" 
          value={form.fecha_fin} 
          onChange={handleChange} 
          InputLabelProps={{ shrink: true }} 
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">Cerrar</Button>
        <Button 
          color="primary" 
          variant="contained" 
          onClick={() => onSave({ 
            ...form, 
            template_id: Number(form.template_id),
            fecha_fin: form.fecha_fin ? new Date(form.fecha_fin).toISOString() : undefined 
          })}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CampaignModal;
