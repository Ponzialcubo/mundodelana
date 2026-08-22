import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";

export async function PATCH(req: Request) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json();

  const settings = await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: body,
    create: { id: 1, ...body },
  });

  return NextResponse.json({ ok: true, settings });
}
