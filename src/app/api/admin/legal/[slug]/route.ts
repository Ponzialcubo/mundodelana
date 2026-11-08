import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";

export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { slug } = await params;
  const body = await req.json();

  const page = await prisma.legalPage.update({
    where: { slug },
    data: {
      title: body.title,
      content: body.content,
    },
  });

  return NextResponse.json({ ok: true, id: page.id });
}
