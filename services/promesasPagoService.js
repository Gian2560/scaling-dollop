import axiosInstance from "./api"; // Asegúrate de que tienes tu configuración de Axios

export const getPromesasPago = async () => {
  const response = await axiosInstance.get("/promesas_pago"); // Cambiado a la API local
  return response.data.map((promesa) => ({
    title: `${promesa.title}`,
    start: new Date(promesa.start),
    end: new Date(promesa.end),
    backgroundColor: promesa.backgroundColor,
    extendedProps: {
      estado: promesa.extendedProps.estado,
      celular: promesa.extendedProps.celular,
    },
  }));
};
