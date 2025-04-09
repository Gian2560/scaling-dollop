import { useState, useEffect } from "react";
import { fetchClientes, fetchConversacion, getGestores ,updateCliente } from "../../services/clientesService";
import {useSession } from "next-auth/react";

export function useClientes() {
  const [clientes, setClientes] = useState([]);
  const [totalClientes, setTotalClientes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openConversationModal, setOpenConversationModal] = useState(false);
  const [cliente, setCliente] = useState(null);
  const { data: session, status } = useSession();
  const [conversationData, setConversationData] = useState(null);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(0);
  const [gestores,setGestores] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    estado: "Todos",
    bound: "Todos",
    fechaInicio: "",
    fechaFin: "",
  });

  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [sortModel, setSortModel] = useState([]);  

  useEffect(() => {
    const loadClientes = async () => {
      setLoading(true);
      const data = await fetchClientes({ page: pagination.page, pageSize: pagination.pageSize, filters, sortModel, name: session?.user?.name,role: session?.user?.role});
      setClientes(data.clientes);
      setTotalClientes(data.total);
      setLoading(false);
    };
    const loadGestores = async () => {
      const gestoresData = await getGestores();
      setGestores(gestoresData);
      
      console.log("gestores", session);
    };
    loadGestores();
    loadClientes();
  }, [filters, pagination, sortModel,session,status]);  

  // 🔹 Función para manejar el modal de acción comercial
  const handleAccionComercial = (cliente) => {
    setCliente(cliente);
    setOpenModal(true);
  };

  // 🔹 Función para manejar el cierre del modal
  const handleClose = () => {
    setOpenModal(false);
    setCliente(null);
  };

  // 🔹 Función para obtener la conversación del cliente
  const handleVerConversacion = async (clienteId) => {
    setConversationLoading(true);
    setOpenConversationModal(true);

    try {
      const data = await fetchConversacion(clienteId);
      setConversationData(data);
    } catch (error) {
      console.error("Error al obtener la conversación:", error);
      setConversationData(null);
    } finally {
      setConversationLoading(false);
    }
  };

  // 🔹 Función para cerrar el modal de conversación
  const handleCloseConversation = () => {
    setOpenConversationModal(false);
    setConversationData(null);
    setSelectedConversation(0);
  };

  const handleSaveCliente = async (clienteData) => {
    setLoading(true);
    try {
      await updateCliente(clienteData);

      // 🔄 Actualizar la lista en el frontend
      setClientes((prevClientes) =>
        prevClientes.map((c) => (c.id === clienteData.id ? { ...c, ...clienteData } : c))
      );
    } catch (error) {
      console.error("❌ Error al actualizar cliente:", error);
    } finally {
      setLoading(false);
      setOpenModal(false);
    }
  };

  return {
    clientes,
    totalClientes,
    gestores,
    loading, 
    filters,
    setFilters,
    pagination, 
    setPagination, 
    sortModel, 
    setSortModel, 
    openModal,
    openConversationModal,
    cliente, 
    conversationData,
    conversationLoading,
    selectedConversation,
    setSelectedConversation,
    handleAccionComercial,
    handleVerConversacion,
    handleClose,
    handleCloseConversation,
    handleSaveCliente
  };
}
