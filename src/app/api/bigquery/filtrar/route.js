

// src/app/api/bigquery/filtrar/route.js
import bq from '@/lib/bigquery';

export async function POST(req) {
  try {
    const { filters } = await req.json();
    const project = 'peak-emitter-350713';
    const dataset = 'FR_Reingresos_output';

    const seg_array = filters?.find(f => f.type === 'segmento')?.value || [];
    const ase_array = filters?.find(f => f.type === 'asesor')?.value || [];

    // ======================================================
    // ✅ SOLUCIÓN: Construcción dinámica de la consulta
    // ======================================================

    const params = {}; // Parámetros que SÍ se enviarán
    let where_clauses = []; // Cláusulas WHERE que se construirán

    // --- Lógica para el filtro de Segmento ---
    if (seg_array.length > 0) {
      // Si hay filtros, añade la lógica UNNEST y el parámetro
      where_clauses.push(`(
        'Todos' IN UNNEST(@seg) OR
        b.Segmento IN UNNEST(@seg)
      )`);
      params.seg = seg_array;
    } else {
      // Si no hay filtros, la condición es siempre verdadera
      where_clauses.push('TRUE');
    }

    // --- Lógica para el filtro de Asesor ---
    if (ase_array.length > 0) {
      // Si hay filtros, añade la lógica UNNEST y el parámetro
      where_clauses.push(`(
        'Todos' IN UNNEST(@ase) OR
        b.Asesor IN UNNEST(@ase)
      )`);
      params.ase = ase_array;
    } else {
      // Si no hay filtros, la condición es siempre verdadera
      where_clauses.push('TRUE');
    }

    // --- Unir todas las cláusulas WHERE ---
    // (Incluimos la que ya tenías de f.Nombres IS NOT NULL)
    where_clauses.push('f.Nombres IS NOT NULL');
    const dynamic_where_sql = where_clauses.join(' AND ');

    // ======================================================
    // ✅ SQL con el WHERE dinámico
    // ======================================================
    const sql = `
      WITH base AS (
        SELECT bd_com.*
        FROM \`${project}.${dataset}.BD_ENVIOS_SAYA_20251103\` bd_com
        LEFT JOIN \`${project}.${dataset}.BD_ReingresosJunto\` bd_dia
          ON CAST(bd_com.ndoc AS STRING) = CAST(bd_dia.Documento AS STRING)
        WHERE bd_dia.Documento IS NULL
      ),
      fondos AS (
        SELECT CAST(Codigo_Asociado AS STRING) AS codigo_str, Producto, Nombres, Telf_SMS, E_mail
        FROM \`${project}.FR_general.bd_fondos\`
        WHERE Codigo_Asociado IS NOT NULL
      ),
      filtrado AS (
        SELECT b.*, f.Producto, f.Nombres AS nombres_fondos, f.Telf_SMS, f.E_mail
        FROM base b
        LEFT JOIN fondos f ON CAST(b.cod_asociado AS STRING) = f.codigo_str
        WHERE ${dynamic_where_sql} -- <-- Aquí se inserta la lógica
      ),
      ranked_data AS (
        SELECT cod_asociado,
               N_Doc,
               nombres_fondos AS Nombres,
               Telf_SMS,
               Segmento,
               E_mail,
               Zona,
               Asesor,
               Producto,
               ROW_NUMBER() OVER (PARTITION BY N_Doc ORDER BY cod_asociado) as rn
        FROM filtrado
      )
      SELECT cod_asociado AS Codigo_Asociado,
             N_Doc AS documento_identidad,
             COALESCE(Nombres, 'Maquisocio') AS nombre,
             Telf_SMS AS celular,
             Segmento,
             E_mail AS email,
             Zona,
             Asesor AS gestor,
             Producto
      FROM ranked_data
      WHERE rn = 1;
    `;

    console.log('=== DEBUG FILTRAR API ===');
    console.log('Parámetros SQL (dinámicos):', params);
    console.log('Cláusula WHERE generada:', dynamic_where_sql);

    const [rows] = await bq.query({
      query: sql,
      params: params,
      parameterMode: 'named',
      // No se necesita 'types' porque nunca enviamos arrays vacíos
    });

    console.log(`Total de registros obtenidos: ${rows.length}`);
    console.log('=== FIN DEBUG ===');

    return Response.json({ rows });
  } catch (err) {
    console.error('Error en /api/bigquery/filtrar:', err);
    return new Response('Error ejecutando consulta', { status: 500 });
  }
}