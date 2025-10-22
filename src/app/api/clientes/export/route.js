import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Exportar todos los clientes a CSV
export async function GET(request) {
  try {
    console.log('🚀 Iniciando exportación de clientes a CSV');

    // Obtener todos los clientes con información relacionada
    const clientes = await prisma.cliente.findMany({
      select: {
        cliente_id: true,
        documento_identidad: true,
        tipo_documento: true,
        nombre: true,
        apellido: true,
        celular: true,
        email: true,
        fecha_creacion: true,
        fecha_ultima_interaccion: true,
        estado: true,
        motivo: true,
        categoria_no_interes: true,
        detalle_no_interes: true,
        observacion: true,
        gestor: true,
        accion: true,
        score: true,
        fecha_ultimo_estado: true,
        Segmento: true,
        Codigo_Asociado: true,
        Zona: true,
        Cluster: true,
        Producto: true,
        // Incluir información de la última acción comercial
        accion_comercial: {
          select: {
            fecha_accion: true,
            estado: true,
            nota: true,
            gestor: true
          },
          orderBy: {
            fecha_accion: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        fecha_creacion: 'desc'
      }
    });

    console.log(`✅ Obtenidos ${clientes.length} clientes para exportar`);

    // Definir las columnas del CSV
    const headers = [
      'ID',
      'Documento',
      'Tipo Documento',
      'Nombre',
      'Apellido',
      'Celular',
      'Email',
      'Estado',
      'Motivo',
      'Score',
      'Gestor',
      'Acción',
      'Observaciones',
      'Segmento',
      'Código Asociado',
      'Zona',
      'Cluster',
      'Producto',
      'Categoría No Interés',
      'Detalle No Interés',
      'Fecha Creación',
      'Fecha Última Interacción',
      'Fecha Último Estado',
      'Última Acción - Fecha',
      'Última Acción - Estado',
      'Última Acción - Nota',
      'Última Acción - Gestor'
    ];

    // Función para escapar comillas en CSV
    const escapeCSV = (value) => {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    // Función para formatear fechas
    const formatDate = (date) => {
      if (!date) return '';
      return new Date(date).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Construir el contenido CSV
    let csvContent = headers.join(',') + '\n';

    clientes.forEach(cliente => {
      const ultimaAccion = cliente.accion_comercial?.[0] || {};
      
      const row = [
        escapeCSV(cliente.cliente_id),
        escapeCSV(cliente.documento_identidad),
        escapeCSV(cliente.tipo_documento),
        escapeCSV(cliente.nombre),
        escapeCSV(cliente.apellido),
        escapeCSV(cliente.celular),
        escapeCSV(cliente.email),
        escapeCSV(cliente.estado),
        escapeCSV(cliente.motivo),
        escapeCSV(cliente.score),
        escapeCSV(cliente.gestor),
        escapeCSV(cliente.accion),
        escapeCSV(cliente.observacion),
        escapeCSV(cliente.Segmento),
        escapeCSV(cliente.Codigo_Asociado),
        escapeCSV(cliente.Zona),
        escapeCSV(cliente.Cluster),
        escapeCSV(cliente.Producto),
        escapeCSV(cliente.categoria_no_interes),
        escapeCSV(cliente.detalle_no_interes),
        escapeCSV(formatDate(cliente.fecha_creacion)),
        escapeCSV(formatDate(cliente.fecha_ultima_interaccion)),
        escapeCSV(formatDate(cliente.fecha_ultimo_estado)),
        escapeCSV(formatDate(ultimaAccion.fecha_accion)),
        escapeCSV(ultimaAccion.estado),
        escapeCSV(ultimaAccion.nota),
        escapeCSV(ultimaAccion.gestor)
      ];

      csvContent += row.join(',') + '\n';
    });

    // Generar nombre de archivo con fecha actual
    const now = new Date();
    const fileName = `clientes_export_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}.csv`;

    console.log(`📤 Generando archivo CSV: ${fileName}`);

    // Configurar headers para descarga
    const response = new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache'
      }
    });

    console.log(`✅ CSV generado exitosamente con ${clientes.length} registros`);

    return response;

  } catch (error) {
    console.error('❌ Error en GET /api/clientes/export:', error?.message || error);
    console.error('Stack trace:', error?.stack);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: error?.message || 'Error desconocido'
      }, 
      { status: 500 }
    );
  }
}