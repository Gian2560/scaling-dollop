import bq from '@/lib/bigquery';

// POST /api/bigquery/dashboard
export async function POST(req) {
  try {
    const { segmentacion, tiposClientes, table } = await req.json();

    const project = 'peak-emitter-350713';
    const datasetBase = 'FR_RetFid_output';
    const datasetFondos = 'FR_general';
    const fondosTable = 'bd_fondos';

    // Filtros sobre la tabla base
    let where = [];
    let params = {};

    if (segmentacion && segmentacion !== 'Todos') {
      where.push('base.segmentacion = @segmentacion');
      params.segmentacion = segmentacion;
    }
    if (tiposClientes && tiposClientes.length > 0) {
      where.push(`base.Cluster IN UNNEST(@tiposClientes)`);
      params.tiposClientes = tiposClientes;
    }
    const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';

    // KPIs agrupados por gestion
    const KPI_QUERY = `
      WITH joined AS (
        SELECT
          base.Codigo_Asociado,
          base.gestion,
          fondos.C_Adm,
          fondos.C_Cap,
          fondos.Fec_Venc_Cuota,
          fondos.Pag_Cap,
          fondos.Fec_Ult_Pag_CCAP
        FROM \`${project}.${datasetBase}.${table}\` AS base
        LEFT JOIN \`${project}.${datasetFondos}.${fondosTable}\` AS fondos
          ON base.Codigo_Asociado = fondos.Codigo_Asociado
        ${whereSQL}
      )
      SELECT
        gestion,
        COUNT(DISTINCT Codigo_Asociado) AS total_contratos,
        SUM(IFNULL(C_Adm,0) + IFNULL(C_Cap,0)) AS monto_total_recaudar,
        SUM(CASE
          WHEN EXTRACT(DAY FROM DATE(Fec_Ult_Pag_CCAP)) BETWEEN 1 AND 21
            AND EXTRACT(MONTH FROM DATE(Fec_Ult_Pag_CCAP)) = EXTRACT(MONTH FROM CURRENT_DATE())
            AND EXTRACT(YEAR FROM DATE(Fec_Ult_Pag_CCAP)) = EXTRACT(YEAR FROM CURRENT_DATE())
          THEN IFNULL(C_Adm,0) + IFNULL(C_Cap,0)
          ELSE 0
        END) AS monto_recaudado
      FROM joined
      GROUP BY gestion
    `;
    const [kpiRows] = await bq.query({
      query: KPI_QUERY,
      params,
      parameterMode: 'named',
    });

    // Chart data: suma por día y gestion
    const CHART_QUERY = `
      WITH joined AS (
        SELECT
          base.Codigo_Asociado,
          base.gestion,
          fondos.C_Adm,
          fondos.C_Cap,
          fondos.Fec_Ult_Pag_CCAP
        FROM \`${project}.${datasetBase}.${table}\` AS base
        LEFT JOIN \`${project}.${datasetFondos}.${fondosTable}\` AS fondos
          ON base.Codigo_Asociado = fondos.Codigo_Asociado
        ${whereSQL}
      )
      SELECT
        gestion,
        FORMAT_DATE('%Y-%m-%d', DATE(Fec_Ult_Pag_CCAP)) AS dia,
        SUM(IFNULL(C_Adm,0) + IFNULL(C_Cap,0)) AS monto
      FROM joined
      WHERE Fec_Ult_Pag_CCAP IS NOT NULL
        AND EXTRACT(DAY FROM DATE(Fec_Ult_Pag_CCAP)) BETWEEN 1 AND 21
        AND EXTRACT(MONTH FROM DATE(Fec_Ult_Pag_CCAP)) = EXTRACT(MONTH FROM CURRENT_DATE())
        AND EXTRACT(YEAR FROM DATE(Fec_Ult_Pag_CCAP)) = EXTRACT(YEAR FROM CURRENT_DATE())
      GROUP BY gestion, dia
      ORDER BY dia, gestion
    `;
    const [chartRows] = await bq.query({
      query: CHART_QUERY,
      params,
      parameterMode: 'named',
    });

    // Formatear chartData acumulado por día (porcentaje de recaudación)
    // 1. Mapear montos diarios por gestión
    const chartDataMap = {};
    chartRows.forEach(r => {
      if (!chartDataMap[r.dia]) chartDataMap[r.dia] = {};
      chartDataMap[r.dia][r.gestion] = Number(r.monto);
    });

    // 2. Obtener monto_total_recaudar por gestión
    let montoTotalConvencional = 0;
    let montoTotalRetadora = 0;
    kpiRows.forEach(row => {
      if (row.gestion === 'convencional') montoTotalConvencional = Number(row.monto_total_recaudar);
      if (row.gestion === 'retadora') montoTotalRetadora = Number(row.monto_total_recaudar);
    });

    // 3. Generar días del 1 al 21
    let year = new Date().getFullYear();
    let month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    if (chartRows.length > 0) {
      const [y, m] = chartRows[0].dia.split('-');
      year = y;
      month = m;
    }
    const dias = [];
    for (let d = 1; d <= 21; d++) {
      const dia = `${year}-${month}-${d.toString().padStart(2, '0')}`;
      dias.push(dia);
    }

    // 4. Calcular acumulado y porcentaje por día
    let acumuladoConv = 0;
    let acumuladoRet = 0;
    const chartData = dias.map(dia => {
      const montoConv = chartDataMap[dia]?.convencional || 0;
      const montoRet = chartDataMap[dia]?.retadora || 0;
      acumuladoConv += montoConv;
      acumuladoRet += montoRet;
      return {
        fecha: dia,
        convencional: montoTotalConvencional > 0 ? Number(((acumuladoConv / montoTotalConvencional) * 100).toFixed(2)) : 0,
        retadora: montoTotalRetadora > 0 ? Number(((acumuladoRet / montoTotalRetadora) * 100).toFixed(2)) : 0
      };
    });

    // KPIs por gestion
    const kpisConvencional = [];
    const kpisRetadora = [];
    kpiRows.forEach(row => {
      const recaudacion = row.monto_total_recaudar > 0
        ? ((row.monto_recaudado / row.monto_total_recaudar) * 100).toFixed(2) + '%'
        : '0%';
      const arr = [
        ['Total de contratos', row.total_contratos],
        ['Monto total a recaudar', `${(row.monto_total_recaudar / 1000).toFixed(2)} mil`],
        ['Monto recaudado (1-21)', `${(row.monto_recaudado / 1000).toFixed(2)} mil`],
        ['Recaudación (%)', recaudacion],
      ];
      if (row.gestion === 'convencional') kpisConvencional.push(...arr);
      if (row.gestion === 'retadora') kpisRetadora.push(...arr);
    });
    return Response.json({
      kpisConvencional,
      kpisRetadora,
      chartData,
    });
  } catch (err) {
    console.error('Error en /api/bigquery/dashboard:', err);
    return new Response('Error ejecutando consulta', { status: 500 });
  }
}
