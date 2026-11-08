import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { UPLOADS_DIR } from "@/lib/uploads";
import type { Framing } from "@/lib/framing";

/** Instagram's portrait feed size: 4:5, the same proportion as the shop's product photos. */
export const IG_WIDTH = 1080;
export const IG_HEIGHT = 1350;

/**
 * Crops a photo to Instagram's 1080×1350 JPEG exactly as the shop shows it:
 * object-fit cover + object-position at the focal point, then scaled around
 * that point by the zoom (the same maths as frameStyle in the browser).
 * Instagram only accepts JPEG, so this is also the format conversion.
 * Results are cached by content: same photo + same framing = same file.
 */
export async function renderForInstagram(url: string, framing: Framing): Promise<string> {
  const source = path.join(UPLOADS_DIR, path.basename(url));
  const zoom = framing.zoom && framing.zoom > 1 ? framing.zoom : 1;
  const key = createHash("sha1").update(`${path.basename(url)}|${framing.focalX}|${framing.focalY}|${zoom}`).digest("hex").slice(0, 20);
  const dir = path.join(UPLOADS_DIR, "ig");
  const file = path.join(dir, `${key}.jpg`);
  const publicUrl = `/uploads/ig/${key}.jpg`;

  try {
    await stat(file);
    return publicUrl;
  } catch {
    // not rendered yet
  }

  const input = await readFile(source);
  const image = sharp(input).rotate(); // apply EXIF orientation like the browser does
  const meta = await image.metadata();
  const portrait = (meta.orientation ?? 1) >= 5; // rotated 90°: width and height swap
  const w = (portrait ? meta.height : meta.width) ?? IG_WIDTH;
  const h = (portrait ? meta.width : meta.height) ?? IG_HEIGHT;

  // object-fit: cover
  const cover = Math.max(IG_WIDTH / w, IG_HEIGHT / h);
  const scale = cover * zoom;
  const rw = w * scale;
  const rh = h * scale;
  // object-position puts the focal point of the photo at the same % of the box;
  // scaling around that point keeps it there.
  const originX = framing.focalX * IG_WIDTH;
  const originY = framing.focalY * IG_HEIGHT;
  const left = originX + zoom * ((IG_WIDTH - w * cover) * framing.focalX - originX);
  const top = originY + zoom * ((IG_HEIGHT - h * cover) * framing.focalY - originY);

  const resizedW = Math.max(IG_WIDTH, Math.round(rw));
  const resizedH = Math.max(IG_HEIGHT, Math.round(rh));
  const cropLeft = Math.min(Math.max(0, Math.round(-left)), resizedW - IG_WIDTH);
  const cropTop = Math.min(Math.max(0, Math.round(-top)), resizedH - IG_HEIGHT);

  const output = await image
    .resize(resizedW, resizedH)
    .extract({ left: cropLeft, top: cropTop, width: IG_WIDTH, height: IG_HEIGHT })
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();

  await mkdir(dir, { recursive: true });
  await writeFile(file, output);
  return publicUrl;
}
