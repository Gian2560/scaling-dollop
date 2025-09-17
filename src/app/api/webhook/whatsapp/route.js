import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 🔍 Función para buscar cliente por número de teléfono
async function findClientByPhone(phoneNumber) {
  // Normaliza el número recibido
  const cleanPhone = phoneNumber.replace(/^\+?51?/, "").replace(/[^0-9]/g, "");
  const withPlus = `+51${cleanPhone}`;
  const withoutPlus = `51${cleanPhone}`;
  const onlyNumber = cleanPhone;

  console.log(`🔍 [SEARCH] Buscando cliente con número: ${phoneNumber} -> limpio: ${cleanPhone}`);
  
  // Busca por los últimos 9 dígitos, con y sin prefijo, y con/sin '+'
  const cliente = await prisma.cliente.findFirst({
    where: {
      OR: [
        { celular: { endsWith: cleanPhone.slice(-9) } },
        { celular: { equals: phoneNumber } },
        { celular: { equals: onlyNumber } },
        { celular: { equals: withoutPlus } },
        { celular: { equals: withPlus } }
      ]
    },
    include: {
      cliente_campanha: {
        include: {
          campanha: {
            include: {
              template: true
            }
          }
        },
        orderBy: {
          fecha_envio: 'desc'
        },
        take: 1 // Solo la campaña más reciente
      }
    }
  });

  if (cliente) {
    console.log(`✅ [FOUND] Cliente encontrado: ${cliente.nombre} - ID: ${cliente.cliente_id}`);
  } else {
    console.log(`❌ [NOT_FOUND] No se encontró cliente para: ${phoneNumber}`);
  }

  return cliente;
}

// 🤖 Función para procesar respuestas automáticas
async function processAutoReply(clientPhone, messageText, clienteInfo) {
  try {
    console.log(`🤖 [RESPONSE] Cliente respondió: "${messageText}": información del cliente: ${JSON.stringify(clienteInfo)}`);
    
    // Solo marcar que el cliente ha respondido
    if (clienteInfo?.cliente_campanha?.[0]) {
      await prisma.cliente_campanha.update({
        where: { cliente_campanha_id: clienteInfo.cliente_campanha[0].cliente_campanha_id },
        data: {
          estado_mensaje: "replied",
          fecha_ultimo_estado: new Date(),
        }
      });
      console.log(`📊 [STATUS] Cliente marcado como "replied"`);
    }

  } catch (error) {
    console.error("❌ [AUTO_REPLY] Error actualizando estado:", error);
  }
}

// 📨 GET - Verificación del webhook (requerido por Meta)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "mi_token_secreto_webhook_2024";

  console.log(`🔍 [WEBHOOK_VERIFY] Mode: ${mode}, Token: ${token}`);

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ [WEBHOOK] Webhook verificado correctamente');
      return new Response(challenge, { status: 200 });
    } else {
      console.error('❌ [WEBHOOK] Token de verificación incorrecto');
      return new Response('Forbidden', { status: 403 });
    }
  }

  return new Response('Bad Request', { status: 400 });
}

// 📨 POST - Recibir eventos de WhatsApp
export async function POST(request) {
  try {
    const body = await request.json();
    
    console.log(`📨 [WEBHOOK] Evento recibido:`, JSON.stringify(body, null, 2));

    const entries = body.entry || [];
    
    for (const entry of entries) {
      const changes = entry.changes || [];
      
      for (const change of changes) {
        const value = change.value;
        
        // 📱 MENSAJES ENTRANTES (respuestas de clientes)
        if (value.messages && value.messages.length > 0) {
          console.log(`📱 [INCOMING] Procesando ${value.messages.length} mensajes entrantes`);
          
          for (const message of value.messages) {
            const from = message.from; // Número del cliente
            const messageText = message.text?.body || message.interactive?.button_reply?.title || "[Mensaje no texto]";
            const messageId = message.id;
            const timestamp = parseInt(message.timestamp);

            console.log(`📨 [MESSAGE_IN] De: ${from}, Mensaje: "${messageText}", ID: ${messageId}`);

            // 🔍 BUSCAR CLIENTE POR NÚMERO
            const clienteInfo = await findClientByPhone(from);

            if (clienteInfo) {
              console.log(`✅ [CONTEXT] Cliente encontrado: ${clienteInfo.nombre}`);
              
              // 🤖 PROCESAR RESPUESTA - Solo actualizar estado, no guardar en Firebase
              console.log(`📱 [RESPONSE] Cliente ${clienteInfo.nombre} respondió: "${messageText}"`);
              await processAutoReply(from, messageText, clienteInfo);

            } else {
              console.log(`⚠️ [NO_CONTEXT] Cliente no encontrado para ${from}`);
              console.log(`📝 [ORPHAN] Mensaje órfano recibido: "${messageText}"`);
            }
          }
        }

        // 📊 ESTADOS DE MENSAJES (delivered, read, failed, etc.)
        if (value.statuses && value.statuses.length > 0) {
          console.log(`📊 [STATUS] Procesando ${value.statuses.length} actualizaciones de estado`);
          
          for (const status of value.statuses) {
            const messageId = status.id;
            const statusType = status.status; // "sent", "delivered", "read", "failed"
            const timestamp = parseInt(status.timestamp);
            const recipientId = status.recipient_id;

            console.log(`📊 [STATUS_UPDATE] Mensaje: ${messageId}, Estado: ${statusType}, Para: ${recipientId}`);

            try {
              // Actualizar estado en la tabla cliente_campanha
              const updateResult = await prisma.cliente_campanha.updateMany({
                where: { whatsapp_message_id: messageId },
                data: {
                  estado_mensaje: statusType,
                  fecha_ultimo_estado: new Date(timestamp * 1000),
                }
              });

              if (updateResult.count > 0) {
                console.log(`✅ [BD_UPDATE] Estado actualizado para ${updateResult.count} registro(s)`);
              } else {
                console.log(`⚠️ [BD_UPDATE] No se encontró mensaje con ID: ${messageId}`);
              }

            } catch (dbError) {
              console.error(`❌ [BD_ERROR] Error actualizando estado:`, dbError);
            }
          }
        }

        // 📝 ERRORES DE MENSAJES
        if (value.errors && value.errors.length > 0) {
          console.log(`❌ [ERRORS] Procesando ${value.errors.length} errores`);
          
          for (const error of value.errors) {
            console.error(`❌ [MESSAGE_ERROR] Código: ${error.code}, Título: ${error.title}, Mensaje: ${error.message}`);
            // Aquí podrías guardar los errores en una tabla de logs
          }
        }
      }
    }

   

    return NextResponse.json({ received: true, timestamp: new Date().toISOString() });

  } catch (error) {
    console.error("❌ [WEBHOOK_ERROR] Error procesando webhook:", error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      details: error.message 
    }, { status: 500 });
  }
}
