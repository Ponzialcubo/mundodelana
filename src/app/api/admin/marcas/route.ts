import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";

export async function POST(req: Request) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json();
  const maxOrder = await prisma.brand.aggregate({ _max: { order: true } });

  const brand = await prisma.brand.create({
    data: {
      name: body.name,
      slug: body.slug,
      order: (maxOrder._max.order ?? 0) + 1,
      metaTitle: body.metaTitle || null,
      metaDescription: body.metaDescription || null,
    },
  });

  return NextResponse.json({ ok: true, id: brand.id });
}
