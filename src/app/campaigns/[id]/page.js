'use client';

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import useCampaignDetail from "@/hooks/useCampaignDetail";
import {
  Box, Typography, Button, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableRow, TableCell, TableBody, Paper, Divider
} from "@mui/material";
import CustomDataGrid from "@/app/components/CustomDataGrid";
import * as XLSX from "xlsx";
import { ArrowBack, UploadFile, Send } from "@mui/icons-material"; // Iconos de Material UI

const CampaignDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const campaignId = params?.id;

  const [openModal, setOpenModal] = useState(false);
  const [file, setFile] = useState(null);
  const [clients, setClients] = useState([]);
  const [loadingUpload, setLoadingUpload] = useState(false); // Estado para controlar el spinner
  const fileInputRef = useRef(null);

  const {
    campaign,
    pagination,
    setPagination,
    clients: campaignClients,
    loading,
    error,
    fetchCampaignDetail,
    handleRemoveClient,
    handleUploadClients,
    handleSendCampaign,
    snackbar,
  } = useCampaignDetail(campaignId);

  useEffect(() => {
    if (campaignId) {
      fetchCampaignDetail();
    }
  }, [campaignId]);

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

      const formattedClients = jsonData.map((row, index) => ({
        id: index + 1,
        numero: row["Numero"],
        nombre: row["Nombre"],
      }));

      setClients(formattedClients);
    };
    reader.readAsArrayBuffer(uploadedFile);
  };

  const handleSaveClients = async () => {
    if (!file) return;
    setLoadingUpload(true); // Activar el estado de carga
    await handleUploadClients(file);
    setOpenModal(false);
    setFile(null);
    setClients([]);
    fetchCampaignDetail();
    setLoadingUpload(false); // Desactivar el estado de carga
  };

  return (
    <Box p={3} width="100%" maxWidth="1200px" margin="auto" height="100%">
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "#333" }}>
            Detalle de Campaña: {campaign?.nombre_campanha}
          </Typography>

          <Paper sx={{ p: 3, mt: 2, mb: 3, backgroundColor: "#f9f9f9" }}>
            <Typography variant="subtitle1"><strong>Descripción:</strong> {campaign?.descripcion || "Sin descripción"}</Typography>
            <Typography variant="subtitle1"><strong>Fecha Creación:</strong> {campaign?.fecha_creacion ? new Date(campaign.fecha_creacion).toLocaleDateString() : "N/A"}</Typography>
            <Typography variant="subtitle1"><strong>Fecha Fin:</strong> {campaign?.fecha_fin ? new Date(campaign.fecha_fin).toLocaleDateString() : "No definida"}</Typography>
            <Typography variant="subtitle1"><strong>Estado:</strong> {campaign?.estado_campanha || "Desconocido"}</Typography>
            <Typography variant="subtitle1"><strong>Número de Clientes:</strong> {pagination.total}</Typography>
            <Typography variant="subtitle1"><strong>Template:</strong> {campaign?.template?.nombre_template || "No asignado"}</Typography>
          </Paper>

          <Divider sx={{ my: 2 }} />

          <Box display="flex" justifyContent="space-between" my={2}>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => router.push("/campaigns")}
              sx={{
                backgroundColor: "#254e59", 
                "&:hover": {
                  backgroundColor: "#1a363d", 
                },
              }}
              startIcon={<ArrowBack />}
            >
              Volver
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenModal(true)}
              sx={{
                backgroundColor: "#007391", 
                "&:hover": {
                  backgroundColor: "#005c6b", 
                },
              }}
              startIcon={<UploadFile />}
            >
              Subir Clientes desde Excel
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleSendCampaign}
              sx={{
                backgroundColor: "#388e3c", 
                "&:hover": {
                  backgroundColor: "#00600f", 
                },
              }}
              startIcon={<Send />}
            >
              Enviar Mensajes
            </Button>
          </Box>

          <CustomDataGrid
            pagination={pagination}
            setPagination={setPagination}
            rows={campaignClients}
            totalRows={pagination.total}
            columns={[
              { field: "cliente_id", headerName: "ID Cliente", flex: 1 },
              { field: "nombre", headerName: "Nombre", flex: 1 },
              { field: "celular", headerName: "Celular", flex: 1 },
              {
                field: "acciones",
                headerName: "Acciones",
                flex: 1,
                renderCell: (params) => (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleRemoveClient(params.row.cliente_id)}
                    sx={{
                      backgroundColor: "#D32F2F", 
                      "&:hover": {
                        backgroundColor: "#9A0007", 
                      },
                    }}
                  >
                    Eliminar
                  </Button>
                ),
              },
            ]}
          />

          <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
            <DialogTitle>Subir Clientes desde Excel</DialogTitle>
            <DialogContent>
              <input ref={fileInputRef} type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
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
                        {clients.map((client) => (
                          <TableRow key={client.id}>
                            <TableCell>{client.numero}</TableCell>
                            <TableCell>{client.nombre}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenModal(false)} color="primary">Cerrar</Button>
              {file && (
                <Button color="primary" variant="contained" onClick={handleSaveClients}>
                  Subir Clientes
                </Button>
              )}
            </DialogActions>
          </Dialog>

          {snackbar}

          {/* Spinner con overlay oscuro */}
          {loadingUpload && (
            <Box
              sx={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo oscuro
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999, // Asegura que esté por encima de otros componentes
              }}
            >
              <CircularProgress size={60} color="primary" />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default CampaignDetailPage;
