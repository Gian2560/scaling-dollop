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

        console.log("📌 Clientes cargados desde archivo:", clientes);

        const clientesProcesados = [];
        const mongoClient = await clientPromise;
        const db = mongoClient.db(process.env.MONGODB_DB);

        for (const cliente of clientes) {
            let { Numero, Nombre, Asesor } = cliente;
            console.log("gaaaaaaaaaaaaaaaaaa", cliente);

            if (!Numero || !Nombre) {
                console.warn("❗ Cliente omitido por datos faltantes:", cliente);
                continue;
            }

            Numero = String(Numero).trim();
            if (!Numero.startsWith("+51")) {
                Numero = `+51${Numero}`;
            }

            console.log(`🔍 Buscando cliente con número: ${Numero}`);

            // 📌 Buscar si el cliente existe en MySQL
            let clienteExistente = await prisma.cliente.findFirst({
                where: { celular: Numero },
            });

            // 📌 Buscar si el cliente existe en MongoDB
            let clienteMongo = await db.collection("clientes").findOne({ celular: Numero });

            // 📌 Si el cliente NO existe en MySQL, crearlo
            if (!clienteExistente) {
                console.log(`🔹 Cliente no encontrado en MySQL, creando nuevo: ${Nombre}`);
                try {
                    clienteExistente = await prisma.cliente.create({
                        data: {
                            celular: Numero,
                            nombre: Nombre,
                            documento_identidad: "",
                            tipo_documento: "Desconocido",
                            estado: "en seguimiento",
                            gestor: Asesor, 
                        },
                    });
                    console.log(`✅ Cliente creado en MySQL con ID: ${clienteExistente.cliente_id}`);
                } catch (err) {
                    console.error("❌ Error al crear cliente en MySQL:", err);
                    continue;
                }
            } else {
                console.log(`✅ Cliente ya existe en MySQL con ID: ${clienteExistente.cliente_id}`);
            }

            // 📌 Si el cliente NO existe en MongoDB, crearlo
            if (!clienteMongo) {
                console.log(`🔹 Cliente no encontrado en MongoDB, creando nuevo: ${Nombre}`);
                try {
                    const nuevoClienteMongo = {
                        id_cliente: `cli_${clienteExistente.cliente_id}`,
                        nombre: Nombre,
                        celular: Numero,
                        correo: "",
                        conversaciones: [], // Inicialmente sin conversaciones
                    };

                    await db.collection("clientes").insertOne(nuevoClienteMongo);
                    console.log(`✅ Cliente creado en MongoDB con ID: cli_${clienteExistente.cliente_id}`);
                } catch (err) {
                    console.error("❌ Error al crear cliente en MongoDB:", err);
                    continue;
                }
            } else {
                console.log(`✅ Cliente ya existe en MongoDB con ID: ${clienteMongo.id_cliente}`);
            }

            const clienteId = clienteExistente.cliente_id;

            // 📌 Verificar si el cliente ya está en la campaña
            let clienteCampanhaExistente = await prisma.cliente_campanha.findFirst({
                where: {
                    cliente_id: clienteId,
                    campanha_id: campanhaId,
                },
            });

            if (!clienteCampanhaExistente) {
                console.log(`🔹 Cliente ${clienteId} no está en la campaña, agregando...`);
                try {
                    await prisma.cliente_campanha.create({
                        data: {
                            cliente_id: clienteId,
                            campanha_id: campanhaId,
                        },
                    });
                    console.log(`✅ Cliente ${clienteId} agregado a campaña ${campanhaId}`);
                } catch (err) {
                    console.error("❌ Error al agregar cliente a campaña:", err);
                    continue;
                }
            } else {
                console.log(`⚠️ Cliente ${clienteId} ya está en la campaña, omitiendo...`);
            }

            clientesProcesados.push({
                cliente_id: clienteId,
                nombre: clienteExistente.nombre,
                celular: clienteExistente.celular,
                gestor: clienteExistente.gestor
            });
        }

        console.log(`✅ Carga de clientes completada con éxito. Total procesados: ${clientesProcesados.length}`);

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
