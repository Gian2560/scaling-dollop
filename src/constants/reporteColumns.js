import { Chip } from "@mui/material";
import { blue, green, orange, red, grey, yellow } from "@mui/material/colors";

// 🔹 Mapeo de estados con colores
const stateMapping = {
  "en seguimiento": { text: "En Seguimiento", color: blue[100], textColor: blue[800] },
  "interesado": { text: "Interesado", color: yellow[100], textColor: yellow[800] },
  "no interesado": { text: "No Interesado", color: red[100], textColor: red[800] },
  "promesa de pago": { text: "Promesa de Pago", color: orange[100], textColor: orange[800] },
  "finalizado": { text: "Finalizado", color: green[200], textColor: green[900] },
  "pendiente": { text: "Pendiente", color: grey[200], textColor: grey[800] },
  default: { text: "Desconocido", color: grey[100], textColor: grey[800] },
};

// 🔹 Mapeo de acciones con colores
const actionMapping = {
  "llamada": { text: "Llamada", color: orange[100], textColor: orange[800] },
  "whatsapp": { text: "WhatsApp", color: green[100], textColor: green[800] },
  "email": { text: "Email", color: blue[100], textColor: blue[800] },
  "seguimiento": { text: "Seguimiento", color: blue[200], textColor: blue[900] },
  "cita_agendada": { text: "Cita Agendada", color: green[200], textColor: green[900] },
  "cerrado": { text: "Cerrado", color: green[300], textColor: green[900] },
  "sin_respuesta": { text: "Sin Respuesta", color: red[200], textColor: red[800] },
  "atendio_otro_lugar": { text: "Atendió en Otro Lugar", color: orange[200], textColor: orange[900] },
  "volver_contactar": { text: "Volver a Contactar", color: blue[300], textColor: blue[900] },
  default: { text: "Sin Acción", color: grey[100], textColor: grey[800] },
};

// 🔹 Función para obtener información de estado
const getStateInfo = (estado) => {
  return stateMapping[estado] || stateMapping.default;
};

// 🔹 Función para obtener información de acción
const getActionInfo = (accion) => {
  return actionMapping[accion] || actionMapping.default;
};

// 🔹 Definición de las columnas del reporte
export const REPORTE_COLUMNS = () => [
  {
    field: "estado",
    headerName: "Estado",
    width: 250,
    renderCell: (params) => {
      const stateInfo = getStateInfo(params.row.estado);
      return (
        <Chip
          label={`${stateInfo.text}: ${params.row.total} - ${params.row.estadoPorcentaje}%`}
          sx={{
            backgroundColor: stateInfo.color,
            color: stateInfo.textColor,
            fontWeight: "medium",
          }}
        />
      );
    },
  },
  ,
  {
    field: "converge",
    headerName: "Cobertura (%)",
    width: 130,
    renderCell: (params) => `${params.value}%`,
  },
  {
    field: "recencia",
    headerName: "Recencia (días)",
    width: 130,
  },
  {
    field: "intensity",
    headerName: "Intensity",
    width: 130,
  },
  {
    field: "acciones",
    headerName: "Acciones",
    width: 350,
    renderCell: (params) => {
      // Asegurarse de que `params.row.acciones` no sea null o undefined
      const acciones = params.row.acciones || {}; // Asigna un objeto vacío si no existe
      return (
        <>
          {Object.entries(acciones).map(([accion, data]) => {
            const actionInfo = getActionInfo(accion);
            return (
              <Chip
                key={accion}
                label={`${actionInfo.text}: ${data.count} - ${data.percentage}%`}
                sx={{
                  backgroundColor: actionInfo.color,
                  color: actionInfo.textColor,
                  fontWeight: "normal",
                  m: 0.5,
                }}
              />
            );
          })}
        </>
      );
    },
  }
  ,
];


// Exportamos las funciones para usarlas en otros componentes si es necesario
export { getStateInfo, getActionInfo };
