import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parse } from "csv-parse/sync";
import * as XLSX from "xlsx";
import { MongoClient } from "mongodb";
require("dotenv").config();

const uri = process.env.DATABASE_URL_MONGODB;
const clientPromise = new MongoClient(uri).connect();

export async function POST(req, context) {
    try {
      console.log("📌 Iniciando carga de clientes...");
  
      // 🚀 FIX Next.js: Await params primero
      const { params } = context;
      const resolvedParams = await params;
      
      if (!resolvedParams || !resolvedParams.id) {
        console.error("❌ Error: ID de campaña no válido");
        return NextResponse.json({ error: "ID de campaña no válido" }, { status: 400 });
      }
  
      const campanhaId = Number(resolvedParams.id);
      if (isNaN(campanhaId)) {
        console.error("❌ Error: El ID de la campaña no es un número válido");
        return NextResponse.json({ error: "El ID de la campaña no es un número válido" }, { status: 400 });
      }
  
      console.log(`✅ ID de campaña recibido: ${campanhaId}`);
  
      const formData = await req.formData();
      const file = formData.get("archivo");
  
      if (!file) {
        console.error("❌ Error: No se proporcionó ningún archivo");
        return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 });
      }
  
      console.log(`📌 Archivo recibido: ${file.name}`);
  
      const buffer = Buffer.from(await file.arrayBuffer());
      let clientes = [];
  
      if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        console.log("📌 Procesando archivo Excel...");
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        clientes = XLSX.utils.sheet_to_json(sheet);
      } else {
        console.error("❌ Error: Formato de archivo no válido");
        return NextResponse.json({ error: "Formato de archivo no válido. Debe ser .xlsx o .csv" }, { status: 400 });
      }
  
      if (clientes.length === 0) {
        console.error("❌ Error: El archivo está vacío o tiene formato incorrecto");
        return NextResponse.json({ error: "El archivo está vacío o no tiene formato válido" }, { status: 400 });
      }
  
      console.log(`📌 Clientes cargados desde archivo: ${clientes.length} registros`);

      // 🚀 OPTIMIZACIÓN 1: Normalizar y filtrar clientes válidos de una vez
      const clientesValidos = clientes
        .filter(cliente => cliente.Numero && cliente.Nombre)
        .map(cliente => {
          let numero = String(cliente.Numero).trim();
          if (!numero.startsWith("+51")) {
            numero = `+51${numero}`;
          }
          return {
            numero,
            nombre: cliente.Nombre,
            asesor: cliente.Asesor
          };
        });

      if (clientesValidos.length === 0) {
        return NextResponse.json({ error: "No hay clientes válidos en el archivo" }, { status: 400 });
      }

      console.log(`📌 Clientes válidos para procesar: ${clientesValidos.length}`);

      // 🚀 ULTRA OPTIMIZACIÓN: Operaciones paralelas y chunks para máximo rendimiento
      const mongoClient = await clientPromise;
      const db = mongoClient.db(process.env.MONGODB_DB);

      // � VERIFICAR RELACIONES EXISTENTES UNA SOLA VEZ AL INICIO
      console.log(`🔍 Verificando clientes ya asociados a la campaña ${campanhaId}...`);
      const relacionesExistentes = await prisma.cliente_campanha.findMany({
        where: { campanha_id: campanhaId },
        select: { cliente_id: true }
      });
      const clientesYaEnCampanha = new Set(relacionesExistentes.map(r => r.cliente_id));
      console.log(`📌 ${clientesYaEnCampanha.size} clientes ya están en la campaña`);

      // �📦 CHUNK SIZE para operaciones masivas (mejor para Vercel)
      const CHUNK_SIZE = 1000;
      const chunks = [];
      for (let i = 0; i < clientesValidos.length; i += CHUNK_SIZE) {
        chunks.push(clientesValidos.slice(i, i + CHUNK_SIZE));
      }

      console.log(`🔹 Procesando ${clientesValidos.length} clientes en ${chunks.length} chunks de ${CHUNK_SIZE}...`);

      let todosClientesConId = [];

      // 🚀 PROCESAR EN CHUNKS PARALELOS
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`📦 Procesando chunk ${i + 1}/${chunks.length} (${chunk.length} clientes)...`);

        // 1️⃣ MySQL: Crear clientes del chunk
        const datosChunk = chunk.map(cliente => ({
          celular: cliente.numero,
          nombre: cliente.nombre,
          documento_identidad: "",
          tipo_documento: "Desconocido",
          estado: "no contactado",
          gestor: cliente.asesor || ""
        }));

        await prisma.cliente.createMany({
          data: datosChunk,
          skipDuplicates: true
        });

        // 2️⃣ Obtener IDs del chunk procesado
        const clientesChunkConId = await prisma.cliente.findMany({
          where: { celular: { in: chunk.map(c => c.numero) } },
          select: { cliente_id: true, celular: true, nombre: true, gestor: true }
        });

        todosClientesConId.push(...clientesChunkConId);

        // 3️⃣ MongoDB: Upsert del chunk (PARALELO)
        const operacionesMongoChunk = clientesChunkConId.map(cliente => ({
          updateOne: {
            filter: { celular: cliente.celular },
            update: {
              $setOnInsert: {
                id_cliente: `cli_${cliente.cliente_id}`,
                nombre: cliente.nombre,
                celular: cliente.celular,
                correo: "",
                conversaciones: []
              }
            },
            upsert: true
          }
        }));

        // 4️⃣ FILTRAR RELACIONES QUE NO EXISTEN
        const relacionesNuevas = clientesChunkConId
          .filter(cliente => !clientesYaEnCampanha.has(cliente.cliente_id))
          .map(cliente => ({
            cliente_id: cliente.cliente_id,
            campanha_id: campanhaId
          }));

        console.log(`📌 Chunk ${i + 1}: ${relacionesNuevas.length}/${clientesChunkConId.length} relaciones nuevas`);

        // 🚀 EJECUTAR MONGO Y RELACIONES EN PARALELO (solo las nuevas)
        await Promise.all([
          operacionesMongoChunk.length > 0 
            ? db.collection("clientes").bulkWrite(operacionesMongoChunk, { ordered: false })
            : Promise.resolve(),
          relacionesNuevas.length > 0
            ? prisma.cliente_campanha.createMany({
                data: relacionesNuevas
              })
            : Promise.resolve()
        ]);

        console.log(`✅ Chunk ${i + 1} completado`);
      }

      console.log(`✅ Todos los chunks procesados. Total: ${todosClientesConId.length} clientes`);

      // 5️⃣ Preparar respuesta
      const clientesProcesados = todosClientesConId.map(cliente => ({
        cliente_id: cliente.cliente_id,
        nombre: cliente.nombre,
        celular: cliente.celular,
        gestor: cliente.gestor
      }));      console.log(`✅ Carga de clientes completada con éxito. Total procesados: ${clientesProcesados.length}`);
  
      return NextResponse.json({
        message: `Clientes procesados con éxito en la campaña ${campanhaId}`,
        clientes: clientesProcesados,
      });
    } catch (error) {
      console.error("❌ Error al cargar clientes:", error);
      return NextResponse.json({ error: "Error al procesar el archivo" }, { status: 500 });
    }
  }

// 🔹 Obtener clientes de una campaña
export async function GET(req, { params }) {
  try {
    // 🚀 FIX Next.js: Await params primero
    const resolvedParams = await params;
    const clientes = await prisma.cliente_campanha.findMany({
      where: { campanha_id: parseInt(resolvedParams.id) },
      include: { cliente: true },
    });

    return NextResponse.json(clientes);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 🔹 Eliminar cliente de campaña
export async function DELETE(req, { params }) {
  try {
    // 🚀 FIX Next.js: Await params primero
    const resolvedParams = await params;
    const { cliente_id } = await req.json();
    await prisma.cliente_campanha.deleteMany({
      where: { campanha_id: parseInt(resolvedParams.id), cliente_id },
    });

    return NextResponse.json({ message: "Cliente eliminado" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
