import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";
import { parseMedia, validatePost } from "@/lib/social/publish";

/**
 * Saves the post. `schedule: "ISO date"` programs it (checked against
 * Instagram's rules first); `schedule: null` takes it back to draft.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const post = await prisma.socialPost.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "No existe" }, { status: 404 });
  if (post.status === "PUBLICADA" || post.status === "PUBLICANDO") {
    return NextResponse.json({ error: "Ya está publicada: los cambios se hacen desde la app de Instagram." }, { status: 409 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.media !== undefined) data.media = parseMedia(body.media).slice(0, 10);
  if (body.instagramText !== undefined) data.instagramText = String(body.instagramText ?? "").slice(0, 2200) || null;
  if (body.hashtags !== undefined) data.hashtags = String(body.hashtags ?? "").trim() || null;
  if (body.tiktokText !== undefined) data.tiktokText = String(body.tiktokText ?? "").slice(0, 2200) || null;

  if (body.schedule !== undefined) {
    if (body.schedule === null) {
      Object.assign(data, { status: "BORRADOR", scheduledFor: null });
    } else {
      const when = new Date(body.schedule);
      if (Number.isNaN(when.getTime()) || when.getTime() < Date.now() + 60_000) {
        return NextResponse.json({ error: "Elige una fecha y hora futuras." }, { status: 400 });
      }
      const invalid = validatePost(
        data.media ? parseMedia(data.media) : parseMedia(post.media),
        (data.instagramText as string | null | undefined) ?? post.instagramText,
        (data.hashtags as string | null | undefined) ?? post.hashtags,
      );
      if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });
      Object.assign(data, { status: "PROGRAMADA", scheduledFor: when, instagramPublishError: null });
    }
  }

  await prisma.socialPost.update({ where: { id }, data });
  return NextResponse.json({ ok: true });
}

/** Removes the post from the web. If it was published, it stays on Instagram. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  await prisma.socialPost.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
