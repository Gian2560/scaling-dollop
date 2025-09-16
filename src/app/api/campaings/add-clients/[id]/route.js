// import prisma from "@/lib/prisma";
// import { NextResponse } from "next/server";
// import { MongoClient } from "mongodb";
// import pMap from "p-map";
// require("dotenv").config();

// const uri = process.env.DATABASE_URL_MONGODB;
// const clientPromise = new MongoClient(uri).connect();

// export async function POST(req, context) {
//   try {
//     console.log("📌 Iniciando carga de clientes por selección directa...");

//     const { params } = context;
//     if (!params || !params.id) {
//       console.error("❌ Error: ID de campaña no válido");
//       return NextResponse.json({ error: "ID de campaña no válido" }, { status: 400 });
//     }

//     const campanhaId = Number(params.id);
//     if (isNaN(campanhaId)) {
//       console.error("❌ Error: El ID de la campaña no es un número válido");
//       return NextResponse.json({ error: "El ID de la campaña no es un número válido" }, { status: 400 });
//     }

//     const body = await req.json();
//     const { clientIds } = body;

//     if (!Array.isArray(clientIds) || clientIds.length === 0) {
//       return NextResponse.json({ error: "No se proporcionaron clientes" }, { status: 400 });
//     }

//     const mongoClient = await clientPromise;
//     const db = mongoClient.db(process.env.MONGODB_DB);

//     const existingClientesMongo = await db.collection("clientes").find({
//       id_cliente: { $in: clientIds.map((id) => `cli_${id}`) },
//     }).toArray();

//     const clientesProcesados = [];
//     const omitidos = [];

//     const resultados = await Promise.allSettled(
//       clientIds.map(async (clienteId) => {
//         try {
//           const clienteExistente = await prisma.cliente.findUnique({
//             where: { cliente_id: clienteId },
//           });

//           if (!clienteExistente) {
//             console.warn(`⚠️ Cliente con ID ${clienteId} no encontrado en MySQL.`);
//             omitidos.push({ cliente_id: clienteId, razon: "No existe en MySQL" });
//             return;
//           }

//           const idMongo = `cli_${clienteId}`;
//           let clienteMongo = existingClientesMongo.find((client) => client.id_cliente === idMongo);

//           if (!clienteMongo) {
//             await db.collection("clientes").insertOne({
//               id_cliente: idMongo,
//               nombre: clienteExistente.nombre,
//               celular: clienteExistente.celular,
//               correo: "",
//               conversaciones: [],
//             });
//           }

//           const yaAsociado = await prisma.cliente_campanha.findFirst({
//             where: {
//               cliente_id: clienteId,
//               campanha_id: campanhaId,
//             },
//           });

//           if (yaAsociado) {
//             console.log(`🔁 Cliente ${clienteId} ya está en la campaña ${campanhaId}.`);
//             omitidos.push({ cliente_id: clienteId, razon: "Ya asociado a la campaña" });
//             return;
//           }

//           await prisma.cliente_campanha.create({
//             data: {
//               cliente_id: clienteId,
//               campanha_id: campanhaId,
//             },
//           });

//           clientesProcesados.push({
//             cliente_id: clienteId,
//             nombre: clienteExistente.nombre,
//             celular: clienteExistente.celular,
//             gestor: clienteExistente.gestor,
//           });

//           console.log(`✅ Cliente ${clienteId} agregado a campaña ${campanhaId}`);
//         } catch (innerError) {
//           console.error(`❌ Error interno al procesar cliente ${clienteId}:`, innerError?.message || innerError);
//           omitidos.push({ cliente_id: clienteId, razon: "Error inesperado" });
//         }
//       })
//     );

//     const resumen = {
//       intentados: clientIds.length,
//       exitosos: clientesProcesados.length,
//       omitidos: omitidos.length,
//       fallidos: resultados.filter(r => r.status === 'rejected').length,
//     };

//     console.log("📊 Resumen final de procesamiento:");
//     console.log(JSON.stringify(resumen, null, 2));
//     console.log("📋 Detalles de clientes omitidos:", JSON.stringify(omitidos, null, 2));

//     return NextResponse.json({
//       message: `Clientes procesados para la campaña ${campanhaId}`,
//       clientes: clientesProcesados,
//       resumen,
//       detalles_omitidos: omitidos
//     });
//   } catch (error) {
//     console.error("❌ Error al agregar clientes por gestor a campaña:", error?.message || error);
//     return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
//   }
// }

// import prisma from "@/lib/prisma";
// import { NextResponse } from "next/server";
// import { MongoClient } from "mongodb";

// require("dotenv").config();

// const uri = process.env.DATABASE_URL_MONGODB;
// const clientPromise = new MongoClient(uri).connect();

// const normalizePhone = v => {
//   if (!v) return null;
//   const digits = String(v).replace(/\D/g, '');
//   if (digits.startsWith('51')) return `+${digits}`;
//   return `+51${digits}`;
// };
// const toStr = (v) => {
//   if (v === null || v === undefined) return null;
//   const s = String(v).trim();
//   return s.length ? s : null;
// };
// export async function POST(req, context) {
//   try {
//     const { params } = context;
//     if (!params?.id || isNaN(Number(params.id))) {
//       return NextResponse.json({ error: "ID de campaña no válido" }, { status: 400 });
//     }
//     const campanhaId = Number(params.id);

//     const body = await req.json();
//     // Puede venir clientIds (legacy) o clients (nuevo)
//     const { clientIds = [], clients = [] } = body;

//     const mongoClient = await clientPromise;
//     const db = mongoClient.db(process.env.MONGODB_DB);

//     const processed = [];
//     const skipped = [];

//     // Helper para traer/crear/actualizar cliente y devolver su cliente_id
//     const getClienteId = async (c) => {
//       // Si viene solo ID (legacy) buscamos en prisma
//       if (typeof c === 'number') {
//         const found = await prisma.cliente.findUnique({ where: { cliente_id: c } });
//         return found?.cliente_id ?? null;
//       }
//       // Si viene objeto desde BigQuery
//       const payload = {
//         Codigo_Asociado: toStr(c.Codigo_Asociado) ?? null,
//         documento_identidad: toStr(c.N_Doc) ?? null,
//         nombre: c.Nombres ?? null,
//         apellido: c.Apellido_Paterno ?? null,
//         celular: normalizePhone(c.Telf_SMS),
//         Segmento: c.Segmento ?? null,
//         email: c.E_mail ?? null,
//         Zona: c.Zona ?? null,
//         gestor: c.Asesor ?? null,
//       };

//       // Busca por documento, celular o Codigo_Asociado
//       const existing = await prisma.cliente.findFirst({
//         where: {
//           OR: [
//             payload.documento_identidad ? { documento_identidad: payload.documento_identidad } : undefined,
//             payload.celular ? { celular: payload.celular } : undefined,
//             payload.Codigo_Asociado ? { Codigo_Asociado: payload.Codigo_Asociado } : undefined,
//           ].filter(Boolean)
//         }
//       });

//       if (!existing) {
//         const created = await prisma.cliente.create({ data: payload });
//         return created.cliente_id;
//       } else {
//         // Actualiza solo Segmento, Zona, gestor
//         await prisma.cliente.update({
//           where: { cliente_id: existing.cliente_id },
//           data: { Segmento: payload.Segmento, Zona: payload.Zona, gestor: payload.gestor }
//         });
//         return existing.cliente_id;
//       }
//     };

//     // Construye lista única de clientes a procesar
//     const toProcess = [
//       ...clientIds,                                // legacy
//       ...clients                                   // objetos
//     ];

//     for (const c of toProcess) {
//       try {
//         const clienteId = await getClienteId(c);
//         if (!clienteId) { skipped.push({ reason: 'cliente no encontrado/creado', c }); continue; }

//         // Crea doc en Mongo si no existe
//         const idMongo = `cli_${clienteId}`;
//         const clienteMongo = await db.collection("clientes").findOne({ id_cliente: idMongo });
//         if (!clienteMongo) {
//           const prismaCli = await prisma.cliente.findUnique({ where: { cliente_id: clienteId } });
//           await db.collection("clientes").insertOne({
//             id_cliente: idMongo,
//             nombre: prismaCli?.nombre ?? '',
//             celular: prismaCli?.celular ?? '',
//             correo: prismaCli?.email ?? '',
//             conversaciones: [],
//           });
//         }

//         // Evita duplicar en cliente_campanha
//         const ya = await prisma.cliente_campanha.findFirst({
//           where: { cliente_id: clienteId, campanha_id: campanhaId },
//         });
//         if (!ya) {
//           await prisma.cliente_campanha.create({ data: { cliente_id: clienteId, campanha_id: campanhaId }});
//         }

//         processed.push({ cliente_id: clienteId });
//       } catch (e) {
//         skipped.push({ reason: e.message, c });
//       }
//     }

//     return NextResponse.json({
//       message: `Procesados ${processed.length}, omitidos ${skipped.length}`,
//       processed, skipped
//     });
//   } catch (error) {
//     console.error("❌ Error al agregar clientes a campaña:", error);
//     return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
//   }
// }







import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const toStr = (v) => (v === null || v === undefined ? null : String(v).trim() || null);
const normalizePhone = (v) => {
  const digits = toStr(v)?.replace(/\D/g, "") || "";
  if (!digits) return null;
  const withCc = digits.startsWith("51") ? digits : `51${digits}`;
  return `+${withCc}`;
};

const s = (v) => {
  if (v === undefined || v === null) return null;  // deja NULL si no hay dato
  const str = String(v).trim();
  return str === "" ? null : str;
};
export async function POST(req, ctx) {
  try {
    const { id } = ctx?.params?.then ? await ctx.params : (ctx.params || {});
    const campanhaId = Number(id);
    if (!campanhaId || Number.isNaN(campanhaId)) {
      return NextResponse.json({ error: "ID de campaña no válido" }, { status: 400 });
    }

    const { clients = [], clientIds = [] } = await req.json();
    if (!clients.length && !clientIds.length) {
      return NextResponse.json({ error: "No se enviaron clientes" }, { status: 400 });
    }

    // Helper: upsert cliente y devolver cliente_id
    const getClienteId = async (c) => {
      if (typeof c === "number") {
        const found = await prisma.cliente.findUnique({ where: { cliente_id: c } });
        return found?.cliente_id ?? null;
      }
      // Objeto proveniente de BigQuery
      const payload = {
        Codigo_Asociado: toStr(c.Codigo_Asociado),
        documento_identidad: toStr(c.documento_identidad),
        nombre: s(c.nombre),
        apellido: toStr(c.Apellido_Paterno),
        celular: normalizePhone(c.celular),
        Segmento: toStr(c.Segmento),
        email: toStr(c.email),
        Zona: toStr(c.Zona),
        gestor: toStr(c.gestor),
        Producto: toStr(c.Producto),
      };

      const or = [];
      if (payload.documento_identidad) or.push({ documento_identidad: payload.documento_identidad });
      if (payload.celular)             or.push({ celular: payload.celular });
      if (payload.Codigo_Asociado)     or.push({ Codigo_Asociado: payload.Codigo_Asociado });

      const existing = or.length ? await prisma.cliente.findFirst({ where: { OR: or } }) : null;

      if (!existing) {
        const created = await prisma.cliente.create({ data: payload });
        return created.cliente_id;
      } else {
        await prisma.cliente.update({
          where: { cliente_id: existing.cliente_id },
          data: {
            Segmento: payload.Segmento,
            Zona: payload.Zona,
            gestor: payload.gestor,
          },
        });
        return existing.cliente_id;
      }
    };

    const items = [...clients, ...clientIds];
    const processed = [];

    for (const c of items) {
      const clienteId = await getClienteId(c);
      if (!clienteId) continue;

      const ya = await prisma.cliente_campanha.findFirst({
        where: { cliente_id: clienteId, campanha_id: campanhaId },
      });
      if (!ya) {
        await prisma.cliente_campanha.create({
          data: { cliente_id: clienteId, campanha_id: campanhaId },
        });
      }
      processed.push(clienteId);
    }

    return NextResponse.json({ ok: true, campanha_id: campanhaId, count: processed.length, clientes: processed });
  } catch (error) {
    console.error("❌ Error al asociar clientes a campaña:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
