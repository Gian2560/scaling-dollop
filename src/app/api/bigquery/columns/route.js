// app/api/bigquery/columns/route.js

import bigquery from '@/lib/bigquery';

export async function GET(req) {
  try {
    // Obtener los parámetros de la URL (projectId, datasetId y tableName)
    const url = new URL(req.url);
    const projectId = 'peak-emitter-350713'; // Project ID fijo
    const datasetId = 'FR_RetFid_output';  // Dataset ID fijo
    const tableName = url.searchParams.get('database');  // Obtenemos el nombre de la tabla desde los parámetros

    if (!tableName) {
      return new Response(
        JSON.stringify({
          message: '❌ Faltó el nombre de la tabla (tableName)',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Obtener las tablas disponibles en el dataset para debuggear
    const [tables] = await bigquery.dataset(datasetId).getTables();
    const tableNames = tables.map((table) => table.id);  // Obtener los nombres de las tablas
    console.log(`📊 Dataset: ${datasetId}`);
    console.log(`🔍 Tablas disponibles en el dataset "${datasetId}":`, tableNames);

    // Verificar si la tabla seleccionada existe
    if (!tableNames.includes(tableName)) {
      return new Response(
        JSON.stringify({
          message: `❌ La tabla "${tableName}" no existe en el dataset "${datasetId}"`,
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Obtener las columnas de la tabla seleccionada
    const [table] = await bigquery.dataset(datasetId).table(tableName).getMetadata();
    console.log(`🔍 Obteniendo columnas de la tabla "${tableName}"...`);

    // Verificamos si la propiedad `schema` existe y contiene `fields`
    if (!table || !table.schema || !Array.isArray(table.schema.fields)) {
      return new Response(
        JSON.stringify({
          message: `❌ No se pudo obtener el esquema de la tabla "${tableName}". La propiedad 'schema.fields' no está definida.`,
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Ahora accedemos a `table.schema.fields`, que es un arreglo con la información de las columnas
    const columnAttributes = table.schema.fields.map((field) => ({
      name: field.name,   // Nombre de la columna
      type: field.type,   // Tipo de la columna (STRING, INTEGER, etc.)
      mode: field.mode,   // Modo de la columna (NULLABLE, REQUIRED, REPEATED)
    }));

    console.log(`🔍 Atributos de la tabla "${tableName}":`, columnAttributes);

    return new Response(
      JSON.stringify({
        message: '✅ Atributos obtenidos correctamente',
        columns: columnAttributes,  // Retornamos los atributos de las columnas
        availableTables: tableNames,  // Retornamos las tablas disponibles para debuggear
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('❌ Error al obtener las columnas:', error.message);

    return new Response(
      JSON.stringify({
        message: '❌ Error al obtener las columnas',
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
