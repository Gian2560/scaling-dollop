"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import useCampaignDetail from "@/hooks/useCampaignDetail";
import {
  Box, Typography, Button, CircularProgress, Alert, Dialog, DialogTitle, 
  DialogContent, DialogActions, Table, TableHead, TableRow, TableCell, TableBody, 
  Card, CardContent, Divider, IconButton
} from "@mui/material";
import CustomDataGrid from "@/app/components/CustomDataGrid";
import * as XLSX from "xlsx";
import { ArrowBack, UploadFile, Send, Delete } from "@mui/icons-material"; 

const CampaignDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const campaignId = params?.id;
  
  const [openModal, setOpenModal] = useState(false);
  const [file, setFile] = useState(null);
  const [clients, setClients] = useState([]);
  const [loadingUpload, setLoadingUpload] = useState(false);
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
    console.log("camapla",campaign);
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
    setLoadingUpload(true);
    await handleUploadClients(file);
    setOpenModal(false);
    setFile(null);
    setClients([]);
    fetchCampaignDetail();
    setLoadingUpload(false);
  };

  return (
    <Box p={3} width="100%" maxWidth="1200px" margin="auto" height="100%">
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
          <CircularProgress color="primary" />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          {/* 🔹 ENCABEZADO */}
          <Box textAlign="center" mb={3} p={2} sx={{ bgcolor: "#007391", color: "white", borderRadius: 2 }}>
            <Typography variant="h4" fontWeight="bold">📢 {campaign?.nombre_campanha}</Typography>
          </Box>

          {/* 🔹 INFORMACIÓN DE LA CAMPAÑA */}
          <Card sx={{ bgcolor: "white", boxShadow: 2, mt: 2, p: 2 }}>
            <CardContent>
              <Typography variant="h6" color="#007391">📋 Información de la Campaña</Typography>
              <Divider sx={{ my: 1, backgroundColor: "#005c6b" }} />
              <Typography><strong>📄 Descripción:</strong> {campaign?.descripcion || "Sin descripción"}</Typography>
              <Typography><strong>📅 Fecha de Creación:</strong> {campaign?.fecha_creacion ? new Date(campaign.fecha_creacion).toLocaleDateString() : "N/A"}</Typography>
              <Typography><strong>⏳ Fecha Fin:</strong> {campaign?.fecha_fin ? new Date(campaign.fecha_fin).toLocaleDateString() : "No definida"}</Typography>
              <Typography><strong>🔘 Estado:</strong> {campaign?.estado_campanha || "Desconocido"}</Typography>
              <Typography><strong>👥 Número de Clientes:</strong> {pagination.total}</Typography>
              <Typography><strong>📝 Template:</strong> {campaign?.template?.nombre_template || "No asignado"}</Typography>
              <Typography><strong>📝 Mensaje:</strong> {campaign?.template?.mensaje || "No definido"}</Typography>
            </CardContent>
          </Card>

          <Divider sx={{ my: 3 }} />

          {/* 🔹 BOTONES DE ACCIÓN */}
          <Box display="flex" justifyContent="space-between" my={2}>
            <Button
              variant="contained"
              onClick={() => router.push("/campaigns")}
              sx={{ backgroundColor: "#254e59", "&:hover": { backgroundColor: "#1a363d" } }}
              startIcon={<ArrowBack />}
            >
              Volver
            </Button>
            <Button
              variant="contained"
              onClick={() => setOpenModal(true)}
              sx={{ backgroundColor: "#007391", "&:hover": { backgroundColor: "#005c6b" } }}
              startIcon={<UploadFile />}
            >
              Subir Clientes desde Excel
            </Button>
            <Button
              variant="contained"
              onClick={handleSendCampaign}
              sx={{ backgroundColor: "#388e3c", "&:hover": { backgroundColor: "#00600f" } }}
              startIcon={<Send />}
            >
              Enviar Mensajes
            </Button>
          </Box>

          {/* 🔹 TABLA DE CLIENTES */}
          <CustomDataGrid
            pagination={pagination}
            setPagination={setPagination}
            rows={campaignClients}
            totalRows={pagination.total}
            columns={[
              { field: "id", headerName: "ID Cliente", flex: 1 },
              { field: "nombre", headerName: "Nombre", flex: 1 },
              { field: "celular", headerName: "Celular", flex: 1 },
              {
                field: "acciones",
                headerName: "Acciones",
                flex: 1,
                renderCell: (params) => (
                  <IconButton
                    onClick={() => handleRemoveClient(params.row.cliente_id)}
                    sx={{ color: "#D32F2F" }}
                  >
                    <Delete />
                  </IconButton>
                ),
              },
            ]}
          />

          {/* 🔹 MODAL DE CARGA DE CLIENTES */}
          <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
            <DialogTitle>Subir Clientes desde Excel</DialogTitle>
            <DialogContent>
              <input ref={fileInputRef} type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
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

          {/* 🔹 SPINNER DE CARGA */}
          {loadingUpload && (
            <Box sx={{
              position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex",
              justifyContent: "center", alignItems: "center", zIndex: 9999,
            }}>
              <CircularProgress size={60} color="primary" />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default CampaignDetailPage;
