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
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [campaignStats, setCampaignStats] = useState(null);
  const [sendingInProgress, setSendingInProgress] = useState(false);

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
    console.log("clientes", clients)
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
    handleSendCampaign: async () => {
      try {
        setSendingInProgress(true);
        setSnackbarMessage("🚀 Iniciando envío de campaña...");
        setSnackbarSeverity("info");
        setSnackbarOpen(true);

        const response = await sendCampaignMessages(id);

        // 🔹 Manejar la nueva respuesta 202 de GCP
        if (response.success) {
          const { campaign, status, timing } = response;
          
          // Crear mensaje optimista basado en la respuesta
          const successMessage = `🎉 ${response.message}

📋 Campaña: ${campaign.name}
👥 Destinatarios: ${campaign.recipients} clientes
📊 Estado: ${status.current}
⏱️ Tiempo estimado: ${timing.estimated}

💡 ${status.description}
🔄 Los mensajes se están enviando automáticamente en segundo plano`;

          setSnackbarMessage(successMessage);
          setSnackbarSeverity("success");
          
          // Guardar información básica en stats
          setCampaignStats({
            campaignId: campaign.id,
            campaignName: campaign.name,
            totalRecipients: campaign.recipients,
            status: status.current,
            estimatedTime: timing.estimated,
            startedAt: new Date().toISOString()
          });

          // Actualizar la campaña después de un breve delay
          setTimeout(() => {
            fetchCampaignDetail();
          }, 2000);

        } else {
          throw new Error(response.message || "Error desconocido en el envío");
        }

        setSnackbarOpen(true);

      } catch (err) {
        console.error("Error en envío de campaña:", err);
        
        let errorMessage = "❌ Error al iniciar el envío de campaña";
        
        if (err.message.includes("timeout")) {
          errorMessage = "⏱️ Timeout al iniciar envío\n💡 La campaña podría haberse iniciado correctamente";
        } else if (err.message.includes("network")) {
          errorMessage = "🌐 Error de conexión\n🔄 Verifica tu conexión a internet";
        } else {
          errorMessage = `❌ Error al iniciar envío:\n${err.message}`;
        }

        setSnackbarMessage(errorMessage);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } finally {
        setSendingInProgress(false);
      }
    },
    snackbar: (
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={sendingInProgress ? null : 8000} // No auto-hide mientras está enviando
        onClose={() => !sendingInProgress && setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ maxWidth: '500px' }}
      >
        <Alert
          onClose={() => !sendingInProgress && setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{
            width: "100%",
            '& .MuiAlert-message': {
              whiteSpace: 'pre-line', // Permite saltos de línea
              fontSize: '14px',
              lineHeight: 1.4
            }
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    ),
    // Exportar estadísticas para uso en componentes
    campaignStats,
    sendingInProgress
  };
};

export default useCampaignDetail;
