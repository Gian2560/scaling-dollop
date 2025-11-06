import { useState, useCallback } from 'react';

export function useBotInteractions() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [stats, setStats] = useState({
    totalRegistros: 0,
    documentosUnicos: 0,
    codigosUnicos: 0
  });

  const fetchBotInteractions = useCallback(async (filters) => {
    setLoading(true);
    setError(null);
    
    try {
      // Construir query params
      const queryParams = new URLSearchParams();
      
      if (filters.fechaInicio) {
        queryParams.append('fechaInicio', filters.fechaInicio);
      }
      if (filters.fechaFin) {
        queryParams.append('fechaFin', filters.fechaFin);
      }
      if (filters.estados && filters.estados.length > 0) {
        filters.estados.forEach(estado => {
          queryParams.append('estados', estado);
        });
      }

      const response = await fetch(`/api/bigquery/bot-interactions?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setTotalRecords(result.data.length);
        
        // Usar estadísticas del backend
        if (result.stats) {
          setStats(result.stats);
        }
      } else {
        throw new Error(result.error || 'Error desconocido al obtener los datos');
      }
    } catch (err) {
      console.error('Error fetching bot interactions:', err);
      setError(err.message);
      setData([]);
      setTotalRecords(0);
      setStats({
        totalRegistros: 0,
        documentosUnicos: 0,
        codigosUnicos: 0
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const exportToCSV = useCallback(() => {
    if (data.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    try {
      // Definir headers simplificados
      const headers = [
        'Documento',
        'Nombre Completo',
        'Código Asociado',
        'Fecha de Operación'
      ];

      // Convertir datos a CSV, asegurando que las fechas sean strings
      const csvData = data.map(row => [
        row.documento_identidad || '',
        row.nombre_completo || '',
        row.codigo_asociado || '',
        row.fecha_operacion ? String(row.fecha_operacion) : ''
      ]);

      // Crear contenido CSV
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => 
          row.map(field => {
            // Convertir a string y escapar comillas
            const fieldStr = String(field || '');
            return fieldStr.includes(',') || fieldStr.includes('"') || fieldStr.includes('\n')
              ? `"${fieldStr.replace(/"/g, '""')}"` 
              : fieldStr;
          }).join(',')
        )
      ].join('\n');

      // Agregar BOM para UTF-8 para mejor compatibilidad con Excel
      const BOM = '\uFEFF';
      const fullContent = BOM + csvContent;

      // Descargar archivo
      const blob = new Blob([fullContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `bot_interactions_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exportando CSV:', err);
      alert('Error al exportar los datos');
    }
  }, [data]);

  const refreshData = useCallback((filters) => {
    fetchBotInteractions(filters);
  }, [fetchBotInteractions]);

  return {
    data,
    loading,
    error,
    totalRecords,
    stats,
    fetchBotInteractions,
    exportToCSV,
    refreshData
  };
}