import React, { useEffect, useState } from "react";
import { Card, Typography, Table, TableHead, TableRow, TableCell, TableBody, Box } from "@mui/material";
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

import { fetchHistoricoEstados } from "../../../services/clientesService";

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

  // Preparar datos para el gráfico
  const chartData = {
    labels: historico.map(h => h.fecha_estado),
    datasets: [
      {
        label: "Estado",
        data: historico.map((h, i) => i + 1), // Solo para mostrar movimiento
        fill: false,
        borderColor: "#1976d2",
        tension: 0.1,
      },
    ],
  };

  return (
    <Card sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Historial de Estados del Cliente #{clienteId}
      </Typography>
      {loading ? (
        <Typography>Cargando...</Typography>
      ) : (
        <>
          <Box sx={{ maxWidth: 600, mx: "auto", mb: 3 }}>
            <Line data={chartData} options={{
              plugins: { legend: { display: false } },
              scales: {
                x: { title: { display: true, text: "Fecha" } },
                y: { title: { display: true, text: "Movimiento" }, ticks: { stepSize: 1 } },
              },
            }} />
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
              {historico.map((h, idx) => (
                <TableRow key={idx}>
                  <TableCell>{h.fecha_estado}</TableCell>
                  <TableCell>{h.estado}</TableCell>
                  <TableCell>{h.detalle}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </Card>
  );
}
