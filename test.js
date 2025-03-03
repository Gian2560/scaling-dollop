require('dotenv').config();
const twilio = require('twilio');

const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

async function enviarMensajeConPlantilla() {
    try {
        const mensaje = await client.messages.create({
            from: 'whatsapp:+14155238886', // Número de Twilio para pruebas en WhatsApp
            to: process.env.TEST_PHONE_NUMBER, // Número de destino
            contentSid: process.env.TEMPLATE_SID, // SID de la plantilla aprobada
            contentVariables: JSON.stringify({
                1: "12/1",  // Primera variable de la plantilla
                2: "3pm" // Segunda variable de la plantilla
            })
        });

        console.log("✅ Mensaje enviado con éxito. SID:", mensaje.sid);
    } catch (error) {
        console.error("❌ Error al enviar el mensaje:", error);
    }
}

enviarMensajeConPlantilla();
