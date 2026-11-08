import { prisma } from "@/lib/prisma";
import { publishPost, type PublishItem } from "@/lib/social/instagram";
import { renderForInstagram } from "@/lib/social/render";

export type PostMedia = { url: string; kind: "image" | "video"; posterUrl?: string | null; focalX: number; focalY: number; zoom: number };

export const CAPTION_MAX = 2200;
export const HASHTAGS_MAX = 30;

/** The text that goes to Instagram: caption, a blank line, then the hashtags. */
export function fullCaption(caption: string | null, hashtags: string | null) {
  return [caption?.trim(), hashtags?.trim()].filter(Boolean).join("\n\n");
}

export const countHashtags = (text: string | null) => (text?.match(/#[\p{L}\p{N}_]+/gu) ?? []).length;

export function parseMedia(value: unknown): PostMedia[] {
  return Array.isArray(value) ? (value as PostMedia[]).filter((m) => m && typeof m.url === "string") : [];
}

/** Checks Instagram's rules before trying, so the owner gets a clear message instead of an API error. */
export function validatePost(media: PostMedia[], caption: string | null, hashtags: string | null): string | null {
  if (media.length === 0) return "Elige al menos una foto.";
  if (media.length > 10) return "Instagram admite como máximo 10 fotos o vídeos por publicación.";
  if (fullCaption(caption, hashtags).length > CAPTION_MAX) return `El texto pasa de ${CAPTION_MAX} caracteres, el máximo de Instagram.`;
  if (countHashtags(fullCaption(caption, hashtags)) > HASHTAGS_MAX) return `Instagram admite como máximo ${HASHTAGS_MAX} hashtags.`;
  return null;
}

/**
 * Publishes a prepared post: photos are cropped to 1080×1350 JPEG with their
 * framing (identical to the shop), then sent as a photo, carousel or reel.
 * Claims the post first (status PUBLICANDO) so a double click or the
 * scheduler can never publish it twice.
 */
export async function publishSocialPost(id: string): Promise<{ ok: true; permalink?: string } | { ok: false; error: string }> {
  const claimed = await prisma.socialPost.updateMany({
    where: { id, status: { in: ["BORRADOR", "PROGRAMADA", "ERROR"] } },
    data: { status: "PUBLICANDO", instagramPublishError: null },
  });
  if (claimed.count === 0) return { ok: false, error: "Esta publicación ya se está publicando o ya está publicada." };

  const post = await prisma.socialPost.findUniqueOrThrow({ where: { id } });
  const media = parseMedia(post.media);
  const invalid = validatePost(media, post.instagramText, post.hashtags);
  if (invalid) {
    await prisma.socialPost.update({ where: { id }, data: { status: "ERROR", instagramPublishError: invalid } });
    return { ok: false, error: invalid };
  }

  try {
    const items: PublishItem[] = [];
    for (const m of media) {
      items.push(m.kind === "video" ? { url: m.url, kind: "video" } : { url: await renderForInstagram(m.url, m), kind: "image" });
    }
    const { mediaId, permalink } = await publishPost(items, fullCaption(post.instagramText, post.hashtags));
    await prisma.socialPost.update({
      where: { id },
      data: { status: "PUBLICADA", instagramPostId: mediaId, instagramPermalink: permalink ?? null, instagramPublishedAt: new Date() },
    });
    // The product page links to its most recent Instagram post.
    if (post.productId && permalink) await prisma.product.update({ where: { id: post.productId }, data: { instagramUrl: permalink } });
    return { ok: true, permalink };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Instagram no ha aceptado la publicación.";
    await prisma.socialPost.update({ where: { id }, data: { status: "ERROR", instagramPublishError: error } });
    return { ok: false, error };
  }
}

/** Publishes every scheduled post whose time has come. Called every few minutes by the server. */
export async function publishDuePosts() {
  const due = await prisma.socialPost.findMany({ where: { status: "PROGRAMADA", scheduledFor: { lte: new Date() } }, select: { id: true } });
  for (const { id } of due) await publishSocialPost(id);
}
