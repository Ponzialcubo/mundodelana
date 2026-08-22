import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";

export async function POST(req: Request) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { text, author, origin } = await req.json();
  const maxOrder = await prisma.testimonial.aggregate({ _max: { order: true } });

  const testimonial = await prisma.testimonial.create({
    data: { text, author, origin: origin || null, order: (maxOrder._max.order ?? 0) + 1 },
  });

  return NextResponse.json({ ok: true, id: testimonial.id });
}
