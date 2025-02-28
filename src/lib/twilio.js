import twilio from "twilio";

// 🔹 Configurar cliente de Twilio con variables de entorno
const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

export default client;
