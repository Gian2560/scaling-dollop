
// src/app/api/bigquery/filtrar/route.js
import bq from '@/lib/bigquery';

export async function POST(req) {
  try {
    const { filters } = await req.json();
    const project = 'peak-emitter-350713';
    const dataset = 'FR_Reingresos_output';


    // Permitir arrays para filtros múltiples
  // Asegura que los filtros sean arrays planos (no arrays de arrays)
  let segmentos = filters?.filter(f => f.type === 'segmento').map(f => f.value).flat().filter(Boolean) || [];//nuevo
  let asesores = filters?.filter(f => f.type === 'asesor').map(f => f.value).flat().filter(Boolean) || [];//nuevo

    const sql = `
      WITH base AS (
        SELECT bd_com.*
        FROM \`${project}.${dataset}.BD_Conglomerado_con_clusters\` bd_com
        LEFT JOIN \`${project}.${dataset}.BD_ReingresosDiarios\` bd_dia
          ON bd_com.N_Doc = bd_dia.Documento
        WHERE bd_dia.Documento IS NULL
      ),
      fondos AS (
        SELECT Codigo_Asociado, Producto
        FROM \`peak-emitter-350713.FR_general.bd_fondos\`
      ),
      filtrado AS (
        SELECT b.*, f.Producto
        FROM base b
        LEFT JOIN fondos f ON b.CodigoAsociado = f.Codigo_Asociado
        WHERE (--nuevo
          ARRAY_LENGTH(@segmentos) = 0 OR Segmento IN UNNEST(@segmentos)
        )
        AND (
          ARRAY_LENGTH(@asesores) = 0 OR Asesor IN UNNEST(@asesores)
        )
        AND NombresAsociado IS NOT NULL --termina nuevo
      ),
      ranked_data AS (
        SELECT CodigoAsociado,
               N_Doc,
               NombresAsociado,
               TelfSMS,
               Segmento,
               Email,
               Zona,
               Asesor,
               Producto,
               ROW_NUMBER() OVER (PARTITION BY N_Doc ORDER BY CodigoAsociado) as rn
        FROM filtrado
      )
      SELECT CodigoAsociado AS Codigo_Asociado,
             N_Doc AS documento_identidad,
             COALESCE(NombresAsociado, 'Maquisocio') AS nombre,
             TelfSMS AS celular,
             Segmento,
             Email AS email,
             Zona,
             Asesor AS gestor,
             Producto
      FROM ranked_data
      WHERE rn = 1;
    `;

    const params = { segmentos, asesores };//nuevo

  console.log('=== DEBUG FILTRAR API ===');
  console.log('Filtros recibidos:', { segmentos, asesores });
    console.log('Parámetros SQL:', params);
    console.log('Consulta SQL:', sql);

    const [rows] = await bq.query({
      query: sql,
      params,
      parameterMode: 'named',
    });

    console.log(`Total de registros obtenidos: ${rows.length}`);
    console.log('Primeros 5 resultados:', rows.slice(0, 5));
    console.log('=== FIN DEBUG ===');

    return Response.json({ rows });
  } catch (err) {
    console.error('Error en /api/bigquery/filtrar:', err);
    return new Response('Error ejecutando consulta', { status: 500 });
  }
}
