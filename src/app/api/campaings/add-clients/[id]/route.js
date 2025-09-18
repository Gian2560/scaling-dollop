

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
      const celularNormalizado = normalizePhone(c.celular);
      if (!celularNormalizado) {
        console.log(`⚠️ Cliente sin celular válido - no se creará:`, c.nombre || c.documento_identidad);
        return null; // No crear cliente si no tiene celular
      }
  
      const payload = {
        Codigo_Asociado: toStr(c.Codigo_Asociado),
        documento_identidad: toStr(c.documento_identidad),
        nombre: s(c.nombre),
        apellido: toStr(c.Apellido_Paterno),
        celular: celularNormalizado,
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
    // 1. Upsert clientes en paralelo
    const clienteIds = (await Promise.all(items.map(getClienteId))).filter(Boolean);

    // 2. Obtén los ya asociados en un solo query
    const yaAsociados = await prisma.cliente_campanha.findMany({
      where: {
        campanha_id: campanhaId,
        cliente_id: { in: clienteIds },
      },
      select: { cliente_id: true },
    });
    const yaIds = new Set(yaAsociados.map(x => x.cliente_id));

    // 3. Filtra los que faltan asociar
    const nuevosIds = clienteIds.filter(id => !yaIds.has(id));

    // 4. Inserta en batch los nuevos
    if (nuevosIds.length) {
      await prisma.cliente_campanha.createMany({
        data: nuevosIds.map(id => ({ cliente_id: id, campanha_id: campanhaId })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json({ ok: true, campanha_id: campanhaId, count: clienteIds.length, clientes: clienteIds });
  } catch (error) {
    console.error("❌ Error al asociar clientes a campaña:", error.message || error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
