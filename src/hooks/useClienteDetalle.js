import { useState, useEffect } from "react";
import { fetchClienteById, fetchConversacion } from "../../services/clientesService";

export function useClienteDetalle(clienteId) {
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [conversationData, setConversationData] = useState([]);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(0);

  useEffect(() => {
    if (clienteId) {
      loadClienteDetalle(clienteId);
    }
  }, [clienteId]);

  const loadClienteDetalle = async (id) => {
    setLoading(true);
    try {
      const data = await fetchClienteById(id);
      setCliente(data);
      console.log("lientetet",data);
    } catch (err) {
      console.error("Error cargando el detalle del cliente:", err);
      setError("No se pudo cargar la información.");
    } finally {
      setLoading(false);
    }
  };

  const loadConversacion = async () => {
    if (!clienteId) return;
    setConversationLoading(true);
    try {
      const data = await fetchConversacion(clienteId);
      setConversationData(data);
    } catch (error) {
      console.error("Error al obtener la conversación:", error);
      setConversationData([]);
    } finally {
      setConversationLoading(false);
    }
  };

  return {
    cliente,
    loading,
    error,
    conversationData,
    conversationLoading,
    selectedConversation,
    setSelectedConversation,
    loadConversacion
  };
}
