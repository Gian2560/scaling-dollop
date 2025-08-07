"use client";

import { Box, Button, Typography, CircularProgress, Alert } from "@mui/material";
import { useState } from "react";
import CustomDataGrid from "../components/CustomDataGrid";
import CampaignModal from "../components/CampaignModal";
import useCampaigns from "../../hooks/useCampaigns";
import { CAMPAIGN_COLUMNS } from "@/constants/columnsCampaigns";

const CampaignsPage = () => {
  const {
    campaigns,
    templates,
    pagination,
    setPagination,
    sortModel,
    setSortModel,
    openModal,
    selectedCampaign,
    handleEdit,
    handleClose,
    fetchCampaigns,
    handleCreate,
    handleCreateCampaign,
    handleUploadClients,
    loading,
    error,
  } = useCampaigns();

  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateError, setUpdateError] = useState('');

  // Función para actualizar estados de mensajes de todas las campañas
  const handleUpdateAllMessages = async () => {
    setUpdateLoading(true);
    setUpdateMessage('');
    setUpdateError('');
    
    try {
      let totalUpdated = 0;
      let totalErrors = 0;
      
      // Procesar cada campaña
      for (const campaign of campaigns) {
        try {
          const response = await fetch('/api/campaigns/update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              campaignId: campaign.campanha_id
            }),
          });

          if (response.ok) {
            const result = await response.json();
            totalUpdated += result.updated;
            totalErrors += result.errors;
            console.log(`Campaña ${campaign.nombre_campanha}: ${result.updated} actualizados`);
          } else {
            console.error(`Error en campaña ${campaign.nombre_campanha}:`, response.statusText);
            totalErrors++;
          }
        } catch (error) {
          console.error(`Error procesando campaña ${campaign.nombre_campanha}:`, error);
          totalErrors++;
        }

        // Pausa entre campañas para evitar sobrecarga
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setUpdateMessage(
        `✅ Actualización completada: ${totalUpdated} mensajes actualizados total. ${totalErrors > 0 ? `${totalErrors} errores.` : ''}`
      );

      // Refrescar la lista de campañas después de la actualización
      fetchCampaigns();
      
    } catch (error) {
      console.error('Error actualizando estados:', error);
      setUpdateError('❌ Error al actualizar estados de mensajes');
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <Box p={3} width="100%" maxWidth="1200px" margin="auto" height="100%">
      <Typography
        variant="h4"
        fontWeight="bold"
        gutterBottom
        sx={{ color: "#254e59", fontFamily: "'Roboto', sans-serif" }}
      >
        CAMPAÑAS
      </Typography>

      <Box display="flex" justifyContent="space-between" my={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreate}
          sx={{
            backgroundColor: "#007391", // Azul suave
            "&:hover": {
              backgroundColor: "#005c6b", // Azul más oscuro
            },
           
            fontFamily: "'Roboto', sans-serif",
          }}
        >
          + NUEVA CAMPAÑA
        </Button>
        
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleUpdateAllMessages}
          disabled={updateLoading || loading}
          sx={{
            borderColor: "#007391",
            color: "#007391",
            "&:hover": {
              borderColor: "#005c6b",
              backgroundColor: "rgba(0, 115, 145, 0.04)",
            },
            fontFamily: "'Roboto', sans-serif",
            minWidth: "180px",
          }}
        >
          {updateLoading ? (
            <>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              Actualizando...
            </>
          ) : (
            '🔄 Actualizar Estados'
          )}
        </Button>
      </Box>

      {/* 🔹 Mostrar mensaje de actualización */}
      {updateMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {updateMessage}
        </Alert>
      )}

      {/* 🔹 Mostrar error de actualización */}
      {updateError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {updateError}
        </Alert>
      )}
      
      {/* 🔹 Mostrar error si falla la API */}
      {error && <Alert severity="error">{error}</Alert>}

      {/* 🔹 Mostrar Spinner si está cargando */}
      {loading ? (
        <Box display="flex" justifyContent="center" my={3}>
          <CircularProgress />
        </Box>
      ) : (
        <Box width="100%" sx={{ overflowX: "auto" }}>
          <CustomDataGrid
            rows={campaigns}
            columns={CAMPAIGN_COLUMNS(handleEdit)}
            totalRows={pagination.total}
            pagination={pagination}
            setPagination={setPagination}
            sortModel={sortModel}
            setSortModel={setSortModel}
          />
        </Box>
      )}

      <CampaignModal
        open={openModal}
        onClose={handleClose}
        campaign={selectedCampaign}
        templates={templates}
        onSave={handleCreateCampaign} // ✅ Ahora maneja tanto creación como edición
      />
    </Box>
  );
};

export default CampaignsPage;
