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

      // 🚀 ULTRA OPTIMIZACIÓN: Operaciones directas sin búsquedas previas
      const mongoClient = await clientPromise;
      const db = mongoClient.db(process.env.MONGODB_DB);

      // 1️⃣ Crear/actualizar todos los clientes en MySQL usando createMany con skipDuplicates
      console.log(`🔹 Insertando/actualizando ${clientesValidos.length} clientes en MySQL...`);
      
      const datosClientesMysql = clientesValidos.map(cliente => ({
        celular: cliente.numero,
        nombre: cliente.nombre,
        documento_identidad: "",
        tipo_documento: "Desconocido",
        estado: "no contactado",
        gestor: cliente.asesor || ""
      }));

      // Crear clientes, ignorando duplicados
      await prisma.cliente.createMany({
        data: datosClientesMysql,
        skipDuplicates: true
      });

      console.log(`✅ Clientes procesados en MySQL`);

      // 2️⃣ Obtener todos los clientes que acabamos de procesar para obtener sus IDs
      const clientesConId = await prisma.cliente.findMany({
        where: { 
          celular: { in: clientesValidos.map(c => c.numero) } 
        },
        select: { cliente_id: true, celular: true, nombre: true, gestor: true }
      });

      console.log(`✅ ${clientesConId.length} clientes obtenidos con IDs`);

      // 3️⃣ Upsert masivo en MongoDB usando bulkWrite
      const operacionesMongo = clientesConId.map(cliente => ({
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

      if (operacionesMongo.length > 0) {
        console.log(`🔹 Ejecutando ${operacionesMongo.length} operaciones upsert en MongoDB...`);
        await db.collection("clientes").bulkWrite(operacionesMongo, { ordered: false });
        console.log(`✅ Operaciones upsert completadas en MongoDB`);
      }

      // 4️⃣ Crear relaciones campaña-cliente usando createMany con skipDuplicates
      const relacionesCampanha = clientesConId.map(cliente => ({
        cliente_id: cliente.cliente_id,
        campanha_id: campanhaId
      }));

      console.log(`🔹 Creando ${relacionesCampanha.length} relaciones campaña-cliente...`);
      await prisma.cliente_campanha.createMany({
        data: relacionesCampanha,
        skipDuplicates: true
      });
      console.log(`✅ Relaciones campaña-cliente creadas`);

      // 5️⃣ Preparar respuesta
      const clientesProcesados = clientesConId.map(cliente => ({
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
    const clientes = await prisma.cliente_campanha.findMany({
      where: { campanha_id: parseInt(params.id) },
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
    const { cliente_id } = await req.json();
    await prisma.cliente_campanha.deleteMany({
      where: { campanha_id: parseInt(params.id), cliente_id },
    });

    return NextResponse.json({ message: "Cliente eliminado" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
