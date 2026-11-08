import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";

/** Mark a message as read, or save the reply the customer will see in their account. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const body = (await req.json()) as { read?: boolean; reply?: string };
  const reply = body.reply?.trim().slice(0, 4000);

  await prisma.contactMessage.update({
    where: { id },
    data: reply
      ? { reply, repliedAt: new Date(), replySeenAt: null, readAt: new Date() }
      : { readAt: body.read === false ? null : new Date() },
  });
  return NextResponse.json({ ok: true });
}
