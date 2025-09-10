// Carga inicial sin filtros (dedup por N_Doc)
import bq from '@/lib/bigquery';

export async function GET() {
  const project = 'peak-emitter-350713';
  const dataset = 'FR_Reingresos_output';

  const sql = `
    WITH base AS (
      SELECT Codigo_Asociado, N_Doc, Nombres, Apellido_Paterno, Telf_SMS, Segmento, E_mail, Zona
      FROM \`${project}.${dataset}.BD_SegmentacionFinal\`
    ),
    ases AS (
      SELECT Codigo_Asociado, Asesor
      FROM \`${project}.${dataset}.BD_AsignadaGeneralAgosto\`
    ),
    joined AS (
      SELECT b.*, a.Asesor
      FROM base b
      LEFT JOIN ases a USING (Codigo_Asociado)
    ),
    ranked AS (
      SELECT *,
             ROW_NUMBER() OVER (PARTITION BY N_Doc ORDER BY Codigo_Asociado) rn
      FROM joined
    )
    SELECT Codigo_Asociado, N_Doc, Nombres, Apellido_Paterno, Telf_SMS, Segmento, E_mail, Zona, Asesor
    FROM ranked
    WHERE rn = 1
    LIMIT 10000
  `;

  try {
    const [rows] = await bq.query({ query: sql });
    return Response.json({ rows });
  } catch (err) {
    console.error(err);
    return new Response('Error ejecutando consulta', { status: 500 });
  }
}
