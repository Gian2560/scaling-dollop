import { useState, useEffect } from "react";
import { 
  getCampaigns, 
  getTemplates, 
  createCampaign, 
  updateCampaign, // ✅ Función para actualizar campaña
  deleteCampaign
} from "../../services/campaignService";

const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]); 
  const [templates, setTemplates] = useState([]); 
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });
  const [sortModel, setSortModel] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTemplates();
    fetchCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.pageSize]);

  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
        const { campaigns, totalCount } = await getCampaigns(pagination.page, pagination.pageSize);
        const formattedCampaigns = campaigns.map((campaign) => ({
            ...campaign,
            id: campaign.campanha_id, 
            nombre: campaign.nombre_campanha, 
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

  const fetchTemplates = async () => {
    try {
      const templatesData = await getTemplates();
      setTemplates(templatesData || []);
      console.log("estostk esal ewrteamta",templatesData);
    } catch (err) {
      console.error("Error al obtener templates:", err);
    }
  };

  const handleCreateCampaign = async (data) => {
    try {
      if (selectedCampaign) {
        // ✅ Si hay una campaña seleccionada, actualizamos
        await updateCampaign(selectedCampaign.id, data);
      } else {
        // ✅ Si no, creamos una nueva
        await createCampaign(data);
      }
      fetchCampaigns();
      setOpenModal(false);
    } catch (err) {
      console.error("Error al guardar campaña:", err);
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    try {
      await deleteCampaign(campaignId);
      fetchCampaigns();
    } catch (err) {
      console.error("Error al eliminar campaña:", err);
    }
  };

  const handleCreate = () => {
    setSelectedCampaign(null);
    setOpenModal(true);
  };

  const handleEdit = (campaign) => {
    setSelectedCampaign(campaign);
    setOpenModal(true);
  };

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
    handleCreate,  
    handleEdit,
    handleClose,
    fetchCampaigns,
    fetchTemplates,
    handleCreateCampaign,
    handleDeleteCampaign,
    loading,
    error,
  };
};

export default useCampaigns;
