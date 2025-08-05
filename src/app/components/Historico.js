import React, { useEffect, useState } from "react";
import { Card, Typography, Table, TableHead, TableRow, TableCell, TableBody, Box, Chip, Stack } from "@mui/material";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import CancelIcon from '@mui/icons-material/Cancel';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

import { fetchHistoricoEstados } from "../../../services/clientesService";

// Función para formatear fecha
function formatFecha(fecha) {
  if (!fecha) return "";
  const d = new Date(fecha);
  return d.toLocaleDateString("es-PE", { year: "numeric", month: "short", day: "numeric" }) +
    " " + d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
}

// Prioridad y estilos por estado
const estadoPrioridad = {
  "PROMESA DE PAGO": { prioridad: 3, icon: <CheckCircleIcon sx={{ color: '#2E7D32' }} />, label: "Muy bueno" },
  "FINALIZADO": { prioridad: 3, icon: <CheckCircleIcon sx={{ color: '#5E35B1' }} />, label: "Muy bueno" },
  "INTERESADO": { prioridad: 2, icon: <CheckCircleIcon sx={{ color: '#8C6E11' }} />, label: "Bueno" },
  "EN SEGUIMIENTO": { prioridad: 1, icon: <RemoveCircleIcon sx={{ color: '#1565C0' }} />, label: "Neutro" },
  "PENDIENTE": { prioridad: 1, icon: <RemoveCircleIcon sx={{ color: '#F57C00' }} />, label: "Neutro" },
  "EN PROCESO": { prioridad: 1, icon: <RemoveCircleIcon sx={{ color: '#0288D1' }} />, label: "Neutro" },
  "NO INTERESADO": { prioridad: 0, icon: <CancelIcon sx={{ color: '#B71C1C' }} />, label: "Negativo" },
};

const getEstadoStyle = (estado) => {
  const styles = {
    "EN SEGUIMIENTO": { color: "#1565C0", backgroundColor: "#BBDEFB", fontWeight: "bold" },
    "INTERESADO": { color: "#8C6E11", backgroundColor: "#FFECB3", fontWeight: "bold" },
    "NO INTERESADO": { color: "#B71C1C", backgroundColor: "#FFCDD2", fontWeight: "bold" },
    "PROMESA DE PAGO": { color: "#2E7D32", backgroundColor: "#C8E6C9", fontWeight: "bold" },
    "FINALIZADO": { color: "#5E35B1", backgroundColor: "#D1C4E9", fontWeight: "bold" },
    "PENDIENTE": { color: "#F57C00", backgroundColor: "#FFE0B2", fontWeight: "bold" },
    "EN PROCESO": { color: "#0288D1", backgroundColor: "#B3E5FC", fontWeight: "bold" },
  };
  return styles[estado?.toUpperCase()] || { color: "#616161", backgroundColor: "#E0E0E0", fontWeight: "bold" };
};

export default function Historico({ clienteId }) {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchHistoricoEstados(clienteId);
      setHistorico(data);
      setLoading(false);
    }
    if (clienteId) load();
  }, [clienteId]);

  // Secuencia de estados para el gráfico
  const estados = historico.map(h => h.estado);
  const fechas = historico.map(h => formatFecha(h.fecha_estado));
  const colores = historico.map(h => getEstadoStyle(h.estado).backgroundColor);
  const prioridades = historico.map(h => estadoPrioridad[h.estado?.toUpperCase()]?.prioridad ?? 1);

  // Ordenar los estados únicos por prioridad (mayor arriba)
  const estadoUnicos = Array.from(new Set(estados));
  const estadoUnicosOrdenados = estadoUnicos.sort((a, b) => {
    const pa = estadoPrioridad[a?.toUpperCase()]?.prioridad ?? 1;
    const pb = estadoPrioridad[b?.toUpperCase()]?.prioridad ?? 1;
    return pb - pa;
  });
  const estadoToY = estadoUnicosOrdenados.reduce((acc, est, idx) => { acc[est] = idx + 1; return acc; }, {});
  const yValues = estados.map(est => estadoToY[est]);

  const lineData = {
    labels: fechas,
    datasets: [
      {
        label: "Cambio de Estado",
        data: yValues,
        pointBackgroundColor: colores,
        pointRadius: 12,
        pointHoverRadius: 16,
        borderColor: "#1976d2",
        backgroundColor: "rgba(25, 118, 210, 0.1)",
        tension: 0.3,
        fill: false,
        showLine: true,
      },
    ],
  };

  const lineOptions = {
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (ctx) => ctx[0].label,
          label: (ctx) => {
            const idx = ctx.dataIndex;
            const h = historico[idx];
            const prioridad = estadoPrioridad[h.estado?.toUpperCase()]?.label || "";
            return `${h.estado} (${prioridad}): ${h.detalle || ""}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Fecha" },
        ticks: { color: "#616161" },
        grid: { color: "#E0E0E0" },
      },
      y: {
        title: { display: true, text: "Estado" },
        ticks: {
          stepSize: 1,
          color: "#616161",
          callback: function(value) {
            // Mostrar el nombre del estado en el eje Y, ordenado por prioridad
            return estadoUnicosOrdenados[value - 1] || "";
          },
        },
        grid: { color: "#E0E0E0" },
        min: 1,
        max: estadoUnicosOrdenados.length,
        reverse: true, // Invertir el eje Y para que los positivos estén arriba
      },
    },
  };

  // Leyenda visual de prioridad
  const leyenda = [
    { estado: "PROMESA DE PAGO", ...estadoPrioridad["PROMESA DE PAGO"] },
    { estado: "FINALIZADO", ...estadoPrioridad["FINALIZADO"] },
    { estado: "INTERESADO", ...estadoPrioridad["INTERESADO"] },
    { estado: "EN SEGUIMIENTO", ...estadoPrioridad["EN SEGUIMIENTO"] },
    { estado: "NO INTERESADO", ...estadoPrioridad["NO INTERESADO"] },
  ];

  return (
    <Card sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Historial de Estados del Cliente #{clienteId}
      </Typography>
      {loading ? (
        <Typography>Cargando...</Typography>
      ) : (
        <>
          <Box sx={{ maxWidth: 700, mx: "auto", mb: 3 }}>
            <Line data={lineData} options={lineOptions} />
            <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: "center" }}>
              {leyenda.map((item, idx) => (
                <Chip
                  key={item.estado}
                  icon={item.icon}
                  label={item.estado + " - " + item.label}
                  sx={{
                    color: getEstadoStyle(item.estado).color,
                    backgroundColor: getEstadoStyle(item.estado).backgroundColor,
                    fontWeight: "bold",
                    px: 1.5,
                  }}
                />
              ))}
            </Stack>
          </Box>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Detalle</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historico.map((h, idx) => {
                const style = getEstadoStyle(h.estado);
                const prioridad = estadoPrioridad[h.estado?.toUpperCase()]?.label || "";
                const icon = estadoPrioridad[h.estado?.toUpperCase()]?.icon || null;
                return (
                  <TableRow key={idx}>
                    <TableCell>{formatFecha(h.fecha_estado)}</TableCell>
                    <TableCell>
                      <Chip
                        icon={icon}
                        label={h.estado + (prioridad ? ` - ${prioridad}` : "")}
                        sx={{
                          color: style.color,
                          backgroundColor: style.backgroundColor,
                          fontWeight: style.fontWeight,
                          borderRadius: 1,
                          px: 1.5,
                        }}
                      />
                    </TableCell>
                    <TableCell>{h.detalle}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </>
      )}
    </Card>
  );
}
