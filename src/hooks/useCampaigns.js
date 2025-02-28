import { useState, useEffect } from "react";
import { 
  getCampaigns, 
  getTemplates, 
  createCampaign, 
  uploadClients, 
  sendCampaign,
  deleteCampaign
} from "../../services/campaignService";

const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]); 
  const [templates, setTemplates] = useState([]); // 🔹 Guardar templates
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });
  const [sortModel, setSortModel] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 Obtener campañas al cambiar la paginación
  useEffect(() => {
    fetchCampaigns();
  }, [pagination.page, pagination.pageSize]);

  // 🔹 Obtener campañas
  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
        const { campaigns, totalCount } = await getCampaigns();

        // 🔹 Asegurar que cada campaña tenga un campo `id` basado en `campanha_id`
        const formattedCampaigns = campaigns.map((campaign) => ({
            ...campaign,
            id: campaign.campanha_id, // ✅ Agregar `id` para DataGrid
            nombre: campaign.nombre_campanha, // ✅ Normalizar nombres de columnas
            estado: campaign.estado_campanha,
            fechaCreacion: campaign.fecha_creacion,
        }));

        setCampaigns(formattedCampaigns);
        setPagination((prev) => ({ ...prev, total: totalCount || 0 }));
    } catch (err) {
        setError("Error al obtener campañas");
        setCampaigns([]);
    } finally {
        setLoading(false);
    }
  };

  // 🔹 Obtener templates de Twilio
  const fetchTemplates = async () => {
    try {
      const templatesData = await getTemplates();
      setTemplates(templatesData || []);
    } catch (err) {
      console.error("Error al obtener templates:", err);
    }
  };

  // 🔹 Crear una nueva campaña
  const handleCreateCampaign = async (data) => {
    try {
      await createCampaign(data);
      fetchCampaigns();
      setOpenModal(false);
    } catch (err) {
      console.error("Error al crear campaña:", err);
    }
  };

  // 🔹 Cargar clientes desde un archivo Excel
  const handleUploadClients = async (campaignId, file) => {
    try {
      await uploadClients(campaignId, file);
      setOpenModal(false);
      fetchCampaigns();
    } catch (err) {
      console.error("Error al subir clientes:", err);
    }
  };

  // 🔹 Enviar la campaña a clientes
  const handleSendCampaign = async (campaignId) => {
    try {
      await sendCampaign(campaignId);
      fetchCampaigns();
    } catch (err) {
      console.error("Error al enviar campaña:", err);
    }
  };

  // 🔹 Eliminar campaña
  const handleDeleteCampaign = async (campaignId) => {
    try {
      await deleteCampaign(campaignId);
      fetchCampaigns();
    } catch (err) {
      console.error("Error al eliminar campaña:", err);
    }
  };

  // 🔹 Crear campaña (Abre modal sin seleccionar campaña)
  const handleCreate = () => {
    setSelectedCampaign(null);
    setOpenModal(true);
  };

  // 🔹 Editar campaña (Abre modal con datos de campaña seleccionada)
  const handleEdit = (campaign) => {
    console.log("campñaaa",campaign);
    setSelectedCampaign(campaign);
    setOpenModal(true);
  };

  // 🔹 Cerrar el modal
  const handleClose = () => {
    setOpenModal(false);
    setSelectedCampaign(null);
  };

  return {
    campaigns,
    templates,
    pagination,
    setPagination,
    sortModel,
    setSortModel,
    openModal,
    selectedCampaign,
    handleCreate,  // ✅ Ahora está correctamente definido
    handleEdit,
    handleClose,
    fetchCampaigns,
    fetchTemplates,
    handleCreateCampaign,
    handleUploadClients,
    handleSendCampaign,
    handleDeleteCampaign, // ✅ Agregado manejo de eliminación
    loading,
    error,
  };
};

export default useCampaigns;
