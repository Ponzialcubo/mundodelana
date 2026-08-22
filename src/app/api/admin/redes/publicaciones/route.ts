import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";

export async function POST(req: Request) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json();
  if (!body.productId) return NextResponse.json({ error: "Falta el producto" }, { status: 400 });

  const post = await prisma.socialPost.create({
    data: {
      productId: body.productId,
      mediaUrl: body.mediaUrl || null,
      mediaType: body.mediaType || null,
      instagramText: body.instagramText || null,
      tiktokText: body.tiktokText || null,
      scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : null,
      notes: body.notes || null,
    },
  });

  return NextResponse.json({ ok: true, id: post.id });
}
