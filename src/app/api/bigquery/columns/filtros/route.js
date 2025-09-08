// app/api/bigquery/filtro/route.js

  import bigquery from '@/lib/bigquery';

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const projectId = 'peak-emitter-350713'; // Project ID fijo
    const datasetId = 'FR_RetFid_output'; // Dataset ID fijo
    const tableName = url.searchParams.get('database'); // Tabla seleccionada
    const segmentColumn = url.searchParams.get('segmentColumn'); // Columna Segmento
    const clusterColumn = url.searchParams.get('clusterColumn'); // Columna Cluster
    const estrategiaColumn = url.searchParams.get('estrategiaColumn'); // Columna Estrategia
    const fechaCuotaColumn = url.searchParams.get('fechaCuotaColumn'); // Columna Fecha Cuota
    const lineaColumn =   url.searchParams.get('lineaColumn');
    if (!tableName || !segmentColumn || !clusterColumn || !estrategiaColumn || !fechaCuotaColumn) {
      return new Response(
        JSON.stringify({
          message: '❌ Faltaron parámetros de tabla o columnas',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Consultas para obtener los valores únicos de cada columna
    const querySegmento = `
      SELECT DISTINCT \`${segmentColumn}\`
      FROM \`${projectId}.${datasetId}.${tableName}\`
    `;
    const queryCluster = `
      SELECT DISTINCT \`${clusterColumn}\`
      FROM \`${projectId}.${datasetId}.${tableName}\`
    `;
    const queryEstrategia = `
      SELECT DISTINCT \`${estrategiaColumn}\`
      FROM \`${projectId}.${datasetId}.${tableName}\`
    `;

    const queryFechaCuota = `
      SELECT DISTINCT \`${fechaCuotaColumn}\`
      FROM \`peak-emitter-350713.FR_general.envios_cobranzas_m0\`
    `;

    const queryTipo = `
      SELECT DISTINCT \`${lineaColumn}\`
      FROM \`peak-emitter-350713.FR_general.bd_fondos\`
    `;

    // Ejecutar las tres consultas SQL
    const [rowsSegmento] = await bigquery.query({ query: querySegmento });
    const [rowsCluster] = await bigquery.query({ query: queryCluster });
    const [rowsEstrategia] = await bigquery.query({ query: queryEstrategia });
    const [rowsFechaCuota] = await bigquery.query({ query: queryFechaCuota });
    const [rowLinea] = await bigquery.query({ query: queryTipo });
    // Obtener los valores únicos de cada columna
    const uniqueSegmentos = rowsSegmento.map((row) => row[segmentColumn]);
    const uniqueClusters = rowsCluster.map((row) => row[clusterColumn]);
    const uniqueEstrategias = rowsEstrategia.map((row) => row[estrategiaColumn]);
    const uniqueFechasCuota = rowsFechaCuota.map((row) => row[fechaCuotaColumn]);
    const uniqueLinea = rowLinea.map((row)=> row[lineaColumn]);

    return new Response(
      JSON.stringify({
        message: '✅ Valores obtenidos correctamente',
        segmentos: uniqueSegmentos,
        clusters: uniqueClusters,
        estrategias: uniqueEstrategias,
        fechaCuotaColumn: uniqueFechasCuota,
        lineas: uniqueLinea
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('❌ Error al obtener los valores únicos:', error.message);

    return new Response(
      JSON.stringify({
        message: '❌ Error al obtener los valores únicos',
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
