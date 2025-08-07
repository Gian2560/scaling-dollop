import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Función para obtener el estado del mensaje desde Twilio
async function getTwilioMessageStatus(messageSid) {
  try {
    const accountSid = process.env.TWILIO_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    console.log('Verificando credenciales Twilio:', {
      accountSid: accountSid ? `${accountSid.substring(0, 8)}...` : 'NO CONFIGURADO',
      authToken: authToken ? `${authToken.substring(0, 8)}...` : 'NO CONFIGURADO'
    });
    
    if (!accountSid || !authToken) {
      console.error('Credenciales de Twilio no configuradas');
      console.error('TWILIO_SID:', accountSid ? 'Configurado' : 'NO configurado');
      console.error('TWILIO_AUTH_TOKEN:', authToken ? 'Configurado' : 'NO configurado');
      return null;
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages/${messageSid}.json`;
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      console.error(`Error al consultar Twilio para ${messageSid}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.status;
  } catch (error) {
    console.error(`Error al obtener estado de mensaje ${messageSid}:`, error);
    return null;
  }
}

// Función para mapear estados de Twilio a nuestro enum
function mapTwilioStatusToEnum(twilioStatus) {
  const statusMap = {
    'queued': 'queued',
    'sending': 'sending', 
    'sent': 'sent',
    'delivered': 'delivered',
    'undelivered': 'undelivered',
    'failed': 'failed',
    'read': 'delivered', // Twilio no tiene 'read', usamos 'delivered'
  };
  
  return statusMap[twilioStatus] || 'failed';
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { campaignId } = body;

    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID es requerido' }, { status: 400 });
    }

    // Obtener todos los registros de cliente_campanha con message_sid para esta campaña
    const clienteCampanhas = await prisma.cliente_campanha.findMany({
      where: {
        campanha_id: parseInt(campaignId),
        message_sid: {
          not: null,
        },
      },
      include: {
        cliente: {
          select: {
            nombre: true,
            celular: true,
          },
        },
      },
    });

    if (clienteCampanhas.length === 0) {
      return NextResponse.json({ 
        message: 'No hay mensajes con SID para actualizar en esta campaña',
        updated: 0 
      });
    }

    console.log(`Iniciando actualización de ${clienteCampanhas.length} mensajes para campaña ${campaignId}`);

    let updatedCount = 0;
    let errors = [];

    // Procesar cada mensaje en lotes para evitar rate limiting
    const batchSize = 5;
    for (let i = 0; i < clienteCampanhas.length; i += batchSize) {
      const batch = clienteCampanhas.slice(i, i + batchSize);
      
      // Procesar batch actual
      const promises = batch.map(async (clienteCampanha) => {
        try {
          const twilioStatus = await getTwilioMessageStatus(clienteCampanha.message_sid);
          
          if (twilioStatus) {
            const newStatus = mapTwilioStatusToEnum(twilioStatus);
            
            // Solo actualizar si el estado ha cambiado
            if (newStatus !== clienteCampanha.message_status) {
              await prisma.cliente_campanha.update({
                where: { cliente_campanha_id: clienteCampanha.cliente_campanha_id },
                data: {
                  message_status: newStatus,
                  last_update: new Date(),
                },
              });
              
              console.log(`Actualizado ${clienteCampanha.cliente.nombre} (${clienteCampanha.cliente.celular}): ${clienteCampanha.message_status} → ${newStatus}`);
              updatedCount++;
            }
          } else {
            errors.push({
              cliente: clienteCampanha.cliente.nombre,
              celular: clienteCampanha.cliente.celular,
              message_sid: clienteCampanha.message_sid,
              error: 'No se pudo obtener estado de Twilio'
            });
          }
        } catch (error) {
          console.error(`Error procesando ${clienteCampanha.message_sid}:`, error);
          errors.push({
            cliente: clienteCampanha.cliente.nombre,
            celular: clienteCampanha.cliente.celular,
            message_sid: clienteCampanha.message_sid,
            error: error.message
          });
        }
      });

      // Esperar a que termine el batch actual
      await Promise.all(promises);
      
      // Pausa entre batches para evitar rate limiting
      if (i + batchSize < clienteCampanhas.length) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 segundo de pausa
      }
    }

    const response = {
      message: `Proceso completado. ${updatedCount} mensajes actualizados de ${clienteCampanhas.length} total.`,
      campaignId: parseInt(campaignId),
      totalMessages: clienteCampanhas.length,
      updated: updatedCount,
      errors: errors.length,
      errorDetails: errors,
    };

    console.log('Actualización completada:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('Error en actualización de estados:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Endpoint para actualizar estados de mensajes de Twilio',
    usage: 'POST /api/campaigns/update con { campaignId: number }'
  });
}
