import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { UPLOADS_DIR, MAX_UPLOAD_BYTES, resolveMediaKind } from "@/lib/uploads";

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

  // The filename is attacker-controlled: never let it reach the path. Only the
  // extension is derived from it, and it is validated against the media type.
  await mkdir(UPLOADS_DIR, { recursive: true });
  const filename = `${randomUUID()}.${kind.extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOADS_DIR, filename), buffer);

  return NextResponse.json({ url: `/uploads/${filename}`, mediaType: kind.mediaType });
}
