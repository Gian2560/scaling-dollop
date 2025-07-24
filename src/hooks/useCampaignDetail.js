import { useState, useEffect } from "react";
import { 
  getCampaignById, 
  removeClientFromCampaign, 
  uploadClients, 
  sendCampaignMessages 
} from "../../services/campaignService";
import { Snackbar, Alert } from "@mui/material"; 

const useCampaignDetail = (id) => {
  const [campaign, setCampaign] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingMessages, setSendingMessages] = useState(false); // 🚀 Nuevo estado
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const fetchCampaignDetail = async () => {
    setLoading(true);
    try {
      const { campanha_id, nombre_campanha, fecha_creacion, fecha_fin, estado_campanha, 
              mensaje_cliente, template, clientes, pagination: pagData } = await getCampaignById(id, pagination.page, pagination.pageSize);

      // Actualiza la información de la campaña
      setCampaign({
        campanha_id,
        nombre_campanha,
        fecha_creacion,
        fecha_fin,
        estado_campanha,
        mensaje_cliente,
        template
      });

      // Actualiza la lista de clientes y la paginación
      setClients(clientes);
      setPagination((prev) => ({
        ...prev,
        total: pagData.total,
        page: pagData.page,
        pageSize: pagData.pageSize,
      }));

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaignDetail();
    console.log("clientes",clients)
  }, [id, pagination.page, pagination.pageSize]);

  return {
    campaign,
    clients,
    loading,
    sendingMessages, // 🚀 Exportar nuevo estado
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
    handleSendCampaign: async () => {
      setSendingMessages(true); // 🚀 Activar estado de carga
      try {
        setSnackbarMessage("🚀 Iniciando envío por lotes...");
        setSnackbarSeverity("info");
        setSnackbarOpen(true);
        
        const resultado = await sendCampaignMessages(id);
        
        const mensaje = `🎉 Envío completado! 
        Total: ${resultado.totalClientes} clientes
        ✅ Exitosos: ${resultado.totalExitosos}
        ❌ Fallidos: ${resultado.totalFallidos}
        📦 Lotes procesados: ${resultado.lotes}`;
        
        setSnackbarMessage(mensaje);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      } catch (err) {
        setSnackbarMessage(`❌ Error al enviar mensajes: ${err.message}`);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } finally {
        setSendingMessages(false); // 🚀 Desactivar estado de carga
      }
    },
    snackbar: (
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    ),
  };
};

export default useCampaignDetail;
