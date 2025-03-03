import { useState, useEffect } from "react";
import {
  getCampaignById,
  addClientToCampaign,
  removeClientFromCampaign,
  uploadClients,
} from "../../services/campaignService";

const useCampaignDetail = (id) => {
  const [campaign, setCampaign] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });

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
  };
};

export default useCampaignDetail;
