import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";
import { UPLOADS_DIR } from "@/lib/uploads";
import { createZip } from "@/lib/zip";
import { BUNDLE_README, buildImageEditPrompt } from "@/lib/image-edit-prompt";

const MAX_ITEMS = 40;

/** ZIP with each selected original photo plus its ready-to-paste AI prompt. */
export async function POST(req: Request) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { ids } = (await req.json()) as { ids: string[] };
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "Selecciona al menos una foto" }, { status: 400 });
  }
  if (ids.length > MAX_ITEMS) {
    return NextResponse.json({ error: `Máximo ${MAX_ITEMS} fotos por paquete` }, { status: 400 });
  }

  const items = await prisma.libraryMedia.findMany({ where: { id: { in: ids }, mediaType: "IMAGE" } });
  if (items.length === 0) return NextResponse.json({ error: "Solo se pueden exportar fotos, no vídeos" }, { status: 400 });

  const files: { name: string; data: Buffer }[] = [{ name: "LEEME.txt", data: Buffer.from(BUNDLE_README, "utf8") }];
  for (const [index, item] of items.entries()) {
    const base = `foto-${String(index + 1).padStart(2, "0")}`;
    const ext = path.extname(item.url) || ".jpg";
    files.push({ name: `${base}${ext}`, data: await readFile(path.join(UPLOADS_DIR, path.basename(item.url))) });
    files.push({ name: `${base}.txt`, data: Buffer.from(buildImageEditPrompt(item.caption), "utf8") });
  }

  const date = new Date().toISOString().slice(0, 10);
  return new Response(new Uint8Array(createZip(files)), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="mundolana-fotos-ia-${date}.zip"`,
    },
  });
}
