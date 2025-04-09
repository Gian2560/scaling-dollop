import axiosInstance from "./api";

export const fetchClientes = async ({ page = 1, pageSize = 10, filters = {}, sortModel = [],name ="",role=""}) => {
  try {
    const params = {
      page,
      pageSize,
      search: filters.search || "",
      estado: filters.estado !== "Todos" ? filters.estado : undefined,
      bound: filters.bound !== "Todos" ? filters.bound : undefined,
      fechaInicio: filters.fechaInicio || undefined,
      fechaFin: filters.fechaFin || undefined,
      orderBy: sortModel.length ? sortModel[0].field : "fecha_creacion",
      order: sortModel.length ? sortModel[0].sort : "asc",
      name,
      role
    };

    console.log("📡 Enviando solicitud con parámetros:", params);

    const response = await axiosInstance.get("/clientes", { params });
    console.log("xd",response);
    return response.data;
  } catch (error) {
    console.error("❌ Error al obtener clientes:", error);
    return { clientes: [], total: 0 };
  }
};


export const fetchClienteById = async (id) => {
    try {
      const response = await axiosInstance.get(`/clientes/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener detalle del cliente:", error);
      return null;
    }
  };

  export const fetchConversacion = async (clienteId) => {
    try {
      const response = await axiosInstance.get(`/conversacion/${clienteId}`);
      return response.data.conversaciones;  // Devuelve solo el array de conversaciones
    } catch (error) {
      console.error("Error al obtener conversación:", error);
      return [];
    }
  };
  export const getGestores = async () => {
    try {
      const response = await axiosInstance.get("/gestores");
      return response.data;
    } catch (error) {
      console.error("Error al obtener gestores:", error);
      return [];
    }
  };

  export const updateCliente = async (clienteData) => {
    try {
      console.log("actual",clienteData);

      const response = await axiosInstance.put(`/clientes/${clienteData.id}`, {
        estado: clienteData.estado,
        accion: clienteData.accion,
        gestor: clienteData.gestor,
        observaciones: clienteData.observaciones,
        fechaPromesaPago: clienteData.fechaPromesaPago || null, // Asegurar que se envía null si está vacío
      });

      return response.data;
    } catch (error) {
      console.error("❌ Error al actualizar cliente:", error);
      throw error;
    }
};

