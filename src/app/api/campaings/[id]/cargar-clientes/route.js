import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parse } from "csv-parse/sync";
import * as XLSX from "xlsx";

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

        // 📌 Detectar si el archivo es Excel o CSV
        if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
            console.log("📌 Procesando archivo Excel...");
            const workbook = XLSX.read(buffer, { type: "buffer" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            clientes = XLSX.utils.sheet_to_json(sheet);
        } else if (file.name.endsWith(".csv")) {
            console.log("📌 Procesando archivo CSV...");
            const csvData = buffer.toString();
            clientes = parse(csvData, { columns: true, skip_empty_lines: true });
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

        for (const cliente of clientes) {
            let { Numero, Nombre } = cliente;

            if (!Numero || !Nombre) {
                console.warn("❗ Cliente omitido por datos faltantes:", cliente);
                continue;
            }

            // 📌 Asegurar que Numero es un string antes de formatearlo
            Numero = String(Numero).trim();

            // 📌 Agregar +51 si no lo tiene
            if (!Numero.startsWith("+51")) {
                Numero = `+51${Numero}`;
            }
            console.log(`🔍 Buscando cliente con número: ${Numero}`);
            const clientes2 = await prisma.cliente.findMany({
              });
            console.log("ADadDadaD",clientes2);
            // 📌 Buscar si el cliente ya existe en la base de datos por número
            let clienteExistente = null;
            try {
                clienteExistente = await prisma.cliente.findFirst({
                    where: { celular: Numero },
                });
            } catch (err) {
                console.error("❌ Error en la consulta de cliente existente:", err);
            }

            if (clienteExistente === null) {
                console.log(`🔹 Cliente no encontrado, creando nuevo: ${Nombre}`);
                try {
                    clienteExistente = await prisma.cliente.create({
                        data: {
                            celular: Numero,
                            nombre: Nombre,
                            documento_identidad: "", // 📌 No tenemos el DNI en el archivo
                            tipo_documento: "Desconocido",
                            estado: "activo",
                        },
                    });
                    console.log(`✅ Cliente creado con ID: ${clienteExistente.cliente_id}`);
                } catch (err) {
                    console.error("❌ Error al crear cliente:", err);
                    continue;
                }
            } else {
                console.log(`✅ Cliente ya existe en la BD con ID: ${clienteExistente.cliente_id}`);
            }

            if (!clienteExistente || !clienteExistente.cliente_id) {
                console.error("❌ Cliente no encontrado ni creado correctamente:", cliente);
                continue;
            }

            const clienteId = clienteExistente.cliente_id;

            // 📌 Verificar si el cliente ya está en la campaña
            let clienteCampanhaExistente = null;
            try {
                clienteCampanhaExistente = await prisma.cliente_campanha.findFirst({
                    where: {
                        cliente_id: clienteId,
                        campanha_id: campanhaId,
                    },
                });
            } catch (err) {
                console.error("❌ Error al consultar si el cliente ya está en la campaña:", err);
            }

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
