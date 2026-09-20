import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";
import { publishToInstagram } from "@/lib/social/instagram";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const post = await prisma.socialPost.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Publicación no encontrada" }, { status: 404 });
  if (!post.mediaUrl || !post.mediaType) {
    return NextResponse.json({ error: "Esta publicación no tiene foto o vídeo." }, { status: 400 });
  }
  if (!post.instagramText?.trim()) {
    return NextResponse.json({ error: "Falta el texto para Instagram." }, { status: 400 });
  }

  try {
    const { mediaId, permalink } = await publishToInstagram({
      mediaUrl: post.mediaUrl,
      mediaType: post.mediaType === "video" ? "video" : "image",
      caption: post.instagramText,
    });

    await prisma.socialPost.update({
      where: { id },
      data: {
        instagramPostId: mediaId,
        instagramPermalink: permalink ?? null,
        instagramPublishedAt: new Date(),
        instagramPublishError: null,
      },
    });

    return NextResponse.json({ ok: true, mediaId, permalink });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se ha podido publicar en Instagram.";
    await prisma.socialPost.update({ where: { id }, data: { instagramPublishError: message } });
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
