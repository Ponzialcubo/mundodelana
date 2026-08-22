import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const { state } = await req.json();

  const sub = await prisma.subscriber.update({ where: { id }, data: { state } });
  return NextResponse.json({ ok: true, id: sub.id });
}
