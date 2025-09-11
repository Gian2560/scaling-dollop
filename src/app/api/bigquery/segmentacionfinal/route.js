// Carga inicial sin filtros (dedup por N_Doc)
import bq from '@/lib/bigquery';

export async function GET() {
  const project = 'peak-emitter-350713';
  const dataset = 'FR_Reingresos_output';

  const sql = `
    WITH ranked_data AS (
      SELECT bd_com.*,
             ROW_NUMBER() OVER (PARTITION BY bd_com.N_Doc ORDER BY bd_com.N_Doc) as rn
      FROM \`${project}.${dataset}.BD_Conglomerado_con_clusters\` bd_com
      LEFT JOIN \`${project}.${dataset}.BD_ReingresosDiarios\` bd_dia
        ON bd_com.N_Doc = bd_dia.Documento
      WHERE bd_dia.Documento IS NULL
    )
    SELECT * EXCEPT(rn)
    FROM ranked_data
    WHERE rn = 1;
  `;

  try {
    const [rows] = await bq.query({ query: sql });
    return Response.json({ rows });
  } catch (err) {
    console.error(err);
    return new Response('Error ejecutando consulta', { status: 500 });
  }
}
