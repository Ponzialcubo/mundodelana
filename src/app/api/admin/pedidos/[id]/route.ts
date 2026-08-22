import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const order = await prisma.order.update({
    where: { id },
    data: {
      ...(body.state ? { state: body.state } : {}),
      ...(body.internalNotes !== undefined ? { internalNotes: body.internalNotes } : {}),
    },
  });

  return NextResponse.json({ ok: true, id: order.id });
}
