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


// 🔹 Obtener detalle de una campaña con clientes paginados
export const getCampaignById = async (id, page = 1, pageSize = 10) => {
    const response = await axiosInstance.get(`/campaings/${id}/clientes`, {
      params: { page, pageSize },
    });
    return response.data;
  };

// 🔹 Eliminar un cliente de una campaña
export const removeClientFromCampaign = async (id, clientId) => {
    const response = await axiosInstance.delete(`/campaings/${id}/clientes`, {
      data: { cliente_id: clientId },
    });
    return response.data;
  };
  

  export const updateCampaign = async (campaignId, campaignData) => {
    try {
      const response = await axiosInstance.put(`/campaings/${campaignId}`, campaignData);
      return response.data;
    } catch (error) {
      console.error("❌ Error al actualizar campaña:", error);
      throw new Error(error.response?.data?.error || "Error al actualizar la campaña");
    }
  };

// 🚀 NUEVO: Función para dividir en lotes (exportable)
export function dividirEnLotes(array, tamañoLote) {
  const lotes = [];
  for (let i = 0; i < array.length; i += tamañoLote) {
    lotes.push(array.slice(i, i + tamañoLote));
  }
  return lotes;
}

// 🚀 NUEVO: Función para obtener todos los IDs de clientes
export const getClienteIds = async (campaignId) => {
  try {
    const response = await axiosInstance.get(`/campaings/${campaignId}/client-ids`);
    return response.data;
  } catch (error) {
    console.error("❌ Error al obtener IDs de clientes:", error);
    throw error;
  }
};

// 🚀 OPTIMIZADO: Enviar mensajes por lotes
export const sendCampaignMessages = async (campaignId) => {
  try {
    console.log(`🚀 Iniciando envío por lotes para campaña ${campaignId}...`);
    
    // 1. Obtener todos los IDs de clientes
    const { clienteIds, totalClientes } = await getClienteIds(campaignId);
    
    if (!clienteIds || clienteIds.length === 0) {
      throw new Error("No hay clientes en esta campaña");
    }
    
    console.log(`📊 Total de clientes: ${totalClientes}`);
    
    // 2. Dividir en lotes de 100
    const lotes = dividirEnLotes(clienteIds, 100);
    console.log(`📦 Dividido en ${lotes.length} lotes de máximo 100 clientes`);
    
    const resultados = [];
    let totalExitosos = 0;
    let totalFallidos = 0;
    
    // 3. Enviar cada lote secuencialmente para evitar timeout
    for (let i = 0; i < lotes.length; i++) {
      const lote = lotes[i];
      console.log(`📤 Enviando lote ${i + 1}/${lotes.length} (${lote.length} clientes)...`);
      
      try {
        const response = await axiosInstance.post(`/campaings/${campaignId}/send`, {
          clienteIds: lote
        });
        
        const { exitosos, fallidos, loteSize } = response.data;
        totalExitosos += exitosos;
        totalFallidos += fallidos;
        
        resultados.push({
          lote: i + 1,
          enviados: exitosos,
          fallidos: fallidos,
          total: loteSize
        });
        
        console.log(`✅ Lote ${i + 1} completado: ${exitosos} enviados, ${fallidos} fallidos`);
        
        // Pequeña pausa entre lotes para no saturar
        if (i < lotes.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.error(`❌ Error en lote ${i + 1}:`, error);
        resultados.push({
          lote: i + 1,
          error: error.message,
          total: lote.length
        });
        totalFallidos += lote.length;
      }
    }
    
    console.log(`🎉 ENVÍO COMPLETADO: ${totalExitosos} exitosos, ${totalFallidos} fallidos`);
    
    return {
      success: true,
      totalClientes,
      totalExitosos,
      totalFallidos,
      lotes: lotes.length,
      resultados
    };
    
  } catch (error) {
    console.error("❌ Error al enviar campaña:", error);
    throw error;
  }
};

 
export const getGestores = async () => {
  const res = await axiosInstance.get("/gestor");
  return res.data;
};

export const getClientesPorGestor = async (gestor) => {
  const res = await axiosInstance.post("/clientes-por-gestor", { gestor });
  return res.data;
};

export const addClientesACampanha = async (campaignId, clientIds) => {
  try {
    const response = await axiosInstance.post(`/campaings/add-clients/${campaignId}`, {
      clientIds,
    });
    console.log("✅ Resumen desde servidor:", response.data.resumen);
    return response.data;
  } catch (error) {
    console.error("❌ Error en el servicio addClientesACampanha:", error);
    throw error;
  }
};