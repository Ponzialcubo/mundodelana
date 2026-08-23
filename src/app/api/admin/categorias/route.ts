import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";

export async function POST(req: Request) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json();
  const maxOrder = await prisma.category.aggregate({ _max: { order: true } });

  const category = await prisma.category.create({
    data: {
      name: body.name,
      slug: body.slug,
      description: body.description || null,
      coverImage: body.coverImage || null,
      metaTitle: body.metaTitle || null,
      metaDescription: body.metaDescription || null,
      order: (maxOrder._max.order ?? 0) + 1,
    },
  });

  return NextResponse.json({ ok: true, id: category.id });
}
