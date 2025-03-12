import { useState, useEffect } from "react";
import {
  getCampaignById,
  removeClientFromCampaign,
  uploadClients, sendCampaignMessages
} from "../../services/campaignService";
import { Snackbar, Alert } from "@mui/material"; // Importamos Snackbar y Alert

const useCampaignDetail = (id) => {
  const [campaign, setCampaign] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // "success" o "error"

  const fetchCampaignDetail = async () => {
    setLoading(true);
    try {
      const { clientes, total } = await getCampaignById(id, pagination.page, pagination.pageSize);
      setCampaign(clientes);
      setClients(clientes);
      setPagination((prev) => ({ ...prev, total }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleSendCampaign = async () => {
    try {
      await sendCampaignMessages(id);
      setSnackbarMessage("Mensajes enviados correctamente!"); // Mensaje de éxito
      setSnackbarSeverity("success"); // Establecemos el tipo de alerta como "success"
      setSnackbarOpen(true); // Abrimos el Snackbar
    } catch (err) {
      console.error("❌ Error al enviar campaña:", err);
      setSnackbarMessage("Hubo un error al enviar los mensajes."); // Mensaje de error
      setSnackbarSeverity("error"); // Establecemos el tipo de alerta como "error"
      setSnackbarOpen(true); // Abrimos el Snackbar
    }
  };

  useEffect(() => {
    fetchCampaignDetail();
  }, [id, pagination.page, pagination.pageSize]);

  return {
    campaign,
    clients,
    loading,
    error,
    pagination,
    setPagination,
    fetchCampaignDetail,
    handleAddClient: async (clientId) => {
      await addClientToCampaign(id, clientId);
      fetchCampaignDetail();
    },
    handleRemoveClient: async (clientId) => {
      await removeClientFromCampaign(id, clientId);
      fetchCampaignDetail();
    },
    handleUploadClients: async (file) => {
      await uploadClients(id, file);
      fetchCampaignDetail();
    },
    handleSendCampaign,

    snackbar: (
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000} // Se cierra automáticamente después de 6 segundos
        onClose={() => setSnackbarOpen(false)} // Cerramos el Snackbar cuando termine
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    ),
  };
};

export default useCampaignDetail;
