import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function nextRef(prefix: "ENC" | "RES") {
  const year = new Date().getFullYear();
  const count = await prisma.order.count({
    where: { ref: { startsWith: `${prefix}-${year}-` } },
  });
  const n = (count + 1).toString().padStart(3, "0");
  return `${prefix}-${year}-${n}`;
}

export async function POST(req: Request) {
  const body = await req.json();
  const { requestText, name, phone } = body;

  if (!requestText || !name || !phone) {
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
  }

  const ref = await nextRef("ENC");

  const order = await prisma.order.create({
    data: {
      ref,
      clientName: name,
      clientPhone: phone,
      requestText,
      type: "PERSONALIZADO",
      state: "NUEVO",
    },
  });

  return NextResponse.json({ ok: true, ref: order.ref });
}
