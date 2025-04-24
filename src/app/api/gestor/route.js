import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Solo para solicitudes GET
export async function GET() {
  try {
    const gestores = await prisma.cliente.findMany({
      where: { gestor: { not: "" } },
      distinct: ["gestor"],
      select: { gestor: true },
    });
    console.log("estos sons los gesorres",gestores);
    // Retorna solo los nombres del gestor
    return NextResponse.json(gestores.map((g) => g.gestor));
  } catch (error) {
    console.error("❌ Error al obtener gestores:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
