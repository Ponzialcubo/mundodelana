import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { UPLOADS_DIR, MAX_UPLOAD_BYTES, resolveMediaKind } from "@/lib/uploads";
import { processImage, processVideo, randomFilename } from "@/lib/media-processing";

export async function POST(req: Request) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No se ha recibido ningún archivo" }, { status: 400 });
  }

  const kind = resolveMediaKind(file.type);
  if (!kind) {
    return NextResponse.json(
      { error: "Formato no admitido. Usa JPG, PNG, WebP, GIF, MP4, WebM o MOV." },
      { status: 415 }
    );
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `El archivo supera el límite de ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB.` },
      { status: 413 }
    );
  }

  await mkdir(UPLOADS_DIR, { recursive: true });
  const inputBuffer = Buffer.from(await file.arrayBuffer());

  if (kind.mediaType === "image") {
    const { buffer, extension } = await processImage(inputBuffer);
    const filename = randomFilename(extension);
    await writeFile(path.join(UPLOADS_DIR, filename), buffer);
    return NextResponse.json({ url: `/uploads/${filename}`, mediaType: "image" });
  }

  const { video, poster } = await processVideo(inputBuffer, kind.extension);
  const videoFilename = randomFilename("mp4");
  const posterFilename = randomFilename("jpg");
  await Promise.all([
    writeFile(path.join(UPLOADS_DIR, videoFilename), video),
    writeFile(path.join(UPLOADS_DIR, posterFilename), poster),
  ]);

  return NextResponse.json({
    url: `/uploads/${videoFilename}`,
    posterUrl: `/uploads/${posterFilename}`,
    mediaType: "video",
  });
}
