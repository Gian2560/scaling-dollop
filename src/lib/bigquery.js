import { BigQuery } from '@google-cloud/bigquery';
import 'dotenv/config';                 // carga las variables del .env

// ── Obtén las credenciales desde la variable de entorno ────────────────
let credentials;

if (process.env.BIG_QUERY_KEY) {
  credentials = JSON.parse(process.env.BIG_QUERY_KEY);
} else if (process.env.BIG_QUERY_KEY_B64) {
  const json = Buffer.from(process.env.BIG_QUERY_KEY_B64, 'base64').toString();
  credentials = JSON.parse(json);
} else {
  throw new Error('❌ Falta BIG_QUERY_KEY o BIG_QUERY_KEY_B64 en las variables de entorno');
}

// ── Crea la instancia ───────────────────────────────────────────────────
const bigquery = new BigQuery({
  projectId: process.env.GCP_PROJECT_ID,   // también fuera del código
  credentials,                             // ← YA NO se usa keyFilename
});

export default bigquery;
