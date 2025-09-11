// import { NextResponse } from 'next/server';
// import prisma from '@/lib/prisma';

// const normalizePhone = v => {
//   if (!v) return null;
//   const digits = String(v).replace(/\D/g, '');
//   if (digits.startsWith('51')) return `+${digits}`;
//   return `+51${digits}`;
// };

// export async function POST(req) {
//   try {
//     const { clients } = await req.json();
//     if (!Array.isArray(clients) || !clients.length) {
//       return NextResponse.json({ message: 'Sin clientes' }, { status: 400 });
//     }

//     const results = [];
//     for (const c of clients) {
//       const payload = {
//         Codigo_Asociado: c.Codigo_Asociado ?? null,
//         documento_identidad: c.N_Doc ?? null,
//         nombre: c.Nombres ?? null,
//         apellido: c.Apellido_Paterno ?? null,
//         celular: normalizePhone(c.Telf_SMS),
//         Segmento: c.Segmento ?? null,
//         email: c.E_mail ?? null,
//         Zona: c.Zona ?? null,
//         gestor: c.Asesor ?? null,
//       };

//       // Busca por documento, o por celular, o por Codigo_Asociado
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
//         results.push({ action: 'create', cliente_id: created.cliente_id });
//       } else {
//         const updated = await prisma.cliente.update({
//           where: { cliente_id: existing.cliente_id },
//           data: {
//             // solo estos campos pueden cambiar
//             Segmento: payload.Segmento,
//             Zona: payload.Zona,
//             gestor: payload.gestor,
//             // si quieres además email/celular cuando lleguen no nulos, descomenta:
//             // email: payload.email ?? existing.email,
//             // celular: payload.celular ?? existing.celular,
//           }
//         });
//         results.push({ action: 'update', cliente_id: updated.cliente_id });
//       }
//     }

//     return NextResponse.json({ ok: true, count: results.length, results });
//   } catch (e) {
//     console.error(e);
//     return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
//   }
// }

// src/app/api/campaings/sync-clients/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const toStr = (v) => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s.length ? s : null;
};

const normalizePhone = (v) => {
  const digits = toStr(v)?.replace(/\D/g, "") || "";
  if (!digits) return null;
  const withCc = digits.startsWith("51") ? digits : `51${digits}`;
  return `+${withCc}`;
};

export async function POST(req) {
  try {
    const { clients } = await req.json();
    if (!Array.isArray(clients) || !clients.length) {
      return NextResponse.json({ message: "Sin clientes" }, { status: 400 });
    }

    const results = [];

    for (const c of clients) {
      // Mapea y convierte tipos
      const payload = {
        Codigo_Asociado: toStr(c.Codigo_Asociado),
        documento_identidad: toStr(c.documento_identidad),               // <-- A STRING
        nombre: toStr(c.nombre),
        celular: normalizePhone(c.celular),
        Segmento: toStr(c.Segmento),
        email: toStr(c.email),
        Zona: toStr(c.Zona),
        gestor: toStr(c.gestor),
      };

      // Construye OR sin valores nulos/vacíos
      const orClauses = [];
      if (payload.documento_identidad) orClauses.push({ documento_identidad: payload.documento_identidad });
      if (payload.celular)             orClauses.push({ celular: payload.celular });
      if (payload.Codigo_Asociado)     orClauses.push({ Codigo_Asociado: payload.Codigo_Asociado });

      const existing = orClauses.length
        ? await prisma.cliente.findFirst({ where: { OR: orClauses } })
        : null;

      if (!existing) {
        const created = await prisma.cliente.create({ data: payload });
        results.push({ action: "create", cliente_id: created.cliente_id });
      } else {
        const updated = await prisma.cliente.update({
          where: { cliente_id: existing.cliente_id },
          data: {
            Segmento: payload.Segmento,
            Zona: payload.Zona,
            gestor: payload.gestor,
            // Si quieres refrescar también email/celular cuando lleguen válidos, descomenta:
            // email: payload.email ?? existing.email,
            // celular: payload.celular ?? existing.celular,
          },
        });
        results.push({ action: "update", cliente_id: updated.cliente_id });
      }
    }

    return NextResponse.json({ ok: true, count: results.length, results });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
