import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";

export async function POST(req: Request) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { question, answer } = await req.json();
  const maxOrder = await prisma.faq.aggregate({ _max: { order: true } });

  const faq = await prisma.faq.create({
    data: { question, answer, order: (maxOrder._max.order ?? 0) + 1 },
  });

  return NextResponse.json({ ok: true, id: faq.id });
}
