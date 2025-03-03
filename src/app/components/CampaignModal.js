import { useState, useEffect } from "react";
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Button, MenuItem 
} from "@mui/material";

const CampaignModal = ({ open, onClose, campaign, templates, onSave }) => {
  const [form, setForm] = useState({
    nombre_campanha: "",
    descripcion: "",
    template_id: "",
    fecha_fin: "",
  });

  // 🔹 Cargar datos de la campaña en el formulario
  useEffect(() => {
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
  }, [campaign]); // ✅ Se ejecuta cuando `campaign` cambia

  // 🔹 Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
