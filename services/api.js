import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const axiosInstance = axios.create({
  baseURL: `${API_URL}/api`, // 🔹 Asegura que se use correctamente la API interna
  headers: { "Content-Type": "application/json" },
  timeout: 60000, 
});

// 🔹 Interceptor para adjuntar el token en cada solicitud
axiosInstance.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔹 Interceptor para manejar respuestas y errores
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ Error en la API:", error.response?.data || error.message);

    if (!error.response) {
      console.error("⚠️ Posible problema de conexión con el servidor.");
    }

    // 🔹 Si el token expira (401), cerrar sesión automáticamente
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        console.warn("🔄 Token expirado. Redirigiendo al login...");
        localStorage.removeItem("token");
        window.location.href = "/login"; // 🔄 Redirige al login
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
