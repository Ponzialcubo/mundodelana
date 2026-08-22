import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  await prisma.socialPost.update({
    where: { id },
    data: {
      ...(body.mediaUrl !== undefined ? { mediaUrl: body.mediaUrl || null } : {}),
      ...(body.mediaType !== undefined ? { mediaType: body.mediaType || null } : {}),
      ...(body.instagramText !== undefined ? { instagramText: body.instagramText || null } : {}),
      ...(body.tiktokText !== undefined ? { tiktokText: body.tiktokText || null } : {}),
      ...(body.notes !== undefined ? { notes: body.notes || null } : {}),
      ...(body.scheduledFor !== undefined
        ? { scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : null }
        : {}),
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  await prisma.socialPost.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
