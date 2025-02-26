import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
require('dotenv').config();
import { getToken } from "next-auth/jwt";



const uri = process.env.DATABASE_URL_MONGODB;
const clientPromise = new MongoClient(uri).connect();

export async function GET(request, context) {
    try {

        

    const params = await context.params;  
      const { id } = params; // Obtener el ID del cliente desde la URL
  
      // Verificar si el cliente existe en la base de datos
      const cliente = await prisma.cliente.findUnique({
        where: { cliente_id: parseInt(id) },
        select: {
          cliente_id: true,
          nombre: true,
          apellido: true,
          celular: true,
        },
      });
  
      if (!cliente) {
        return NextResponse.json({ message: "Cliente no encontrado" }, { status: 404 });
      }
  
      // Conectar a MongoDB y obtener las conversaciones del cliente
      const mongoClient = await clientPromise;
      const db = mongoClient.db(process.env.MONGODB_DB);
      const conversaciones = await db.collection("clientes").findOne(
        { celular: cliente.celular },
        { projection: { conversaciones: 1 } }
      );
      console.log("conversion",conversaciones);
  
      return NextResponse.json({
        cliente: {
          nombreCompleto: `${cliente.nombre} ${cliente.apellido}`,
          celular: cliente.celular,
        },
        conversaciones: conversaciones?.conversaciones || [],
      });
    } catch (error) {
      console.error("Error al obtener conversaciones del cliente:", error);
      return NextResponse.json(
        { message: "Error interno del servidor al obtener las conversaciones" },
        { status: 500 }
      );
    }
  }