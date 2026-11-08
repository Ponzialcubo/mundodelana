import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";
import { UPLOADS_DIR, MAX_UPLOAD_BYTES } from "@/lib/uploads";
import { randomFilename } from "@/lib/media-processing";

/**
 * Adds one AI-edited photo to the library. Re-encoded to WebP (max 1920px)
 * but NOT cropped: the owner generated it in the exact format she wanted.
 */
export async function POST(req: Request) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const file = (await req.formData()).get("file");
  if (!(file instanceof File) || !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Solo se admiten imágenes" }, { status: 415 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "La imagen es demasiado grande" }, { status: 413 });
  }

  const input = Buffer.from(await file.arrayBuffer());
  const image = sharp(input).rotate().resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true });
  const { data, info } = await image.webp({ quality: 85 }).toBuffer({ resolveWithObject: true });

  await mkdir(UPLOADS_DIR, { recursive: true });
  const filename = randomFilename("webp");
  await writeFile(path.join(UPLOADS_DIR, filename), data);

  const item = await prisma.libraryMedia.create({
    data: { source: "ai", url: `/uploads/${filename}`, width: info.width, height: info.height },
  });
  return NextResponse.json({ id: item.id });
}
