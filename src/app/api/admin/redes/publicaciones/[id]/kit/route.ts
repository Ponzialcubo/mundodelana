import { readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";
import { UPLOADS_DIR } from "@/lib/uploads";
import { createZip } from "@/lib/zip";
import { fullCaption, parseMedia } from "@/lib/social/publish";
import { renderForInstagram } from "@/lib/social/render";
import { slugify } from "@/lib/slugify";

/**
 * Everything to post by hand (TikTok, stories, or Instagram from the phone):
 * the photos already cropped to 1080×1350 JPEG and the texts.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminId = await getAdminSession();
  if (!adminId) return new Response("No autenticado", { status: 401 });

  const { id } = await params;
  const post = await prisma.socialPost.findUnique({ where: { id }, include: { product: { select: { name: true } } } });
  if (!post) return new Response("No existe", { status: 404 });

  const files: { name: string; data: Buffer }[] = [];
  for (const [i, m] of parseMedia(post.media).entries()) {
    const n = String(i + 1).padStart(2, "0");
    if (m.kind === "video") {
      files.push({ name: `${n}-video${path.extname(m.url) || ".mp4"}`, data: await readFile(path.join(UPLOADS_DIR, path.basename(m.url))) });
    } else {
      const jpg = await renderForInstagram(m.url, m);
      files.push({ name: `${n}-foto.jpg`, data: await readFile(path.join(UPLOADS_DIR, "ig", path.basename(jpg))) });
    }
  }
  files.push({ name: "instagram.txt", data: Buffer.from(fullCaption(post.instagramText, post.hashtags), "utf8") });
  if (post.tiktokText) files.push({ name: "tiktok.txt", data: Buffer.from(post.tiktokText, "utf8") });

  const name = slugify(post.product?.name ?? "publicacion") || "publicacion";
  return new Response(new Uint8Array(createZip(files)), {
    headers: { "Content-Type": "application/zip", "Content-Disposition": `attachment; filename="${name}-instagram.zip"` },
  });
}
