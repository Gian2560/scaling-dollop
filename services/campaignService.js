import axiosInstance from "./api";

const API_URL = "/campaings";

export const getCampaigns = async (page = 1, pageSize = 10) => {
    const response = await axiosInstance.get(`${API_URL}?page=${page}&pageSize=${pageSize}`);
    return response.data;
};

export const getTemplates = async () => {
    const response = await axiosInstance.get("/templates");
    return response.data;
};

export const createCampaign = async (campaignData) => {
  return await axiosInstance.post(API_URL, {
      nombre_campanha: campaignData.nombre_campanha,
      descripcion: campaignData.descripcion,
      template_id: campaignData.template_id, // 📌 Asegurar que es un número
      fecha_fin: campaignData.fecha_fin || null, // 📌 Asegurar que sea null si no tiene fecha
  });
};

export const uploadClients = async (campaignId, file) => {
  const formData = new FormData();
  formData.append("archivo", file);

  return await axiosInstance.post(`/campaings/${campaignId}/cargar-clientes`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
  });
};


export const sendCampaign = async (campaignId) => {
    return await axiosInstance.post(`${API_URL}/${campaignId}/enviar`);
};

export const deleteCampaign = async (campaignId) => {
    return await axiosInstance.delete(`${API_URL}/${campaignId}`);
};
