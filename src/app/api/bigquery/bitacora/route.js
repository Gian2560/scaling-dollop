import { NextResponse } from 'next/server';
import bq from '@/lib/bigquery';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const documento = searchParams.get('documento');

    if (!documento) {
      return NextResponse.json({
        success: false,
        error: 'Número de documento es requerido',
        data: []
      }, { status: 400 });
    }

    console.log('🔍 Buscando bitácora para documento:', documento);

    // Limpiar documento (quitar comas y espacios al final y al principio)
    const documentoLimpio = documento.replace(/,+$/, '').replace(/^,+/, '').replace(/\s+/g, '').trim();

    console.log('📄 Documento original:', documento);
    console.log('📄 Documento limpio:', documentoLimpio);

    // Preparar variantes del documento para la búsqueda
    const documentoVariantes = [
      documentoLimpio,
      `${documentoLimpio},`,  // Con coma al final
      ` ${documentoLimpio}`,  // Con espacio al principio
      `${documentoLimpio} `,  // Con espacio al final
      ` ${documentoLimpio},`, // Con espacio y coma
      `${documentoLimpio}, `, // Con coma y espacio
    ];

    const query = `
      SELECT 
        De as asesor,
        Para as para_quien,
        Cliente as nombre_cliente,
        N_Doc as numero_documento,
        Fecha as fecha_llamada,
        A__o as ano,
        mes as mes,
        Campa__a as campana,
        Categoria_1 as categoria_1,
        Categoria_2 as categoria_2,
        Categoria_3 as categoria_3
      FROM \`peak-emitter-350713.FR_Reingresos_output.BD_BitacorasAcumuladasSAYA\`
      WHERE (
        CAST(N_Doc AS STRING) = @documento 
        OR TRIM(CAST(N_Doc AS STRING), ' ,') = @documentoLimpio
        OR CAST(N_Doc AS STRING) = CONCAT(@documentoLimpio, ',')
        OR TRIM(CAST(N_Doc AS STRING)) = @documentoLimpio
      )
      ORDER BY Fecha DESC
      LIMIT 100
    `;

    console.log('Ejecutando query de bitácora:', query);
    console.log('Parámetros:', {
      documento: documento,
      documentoLimpio: documentoLimpio
    });

    const [rows] = await bq.query({
      query: query,
      params: { 
        documento: documento,
        documentoLimpio: documentoLimpio
      },
      parameterMode: 'named'
    });

    console.log(`✅ Bitácora encontrada: ${rows.length} registros`);

    // Procesar datos
    const bitacoraData = rows.map((row, index) => ({
      id: `bitacora_${documentoLimpio}_${index}`,
      asesor: row.asesor || 'No especificado',
      para_quien: row.para_quien || 'No especificado',
      nombre_cliente: row.nombre_cliente || 'No especificado',
      numero_documento: row.numero_documento || '',
      fecha_llamada: row.fecha_llamada || null,
      año: row.ano || null,
      mes: row.mes || 'No especificado',
      campaña: row.campana || 'No especificado',
      categoria_1: row.categoria_1 || 'Sin categoría',
      categoria_2: row.categoria_2 || 'Sin categoría',
      categoria_3: row.categoria_3 || 'Sin categoría'
    }));

    return NextResponse.json({
      success: true,
      data: bitacoraData,
      total: bitacoraData.length,
      documento: documentoLimpio,
      documentoOriginal: documento,
      message: `Se encontraron ${bitacoraData.length} registros de bitácora`
    });

  } catch (error) {
    console.error('Error en bitácora API:', error);
    return NextResponse.json({
      success: false,
      error: `Error al obtener bitácora: ${error.message}`,
      data: []
    }, { status: 500 });
  }
}