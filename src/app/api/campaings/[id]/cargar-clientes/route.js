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
      console.log("⚡ ULTRA FAST MODE: Iniciando carga...");
      const startTime = Date.now();
  
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

      // 🚀 ULTRA OPTIMIZACIÓN: Normalizar y filtrar clientes válidos de una vez
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

      console.log(`⚡ MODO ULTRA RAPIDO: ${clientesValidos.length} clientes`);

      // 🚀 ULTRA VELOCIDAD: Sin verificaciones, operaciones masivas directas
      const mongoClient = await clientPromise;
      const db = mongoClient.db(process.env.MONGODB_DB);

      // 1️⃣ MEGA BATCH: Crear TODOS los clientes de una vez (sin chunks)
      const todosLosDatos = clientesValidos.map(cliente => ({
        celular: cliente.numero,
        nombre: cliente.nombre,
        documento_identidad: "",
        tipo_documento: "Desconocido",
        estado: "no contactado",
        gestor: cliente.asesor || ""
      }));

      console.log(`🔥 Creando ${todosLosDatos.length} clientes en MySQL...`);
      
      // 2️⃣ OBTENER IDs y OPERACIONES MASIVAS EN PARALELO
      const [_, todosClientesConId] = await Promise.all([
        // Crear clientes en MySQL
        prisma.cliente.createMany({
          data: todosLosDatos,
          skipDuplicates: true
        }),
        // Obtener todos los IDs de una vez (después de crear)
        prisma.cliente.findMany({
          where: { celular: { in: clientesValidos.map(c => c.numero) } },
          select: { cliente_id: true, celular: true, nombre: true, gestor: true }
        }).then(async (clientes) => {
          // 3️⃣ MIENTRAS OBTENEMOS IDs, PREPARAR OPERACIONES MONGO
          const operacionesMongo = clientes.map(cliente => ({
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

          const todasLasRelaciones = clientes.map(cliente => ({
            cliente_id: cliente.cliente_id,
            campanha_id: campanhaId
          }));

          // 4️⃣ EJECUTAR TODO EN PARALELO EXTREMO
          console.log(`🚀 Ejecutando operaciones masivas finales...`);
          await Promise.all([
            // MongoDB con configuración ultra rápida
            operacionesMongo.length > 0 
              ? db.collection("clientes").bulkWrite(operacionesMongo, { 
                  ordered: false,
                  writeConcern: { w: 0, j: false } // Sin journaling para máxima velocidad
                })
              : Promise.resolve(),
            
            // Relaciones con skipDuplicates
            prisma.cliente_campanha.createMany({
              data: todasLasRelaciones,
              skipDuplicates: true
            })
          ]);

          return clientes;
        })
      ]);

      const endTime = Date.now();
      const totalTime = (endTime - startTime) / 1000;

      console.log(`⚡ ULTRA VELOCIDAD completada en ${totalTime} segundos!`);

      // 5️⃣ Preparar respuesta
      const clientesProcesados = todosClientesConId.map(cliente => ({
        cliente_id: cliente.cliente_id,
        nombre: cliente.nombre,
        celular: cliente.celular,
        gestor: cliente.gestor
      }));

      console.log(`✅ Carga completada: ${clientesProcesados.length} clientes en ${totalTime}s`);
  
      return NextResponse.json({
        message: `${clientesProcesados.length} clientes procesados en ${totalTime} segundos`,
        clientes: clientesProcesados,
        tiempoTotal: `${totalTime}s`
      });
    } catch (error) {
      console.error("❌ Error al cargar clientes:", error);
      return NextResponse.json({ error: "Error al procesar el archivo" }, { status: 500 });
    }
  }

// 🔹 Obtener clientes de una campaña
export async function GET(req, { params }) {
  try {
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
