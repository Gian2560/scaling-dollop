import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
require("dotenv").config();

const uri = process.env.DATABASE_URL_MONGODB;
const clientPromise = new MongoClient(uri).connect();

export async function POST(req, context) {
  try {
    console.log("📌 Iniciando carga de clientes por selección directa...");

    const { params } = context;
    if (!params || !params.id) {
      console.error("❌ Error: ID de campaña no válido");
      return NextResponse.json({ error: "ID de campaña no válido" }, { status: 400 });
    }

    const campanhaId = Number(params.id);
    if (isNaN(campanhaId)) {
      console.error("❌ Error: El ID de la campaña no es un número válido");
      return NextResponse.json({ error: "El ID de la campaña no es un número válido" }, { status: 400 });
    }

    const body = await req.json();
    const { clientIds } = body;

    if (!Array.isArray(clientIds) || clientIds.length === 0) {
      return NextResponse.json({ error: "No se proporcionaron clientes" }, { status: 400 });
    }

    const mongoClient = await clientPromise;
    const db = mongoClient.db(process.env.MONGODB_DB);

    const existingClientesMongo = await db.collection("clientes").find({
      id_cliente: { $in: clientIds.map((id) => `cli_${id}`) },
    }).toArray();

    const clientesProcesados = [];
    const omitidos = [];

    const resultados = await Promise.all(clientIds.map(async (clienteId) => {
      try {
        const clienteExistente = await prisma.cliente.findUnique({
          where: { cliente_id: clienteId },
        });

        if (!clienteExistente) {
          console.warn(`⚠️ Cliente con ID ${clienteId} no encontrado en MySQL.`);
          omitidos.push({ cliente_id: clienteId, razon: "No existe en MySQL" });
          return;
        }

        const idMongo = `cli_${clienteId}`;
        let clienteMongo = existingClientesMongo.find((client) => client.id_cliente === idMongo);

        if (!clienteMongo) {
          await db.collection("clientes").insertOne({
            id_cliente: idMongo,
            nombre: clienteExistente.nombre,
            celular: clienteExistente.celular,
            correo: "",
            conversaciones: [],
          });
        }

        const yaAsociado = await prisma.cliente_campanha.findFirst({
          where: {
            cliente_id: clienteId,
            campanha_id: campanhaId,
          },
        });

        if (yaAsociado) {
          console.log(`🔁 Cliente ${clienteId} ya está en la campaña ${campanhaId}.`);
          omitidos.push({ cliente_id: clienteId, razon: "Ya asociado a la campaña" });
          return;
        }

        await prisma.cliente_campanha.create({
          data: {
            cliente_id: clienteId,
            campanha_id: campanhaId,
          },
        });

        clientesProcesados.push({
          cliente_id: clienteId,
          nombre: clienteExistente.nombre,
          celular: clienteExistente.celular,
          gestor: clienteExistente.gestor,
        });

        console.log(`✅ Cliente ${clienteId} agregado a campaña ${campanhaId}`);
      } catch (innerError) {
        console.error(`❌ Error interno al procesar cliente ${clienteId}:`, innerError);
        omitidos.push({ cliente_id: clienteId, razon: "Error inesperado" });
      }
    }));

    const resumen = {
      intentados: clientIds.length,
      exitosos: clientesProcesados.length,
      omitidos: omitidos.length,
      fallidos: resultados.filter(r => r.status === 'rejected').length
    };

    console.log("📊 Resumen final de procesamiento:");
    console.log(JSON.stringify(resumen, null, 2));

    return NextResponse.json({
      message: `Clientes procesados para la campaña ${campanhaId}`,
      clientes: clientesProcesados,
      resumen,
      detalles_omitidos: omitidos
    });
  } catch (error) {
    console.error("❌ Error al agregar clientes por gestor a campaña:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
