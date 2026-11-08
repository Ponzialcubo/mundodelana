import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { UPLOADS_DIR } from "@/lib/uploads";
import { randomFilename } from "@/lib/media-processing";
import { fetchAllInstagramMedia } from "@/lib/social/instagram";

async function download(url: string, extension: string): Promise<{ url: string; buffer: Buffer }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Descarga fallida (${res.status})`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const filename = randomFilename(extension);
  await writeFile(path.join(UPLOADS_DIR, filename), buffer);
  return { url: `/uploads/${filename}`, buffer };
}

export type ImportResult = { imported: number; failed: number; remaining: number };

/**
 * Copies every Instagram photo/video not yet in the library into the uploads
 * volume. Instagram CDN URLs expire after a few days, so files are downloaded
 * rather than referenced, and kept as originals (no 4:5 crop) for later AI
 * editing. Sequential on purpose: keeps memory flat on the VPS.
 *
 * Handles at most `batchSize` new items per call so each request stays well
 * under the proxy timeout; the admin UI calls again while `remaining > 0`.
 */
export async function importFromInstagram(batchSize = 10): Promise<ImportResult> {
  await mkdir(UPLOADS_DIR, { recursive: true });
  const posts = await fetchAllInstagramMedia();

  const items = posts.flatMap((post) => {
    const children = post.media_type === "CAROUSEL_ALBUM" ? post.children?.data ?? [] : [post];
    return children.map((child) => ({ post, child }));
  });

  const existing = new Set(
    (
      await prisma.libraryMedia.findMany({
        where: { instagramMediaId: { in: items.map((i) => i.child.id) } },
        select: { instagramMediaId: true },
      })
    ).map((m) => m.instagramMediaId)
  );

  const pending = items.filter((i) => !existing.has(i.child.id));
  const batch = pending.slice(0, batchSize);
  const result: ImportResult = { imported: 0, failed: 0, remaining: pending.length - batch.length };

  for (const { post, child } of batch) {
    try {
      // Reels with licensed music come without media_url: keep their cover
      // frame as a photo instead, it still shows the piece.
      const isVideo = child.media_type === "VIDEO" && Boolean(child.media_url);
      const source = child.media_url ?? child.thumbnail_url;
      if (!source) throw new Error("Sin archivo ni portada");
      const file = await download(source, isVideo ? "mp4" : "jpg");
      const poster = isVideo && child.thumbnail_url ? await download(child.thumbnail_url, "jpg") : null;
      const meta = await sharp(isVideo ? poster?.buffer : file.buffer).metadata().catch(() => null);

      await prisma.libraryMedia.create({
        data: {
          source: "instagram",
          instagramMediaId: child.id,
          instagramPostId: post.id,
          permalink: post.permalink,
          caption: post.caption ?? null,
          takenAt: new Date(post.timestamp),
          url: file.url,
          mediaType: isVideo ? "VIDEO" : "IMAGE",
          posterUrl: poster?.url ?? null,
          width: meta?.width ?? null,
          height: meta?.height ?? null,
        },
      });
      result.imported++;
    } catch {
      result.failed++;
    }
  }

  return result;
}

/**
 * Turns an Instagram caption into a product name + description: hashtags and
 * @mentions are dropped, the first meaningful line becomes the name.
 */
export function captionToProductDraft(caption: string | null | undefined): { name: string; description: string } {
  const lines = (caption ?? "")
    .split("\n")
    .map((l) => l.replace(/[#@][\p{L}\p{N}_.]+/gu, "").replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const first = lines[0] ?? "";
  const name = first.length > 60 ? `${first.slice(0, 57).trimEnd()}…` : first;
  return { name: name || "Pieza sin nombre", description: lines.join("\n") };
}
