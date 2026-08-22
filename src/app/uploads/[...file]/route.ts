import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { UPLOADS_DIR } from "@/lib/uploads";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

export async function GET(_req: Request, { params }: { params: Promise<{ file: string[] }> }) {
  const { file } = await params;

  // The URL segments are user input: resolve and confirm the result stays
  // inside the uploads directory before touching the filesystem.
  const target = path.resolve(UPLOADS_DIR, ...file);
  const root = path.resolve(UPLOADS_DIR);
  if (target !== root && !target.startsWith(root + path.sep)) {
    return new NextResponse("No encontrado", { status: 404 });
  }

  const contentType = CONTENT_TYPES[path.extname(target).toLowerCase()];
  if (!contentType) return new NextResponse("No encontrado", { status: 404 });

  try {
    const info = await stat(target);
    if (!info.isFile()) return new NextResponse("No encontrado", { status: 404 });

    const stream = Readable.toWeb(createReadStream(target)) as ReadableStream;
    return new NextResponse(stream, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(info.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("No encontrado", { status: 404 });
  }
}
