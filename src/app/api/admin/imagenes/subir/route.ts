import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { UPLOADS_DIR, MAX_UPLOAD_BYTES } from "@/lib/uploads";
import { processImageUncropped, randomFilename } from "@/lib/media-processing";

/** Uploads an improved/generated image: optimized to WebP, never cropped. */
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

  try {
    const { buffer } = await processImageUncropped(Buffer.from(await file.arrayBuffer()));
    await mkdir(UPLOADS_DIR, { recursive: true });
    const filename = randomFilename("webp");
    await writeFile(path.join(UPLOADS_DIR, filename), buffer);
    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch {
    return NextResponse.json({ error: "No se ha podido leer la imagen" }, { status: 400 });
  }
}
