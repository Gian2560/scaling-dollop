import { useState, useRef, useEffect } from "react";
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Button, MenuItem, Table, TableHead, 
  TableRow, TableCell, TableBody, Typography, Box 
} from "@mui/material";
import * as XLSX from "xlsx"; 

const CampaignModal = ({ open, onClose, campaign, templates, onSave, onUploadClients }) => {
  const [form, setForm] = useState({
    nombre_campanha: "",
    descripcion: "",
    template_id: "",
    fecha_fin: "",
  });

  const [file, setFile] = useState(null);
  const [clients, setClients] = useState([]); 
  const fileInputRef = useRef(null);

  // 🔹 Cargar datos de `campaign` al abrir el modal
  useEffect(() => {
    if (campaign) {
      console.log("🟢 Cargando datos de campaña:", campaign);
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

  // 🔹 Manejar subida de archivo Excel
  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      const formattedClients = jsonData.map((row) => ({
        numero: row["Numero"],
        nombre: row["Nombre"],
      }));

      setClients(formattedClients);
    };
    reader.readAsArrayBuffer(uploadedFile);
  };

  // 🔹 Eliminar archivo cargado y limpiar la vista previa
  const handleRemoveFile = () => {
    setFile(null);
    setClients([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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

        {/* 🔹 Subida de archivo Excel */}
        <Typography variant="h6" mt={2}>Subir Lista de Clientes</Typography>
        <input 
          ref={fileInputRef} 
          type="file" 
          accept=".xlsx, .xls" 
          onChange={handleFileUpload} 
        />

        {clients.length > 0 && (
          <>
            <Typography variant="h6" mt={2}>Vista Previa de Clientes</Typography>
            <Box sx={{ maxHeight: 200, overflowY: "auto", border: "1px solid #ccc", borderRadius: 2, p: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Número</TableCell>
                    <TableCell>Nombre</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clients.map((client, index) => (
                    <TableRow key={index}>
                      <TableCell>{client.numero}</TableCell>
                      <TableCell>{client.nombre}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

            <Button onClick={handleRemoveFile} color="secondary" variant="outlined" sx={{ mt: 2 }}>
              Eliminar Archivo
            </Button>
          </>
        )}
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
        {campaign && file && (
          <Button 
            color="secondary" 
            variant="contained" 
            onClick={() => onUploadClients(campaign.id, file)}
          >
            Subir Clientes
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CampaignModal;
