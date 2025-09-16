"use client";

import { useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Stack,
  Button,
  Divider,
  Box, Autocomplete
} from "@mui/material";
import axiosInstance from "../../../../services/api";
import { useEffect } from "react";
import { LocalizationProvider, DatePicker, TimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CircularProgress from '@mui/material/CircularProgress';
import { DataGrid } from "@mui/x-data-grid";

export default function CampaignPage() {
  const [campaignName, setCampaignName] = useState("");
  //const [selectedDatabase, setSelectedDatabase] = useState("");
  const [selectedDatabase, setSelectedDatabase] = useState("BD_SegmentacionFinal");
  const [columns, setColumns] = useState([]);
  const [template, setTemplate] = useState("");
  // const [clientSegment, setClientSegment] = useState("");
  // const [cluster, setCluster] = useState("");
  // const [strategy, setStrategy] = useState("");
  // const [fecha, setFecha] = useState("");
  // const [linea, setLinea] = useState("");
  const [clientSegments, setClientSegments] = useState([]);//nuevo
  const [asesoresSeleccionados, setAsesoresSeleccionados] = useState([]);//nuevo
  const [segments, setSegments] = useState([]);
  const [asesores, setAsesores] = useState([]);
  const [tipoCampaña, setTipoCampaña] = useState("Fidelizacion");
  const [variable2, setVariable2] = useState("");
  const [sendDate, setSendDate] = useState(null);
  const [sendTime, setSendTime] = useState(null);
  const [templates, setTemplates] = useState([]); // Para almacenar las plantillas obtenidas
  const [loadingColumns, setLoadingColumns] = useState(false);  // Estado para saber si estamos cargando las columnas
  const [clients, setClients] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState({
    segmento: 'segmentacion',  // Fijo con valor 'segmentacion'
    cluster: 'Cluster',        // Fijo con valor 'cluster'
    estrategia: 'gestion',     // Fijo con valor 'gestion'
    fechaCuota: 'Fec_Venc_Cuota', // Fijo con valor 'Fec_Venc_Cuota'
    linea: 'Linea'
  });
  // Datos simulados
  const [databases, useDatabases] = useState([]);

  //const [segments, setSegments] = useState([]);
  const [clusters, setClusterValues] = useState([]);
  const [strategies, setStrategyValues] = useState([]);
  const [fechaCuotaColumn, setFechaCuotaColumnValues] = useState([]);
  const [lineaValue, setLineaValues] = useState([]);
  const variables = ["Variable 1", "Variable 2", "Variable 3"];
  // al inicio: yomi
  const [placeholders, setPlaceholders] = useState([])            // e.g. [ "1", "2", ... ]
  const [variableMappings, setVariableMappings] = useState({})    // { "1": "nombre", "2": "telefono", … }


  // useEffect(() => {
  //   const fetchDatabases = async () => {
  //     try {
  //       const response = await axiosInstance.get("/bigquery"); // Solicitud GET al endpoint de bases de datos
  //       console.log("Respuesta de BigQuery:", response.data);
  //       useDatabases(response.data.tables); // Guarda las bases de datos en el estado 
  //       console.log("Bases de datos obtenidas:", response.data);
  //     } catch (error) {
  //       console.error("Error al obtener bases de datos:", error);
  //     }
  //   }
  //   const fetchTemplates = async () => {
  //     try {
  //       const response = await axiosInstance.get("/plantillas"); // Solicitud GET al endpoint de plantillas
  //       setTemplates(response.data); // Guarda las plantillas en el estado
  //       console.log("Plantillas obtenidas:", response.data);
  //     } catch (error) {
  //       console.error("Error al obtener plantillas:", error);
  //     }
  //   };
  //   fetchDatabases();
  //   fetchTemplates();
  // }, []);
  // Carga inicial: plantillas, filtros (segmento y asesor) y data inicial
  useEffect(() => {
    const boot = async () => {
      try {
        setLoadingColumns(true);
        const [filtRes, initRes] = await Promise.all([
          //axiosInstance.get("/plantillas"),
          axiosInstance.get("/bigquery/columns/filtros", { params: { database: "BD_SegmentacionFinal" } }),
          axiosInstance.get("/bigquery/segmentacionfinal"),
        ]);
        //setTemplates(tplRes.data || []);
        setSegments(filtRes.data.segmentos || []);
        setAsesores(filtRes.data.asesores || []);
        setClients(initRes.data.rows || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingColumns(false);
      }
    };
    const fetchTemplates = async () => {
      try {
        const response = await axiosInstance.get("/plantillas"); // Solicitud GET al endpoint de plantillas
        setTemplates(response.data); // Guarda las plantillas en el estado
        console.log("Plantillas obtenidas:", response.data);
      } catch (error) {
        console.error("Error al obtener plantillas:", error);
      }
    };
    boot();
    fetchTemplates();
  }, []);

  //GIAN
  // const handleTemplateChange = (event) => {
  //   const selectedTemplate = event.target.value;
  //   setTemplate(selectedTemplate);
  // };
  //YOMI
  const handleTemplateChange = event => {
    const tplId = event.target.value
    setTemplate(tplId)

    // Buscamos la plantilla en nuestro array
    const tpl = templates.find(t => t.id === tplId)
    if (tpl) {
      // extraemos todos los {{n}}
      const matches = [...tpl.mensaje.matchAll(/{{\s*(\d+)\s*}}/g)]
        .map(m => m[1])
      const uniq = Array.from(new Set(matches))
      setPlaceholders(uniq)             // e.g. ["1"]
      setVariableMappings({})           // resetea anteriores selecciones
    } else {
      setPlaceholders([])
    }
  }




  // const handleSubmit = async () => {
  //   if (clients.length === 0) {
  //     alert("No hay clientes para agregar a la campaña.");
  //     return;
  //   }

  //   const campaignData = {
  //     nombre_campanha: campaignName,
  //     descripcion: "Descripción de campaña",
  //     template_id: template,
  //     fecha_inicio: sendDate,
  //     fecha_fin: sendTime,
  //     clients: clients,  // Aquí envías toda la información de los clientes
  //     variableMappings,
  //   };

  //   try {
  //     // Enviar solicitud para crear la campaña
  //     const response = await axiosInstance.post("/campaings", campaignData);

  //     const campanhaId = response.data.campanha_id;  // Obtener el ID de la campaña creada

  //     console.log("Campaña creada con ID:", campanhaId);

  //     // Ahora los clientes serán automáticamente asociados con la campaña
  //     alert("Campaña creada y clientes asociados exitosamente.");
  //   } catch (error) {
  //     console.error("Error al crear campaña o agregar clientes:", error);
  //     alert("Hubo un problema al crear la campaña o agregar los clientes.");
  //   }
  // };
  const handleSubmit = async () => {
    if (!campaignName) {
      alert("Ingresa el nombre de la campaña.");
      return;
    }
    if (!clients.length) {
      alert("No hay clientes para agregar a la campaña.");
      return;
    }

    try {
      // 1) crear campaña
      const createRes = await axiosInstance.post("/campaings", {
        nombre_campanha: campaignName,
        descripcion: "Descripción de campaña",
        template_id: Number(template) || null,
        clients: clients,
        fecha_inicio: sendDate,
        fecha_fin: null,
        variableMappings,
      });

      // tu POST /api/campaings devuelve { message, campanha }
      const campanhaId = createRes.data?.campanha?.campanha_id;
      if (!campanhaId) throw new Error("No se recibió campanha_id al crear la campaña.");

      // 2) asociar clientes a la campaña
      await axiosInstance.post(`/campaings/add-clients/${campanhaId}`, {
        clients, // ← ya normalizados
      });

      alert("Campaña creada y clientes asociados exitosamente.");
    } catch (error) {
      console.error("❌ Error al crear campaña o asociar clientes:", {
        status: error.response?.status,
        url: error.response?.config?.url,
        data: error.response?.data || error.message,
      });
      alert("Hubo un problema al crear la campaña o asociar los clientes.");
    }
  };

  const handleDatabaseChange = async (event, value) => {
    setSelectedDatabase(value);
    setLoadingColumns(true);

    try {
      const response = await axiosInstance.get("/bigquery/columns", {
        params: { database: value } // Enviamos el nombre de la base de datos seleccionada);
      });
      console.log("Columnas obtenidas:", response.data);
      setColumns(response.data.columns);
      console.log("Columnas disponibles:", columns);
      setLoadingColumns(false);  // Detener el indicador de carga

      handleColumnChange(value);
    } catch (error) {
      console.error('Error al obtener las columnas:', error);
      setLoadingColumns(false);  // Detener el indicador de carga

    }
  };
  const handleColumnChange = async (value) => {
    /*setSelectedColumns({
      ...selectedColumns,
      [filterType]: value
    });*/
    setLoadingColumns(true);
    try {
      const response = await axiosInstance.get("/bigquery/columns/filtros", {
        params: {
          database: value,
          segmentColumn: "segmentacion",
          clusterColumn: "Cluster",
          estrategiaColumn: "gestion",
          fechaCuotaColumn: "Fec_Venc_Cuota",
          lineaColumn: "Linea"
        }  // Enviamos los nombres de las columnas seleccionadas
      });
      console.log("Valores únicos obtenidos:", response.data);

      setSegments(response.data.segmentos);
      setClusterValues(response.data.clusters);
      setStrategyValues(response.data.estrategias);
      setFechaCuotaColumnValues(response.data.fechaCuotaColumn);
      setLineaValues(response.data.lineas);
      /*setColumnValues({
        segmento: response.data.segmentos,
        cluster: response.data.clusters,
        estrategia: response.data.estrategias
      });*/
      setLoadingColumns(false);  // Detener el indicador de carga
    } catch (error) {
      console.error("Error al obtener los valores únicos:", error);
      setLoadingColumns(false);  // Detener el indicador de carga en caso de error
    }
  };

  // Colores base para usar en estilos
  const colors = {
    primaryBlue: "#007391",
    darkBlue: "#254e59",
    yellowAccent: "#FFD54F", // amarillo suave
    lightBlueBg: "#E3F2FD", // azul claro para fondo preview
    white: "#fff",
  };

  // --- NUEVO: aplicar filtros y enviar al backend -----------------------------
  // ── NUEVO: arma el payload y envíalo ─────────────────────────────
  // const applyFilters = async () => {
  //   if (!selectedDatabase) {
  //     alert('Selecciona una base de datos antes de filtrar');
  //     return;
  //   }

  //   // Array que contendrá 0-3 filtros, según lo que elija el usuario
  //   const filters = [];

  //   if (selectedColumns.segmento) {
  //     filters.push({
  //       type: 'segmentacion',
  //       column: selectedColumns.segmento, // nombre de la columna
  //       value: clientSegment             // valor elegido en el <Select>
  //     });
  //   }

  //   if (selectedColumns.cluster) {
  //     filters.push({
  //       type: 'cluster',
  //       column: selectedColumns.cluster,
  //       value: cluster
  //     });
  //   }

  //   if (selectedColumns.estrategia) {
  //     filters.push({
  //       type: 'estrategia',
  //       column: selectedColumns.estrategia,
  //       value: strategy
  //     });
  //   }
  //   if (selectedColumns.fechaCuota) {
  //     filters.push({
  //       type: 'fechaCuota',
  //       column: selectedColumns.fechaCuota,
  //       value: fecha
  //     });
  //   }

  //   if (selectedColumns.linea) {
  //     filters.push({
  //       type: 'Linea',
  //       column: selectedColumns.linea,
  //       value: linea
  //     });
  //   }

  //   if (filters.length === 0) {
  //     alert('Elige al menos un filtro antes de continuar');
  //     return;
  //   }

  //   const payload = {
  //     tipoCampana: tipoCampaña, // "Recordatorio" o "Fidelizacion"
  //     table: selectedDatabase, // nombre de la tabla o vista en BigQuery
  //     filters                  // array con los filtros
  //   };

  //   try {
  //     console.log('Enviando payload de filtros:', payload);
  //     const { data } = await axiosInstance.post('/bigquery/filtrar', payload);
  //     console.log('Datos filtrados →', data);
  //     let clientsProcesados = data.rows;
  //     if (tipoCampaña === "Fidelizacion") {
  //       const opcionesFecha = { weekday: 'long', day: 'numeric', month: 'long' };
  //       clientsProcesados = data.rows.map(row => {
  //         let fechaLegible = '';
  //         // Verifica si feccuota existe y tiene la propiedad value
  //         if (row.feccuota && row.feccuota.value) {
  //           const fechaObj = new Date(row.feccuota.value);
  //           if (!isNaN(fechaObj.getTime())) {
  //             fechaLegible = fechaObj.toLocaleDateString('es-ES', opcionesFecha);
  //           }
  //         }
  //         return {
  //           ...row,
  //           feccuota: fechaLegible
  //         };
  //       });
  //     }
  //     setClients(clientsProcesados);
  //     console.log('Datos filtrados:', data);
  //     // TODO: guarda "data" en estado o muéstralo en pantalla
  //   } catch (error) {
  //     console.error('Error al aplicar filtros:', error);
  //     alert('Ocurrió un problema al aplicar los filtros');
  //   }
  // };

    const applyFilters = async () => {
      try {//nuevo
        setLoadingColumns(true);
        const filters = [];
        if (clientSegments.length > 0) {
          filters.push({ type: 'segmento', value: clientSegments });
        }
        if (asesoresSeleccionados.length > 0) {
          filters.push({ type: 'asesor', value: asesoresSeleccionados });
        }
        const { data } = await axiosInstance.post('/bigquery/filtrar', { filters });
        const rows = data.rows || [];
        setClients(rows);
      } catch (e) {
        console.error(e);
        alert('Ocurrió un problema al aplicar los filtros');
      } finally {
        setLoadingColumns(false);
      }//termina nuevo
    };



  // ─────────────────────────────────────────────────────────────────
  // const columnsgrid = [
  //   { field: 'Codigo_Asociado', headerName: 'Código Asociado', width: 180 },
  //   { field: 'nombre', headerName: 'Nombre', width: 180 },
  //   { field: 'telefono', headerName: 'Teléfono', width: 180 },
  //   { field: 'segmentacion', headerName: 'Segmento', width: 180 },
  //   { field: 'monto', headerName: 'Monto', width: 150 },
  //   { field: 'feccuota', headerName: 'Fecha Cuota', width: 180 },
  //   { field: 'email', headerName: 'Correo', width: 220 },
  //   { field: 'modelo', headerName: 'Modelo', width: 180 },
  //   { field: 'codpago', headerName: 'Código Pago', width: 180 },
  //   { field: 'Cta_Act_Pag', headerName: 'Cuotas', width: 120 },
  // ];
   const columnsgrid = [
    { field: 'Codigo_Asociado', headerName: 'Código Asociado', width: 170 },
    { field: 'documento_identidad', headerName: 'N° Doc', width: 140 },
    { field: 'nombre', headerName: 'Nombres', width: 200 },
    { field: 'celular', headerName: 'Teléfono', width: 150 },
    { field: 'Segmento', headerName: 'Segmento', width: 150 },
    { field: 'email', headerName: 'Correo', width: 220 },
    { field: 'Zona', headerName: 'Zona', width: 120 },
    { field: 'gestor', headerName: 'Asesor', width: 180 },
    { field: 'Producto', headerName: 'Producto', width: 180 },
  ];
  // ---------------------------------------------------------------------------


  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container
        maxWidth="lg"
        sx={{
          mt: 4,
          mb: 6,
          bgcolor: "#F0F7FA",
          borderRadius: 3,
          boxShadow: 3,
          p: { xs: 2, sm: 4 },
        }}
      >
        <Typography
          variant="h3"
          sx={{
            color: colors.primaryBlue,
            fontWeight: "700",
            mb: 4,
            textAlign: "center",
            letterSpacing: "0.05em",
          }}
        >
          Crear Campaña
        </Typography>

        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 3,
            bgcolor: colors.white,
          }}
        >
          {/* DATOS BASICOS */}
          <Typography
            variant="h6"
            sx={{ color: colors.darkBlue, fontWeight: "700", mb: 3, borderBottom: `3px solid ${colors.primaryBlue}`, pb: 1 }}
          >
            Datos Básicos
          </Typography>

          <Grid container spacing={4} mb={5}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nombre de la campaña"
                fullWidth
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                sx={{ bgcolor: colors.white, borderRadius: 2 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'darkBlue', fontWeight: 600 }}></InputLabel>
                <Autocomplete
                  value={selectedDatabase}
                  onChange={handleDatabaseChange}
                  options={databases}
                  renderInput={(params) => <TextField {...params} label="Base de Datos" />}
                  isOptionEqualToValue={(option, value) => option === value}  // Asegura que las opciones coincidan con el valor
                  sx={{
                    bgcolor: 'white',
                    borderRadius: 2,
                    "& .MuiSelect-select": { fontWeight: 600 },
                  }}
                  disableClearable  // No permite borrar la selección
                  freeSolo  // Permite escribir texto que no está en las opciones (útil para búsqueda)
                />
              </FormControl>
            </Grid> 




          </Grid>

          <Divider sx={{ mb: 5 }} />

          {/* SEGMENTACION */}
          {/* <Typography
            variant="h6"
            sx={{ color: colors.darkBlue, fontWeight: "700", mb: 3, borderBottom: `3px solid ${colors.primaryBlue}`, pb: 1 }}
          >
            Segmentación
          </Typography>

          <Grid container spacing={4} mb={5}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: colors.darkBlue, fontWeight: 600 }}>Segmento</InputLabel>
                <Select
                  value={clientSegment}
                  onChange={(e) => setClientSegment(e.target.value)}
                  label="Segmento"
                  sx={{ bgcolor: colors.white, borderRadius: 2, "& .MuiSelect-select": { fontWeight: 600 } }}
                >
                  <MenuItem value="Todos">Todos</MenuItem>
                  {segments.map((seg) => (
                    <MenuItem key={seg} value={seg}>
                      {seg}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: colors.darkBlue, fontWeight: 600 }}>Cluster</InputLabel>
                <Select
                  value={cluster}
                  onChange={(e) => setCluster(e.target.value)}
                  label="Cluster"
                  sx={{ bgcolor: colors.white, borderRadius: 2, "& .MuiSelect-select": { fontWeight: 600 } }}
                >
                  <MenuItem value="Todos">Todos</MenuItem>

                  {clusters.map((cl) => (
                    <MenuItem key={cl} value={cl}>
                      {cl}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: colors.darkBlue, fontWeight: 600 }}>Estrategia</InputLabel>
                <Select
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  label="Estrategia"
                  sx={{ bgcolor: colors.white, borderRadius: 2, "& .MuiSelect-select": { fontWeight: 600 } }}
                >
                  <MenuItem value="Todos">Todos</MenuItem>

                  {strategies.map((str) => (
                    <MenuItem key={str} value={str}>
                      {str}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: colors.darkBlue, fontWeight: 600 }}>Fecha Cuota</InputLabel>
                <Select
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  label="Fecha Cuota"
                  sx={{ bgcolor: colors.white, borderRadius: 2, "& .MuiSelect-select": { fontWeight: 600 } }}
                >
                  <MenuItem value="Todos">Todos</MenuItem>

                  {fechaCuotaColumn.map((str) => (
                    <MenuItem key={str} value={str}>
                      {str}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: colors.darkBlue, fontWeight: 600 }}>Linea</InputLabel>
                <Select
                  value={linea}
                  onChange={(e) => setLinea(e.target.value)}
                  label="Fecha Cuota"
                  sx={{ bgcolor: colors.white, borderRadius: 2, "& .MuiSelect-select": { fontWeight: 600 } }}
                >
                  <MenuItem value="Todos">Todos</MenuItem>

                  {lineaValue.map((str) => (
                    <MenuItem key={str} value={str}>
                      {str}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: colors.darkBlue, fontWeight: 600 }}>Tipo Campaña</InputLabel>
                <Select
                  value={tipoCampaña} // Por defecto "Fidelización"
                  onChange={(e) => setTipoCampaña(e.target.value)}
                  label="Tipo Campaña"
                  sx={{ bgcolor: colors.white, borderRadius: 2, "& .MuiSelect-select": { fontWeight: 600 } }}
                >
                  <MenuItem value="Recordatorio">Recordatorio</MenuItem>
                  <MenuItem value="Fidelizacion">Fidelización</MenuItem>
                </Select>
              </FormControl>
            </Grid> */}

            {/* Botón para aplicar los filtros */}
            {/* <Grid item xs={12}>
              <Button variant="contained" color="primary" onClick={applyFilters} sx={{ mt: 2 }}>
                Aplicar Filtros
              </Button>
            </Grid>
          </Grid> */}
          <Typography variant="h6" sx={{ /* ...estilos... */ }}>Segmentación</Typography>
          <Grid container spacing={4} mb={5}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Segmento</InputLabel>
                <Select
                  multiple
                  value={clientSegments}
                  onChange={e => setClientSegments(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                  label="Segmento"
                  renderValue={selected => selected.join(', ')}
                >
                  {segments.map(seg => (
                    <MenuItem
                      key={seg}
                      value={seg}
                      sx={clientSegments.includes(seg) ? { bgcolor: '#0677f8ff', color: '#020202ff', fontWeight: 'bold' } : {}}
                    >
                      {seg}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Asesor</InputLabel>
                <Select
                  multiple
                  value={asesoresSeleccionados}
                  onChange={e => setAsesoresSeleccionados(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                  label="Asesor"
                  renderValue={selected => selected.join(', ')}
                >
                  {asesores.map(a => (
                    <MenuItem
                      key={a}
                      value={a}
                      sx={asesoresSeleccionados.includes(a) ? { bgcolor: '#0677f8ff', color: '#020202ff', fontWeight: 'bold' } : {}}
                    >
                      {a}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" onClick={applyFilters}>Aplicar Filtros</Button>
            </Grid>
          </Grid>


          <Divider sx={{ mb: 5 }} />
          <Box sx={{ height: 400, width: '100%' }}>
            {loadingColumns ? (
              <CircularProgress sx={{ display: "block", margin: "0 auto" }} /> // Mostrar cargando
            ) : (
              // <DataGrid
              //   rows={clients.map((client, index) => ({
              //     ...client,
              //     id: client.telefono || index,  // Asegúrate de que 'rows' tenga un 'id' único
              //   }))}
              //   columns={columnsgrid}  // Utilizando el arreglo columnsgrid para definir las columnas
              //   pageSize={5}
              //   rowsPerPageOptions={[5, 10, 20]}
              //   pagination
              //   checkboxSelection
              //   disableSelectionOnClick
              //   loading={loadingColumns}
              // />
                <DataGrid
                  rows={clients.map((r, i) => ({ ...r, id: `${r.N_Doc || i}-${r.Codigo_Asociado || 'X'}` }))}
                  columns={columnsgrid}
                  pageSize={5}
                  rowsPerPageOptions={[5,10,20]}
                  pagination
                  checkboxSelection
                  disableSelectionOnClick
                  loading={loadingColumns}
                />

            )}
          </Box>
          <Divider sx={{ mb: 5 }} />

          {/* VARIABLES */}
          {/*<Typography
            variant="h6"
            sx={{ color: colors.darkBlue, fontWeight: "700", mb: 3, borderBottom: `3px solid ${colors.primaryBlue}`, pb: 1 }}
          >
            Variables adicionales
          </Typography>

          <Grid container spacing={4} mb={5}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: colors.darkBlue, fontWeight: 600 }}>Variable 1</InputLabel>
                <Select
                  value={variable1}
                  onChange={(e) => setVariable1(e.target.value)}
                  label="Variable 1"
                  sx={{ bgcolor: colors.white, borderRadius: 2, "& .MuiSelect-select": { fontWeight: 600 } }}
                >
                  {variables.map((v) => (
                    <MenuItem key={v} value={v}>
                      {v}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: colors.darkBlue, fontWeight: 600 }}>Variable 2</InputLabel>
                <Select
                  value={variable2}
                  onChange={(e) => setVariable2(e.target.value)}
                  label="Variable 2"
                  sx={{ bgcolor: colors.white, borderRadius: 2, "& .MuiSelect-select": { fontWeight: 600 } }}
                >
                  {variables.map((v) => (
                    <MenuItem key={v} value={v}>
                      {v}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>*/}

          <Divider sx={{ mb: 5 }} />

          {/* PLANTILLA Y VISTA PREVIA */}
          <Typography
            variant="h6"
            sx={{ color: colors.darkBlue, fontWeight: "700", mb: 3, borderBottom: `3px solid ${colors.primaryBlue}`, pb: 1 }}
          >
            Plantilla de Mensaje
          </Typography>

          <Grid container spacing={4} mb={5}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: "#254e59", fontWeight: 600 }}>Seleccionar Plantilla</InputLabel>
                <Select
                  value={template}  // Este es el id de la plantilla seleccionada
                  onChange={handleTemplateChange}
                  label="Seleccionar Plantilla"
                  sx={{ bgcolor: "#fff", borderRadius: 2, "& .MuiSelect-select": { fontWeight: 600 } }}
                >
                  {templates.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.nombre_template} {/* Aquí se muestra el nombre de la plantilla */}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {/* yomi */}
            {placeholders.map(idx => (
              <Grid item xs={12} sm={4} key={idx}>
                <FormControl fullWidth>
                  <InputLabel>Variable {idx}</InputLabel>
                  <Select
                    value={variableMappings[idx] || ""}
                    onChange={e =>
                      setVariableMappings(vm => ({ ...vm, [idx]: e.target.value }))
                    }
                    label={`Variable ${idx}`}
                  >
                    {/* usamos columnsgrid para poblar los campos de la tabla */}
                    {columnsgrid.map(col => (
                      <MenuItem key={col.field} value={col.field}>
                        {col.headerName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            ))}
            {/* yomi termina*/}
            <Grid item xs={12} sm={6}>
              {template && (
                <Card
                  sx={{
                    bgcolor: "#E3F2FD",  // Usando el color de fondo claro
                    p: 3,
                    minHeight: 140,
                    borderRadius: 3,
                    border: "1.5px solid #007391",  // Color de borde
                    boxShadow: "0 4px 12px rgba(0, 115, 145, 0.15)",  // Sombra para darle profundidad
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold" mb={1} color="#254e59">
                    Vista previa
                  </Typography>
                  <Typography variant="body1" color="#254e59">
                    {/* Aquí buscamos la plantilla seleccionada por id y mostramos su mensaje */}
                    {templates.find((t) => t.id === template)?.mensaje}
                  </Typography>
                </Card>
              )}
            </Grid>
          </Grid>

          <Divider sx={{ mb: 5 }} />

          {/* FECHA Y HORA */}
          {/*<Typography
            variant="h6"
            sx={{ color: colors.darkBlue, fontWeight: "700", mb: 3, borderBottom: `3px solid ${colors.primaryBlue}`, pb: 1 }}
          >
            Fecha y Hora de Envío
          </Typography>*/}

          {/*<Grid container spacing={4} mb={4}>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Fecha de Envío"
                value={sendDate}
                onChange={setSendDate}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    sx={{
                      bgcolor: colors.white,
                      borderRadius: 2,
                      "& .MuiInputBase-input": { fontWeight: 600 },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TimePicker
                label="Hora de Envío"
                value={sendTime}
                onChange={setSendTime}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    sx={{
                      bgcolor: colors.white,
                      borderRadius: 2,
                      "& .MuiInputBase-input": { fontWeight: 600 },
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>*/}

          <Box textAlign="center" mt={6}>
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: colors.yellowAccent,
                color: colors.darkBlue,
                fontWeight: "700",
                px: 6,
                py: 1.5,
                borderRadius: 3,
                "&:hover": {
                  bgcolor: "#FFC107",
                },
              }}
              onClick={handleSubmit}
            >
              Crear Campaña
            </Button>
          </Box>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
}
