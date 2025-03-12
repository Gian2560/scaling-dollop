"use client";

import { Box, Button, Typography, CircularProgress, Alert } from "@mui/material";
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
      </Box>
      
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
