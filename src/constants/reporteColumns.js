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

// 🔹 Mapeo de acciones con colores (modificado según las acciones que mencionaste)
const actionMapping = {
  "No interesado": { text: "No Interesado", color: red[100], textColor: red[800] },
  "Volver a contactar": { text: "Volver a Contactar", color: blue[300], textColor: blue[900] },
  "Promesa de Pago": { text: "Promesa de Pago", color: orange[100], textColor: orange[800] },
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
    field: "accion",
    headerName: "Acciones",
    width: 350,
    renderCell: (params) => {
      const acciones = params.row.accion || {}; // Asegura que no sea null ni undefined
      return (
        <>
          {/* Recorremos cada acción en el objeto */}
          {Object.entries(acciones).map(([accion, count]) => {
            // Limpiamos el nombre de la acción, eliminando "Cambio de acción a: "
            const cleanedAccion = accion.replace("Cambio de acción a: ", "");
            const actionInfo = getActionInfo(cleanedAccion);
            
            return (
              <Chip
                key={accion}
                label={`${actionInfo.text}: ${count} - ${(count / params.row.total * 100).toFixed(2)}%`}
                sx={{
                  backgroundColor: actionInfo.color,
                  color: actionInfo.textColor,
                  fontWeight: "normal",
                  m: 0.5,
                  display: "flex", // Asegura que cada chip se muestre en una nueva línea
                }}
              />
            );
          })}
        </>
      );
    },
  }
  
];

