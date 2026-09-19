import { randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import sharp from "sharp";

const execFileAsync = promisify(execFile);

/**
 * Target ceiling for a processed photo. Not a hard cutoff: quality only goes
 * down to MIN_QUALITY, so a very busy/detailed photo may end up a bit above
 * this rather than visibly degraded.
 */
const IMAGE_TARGET_BYTES = 300 * 1024;
const IMAGE_MAX_DIMENSION = 1920;
const IMAGE_START_QUALITY = 82;
const IMAGE_MIN_QUALITY = 55;

/**
 * Re-encodes an uploaded photo as WebP, resized to a sane max dimension and
 * compressed to land near IMAGE_TARGET_BYTES. Runs entirely in-process (no
 * temp files) since sharp works on buffers directly.
 */
export async function processImage(input: Buffer): Promise<{ buffer: Buffer; extension: "webp" }> {
  const resized = sharp(input).rotate().resize({
    width: IMAGE_MAX_DIMENSION,
    height: IMAGE_MAX_DIMENSION,
    fit: "inside",
    withoutEnlargement: true,
  });

  let quality = IMAGE_START_QUALITY;
  let output = await resized.clone().webp({ quality }).toBuffer();

  while (output.length > IMAGE_TARGET_BYTES && quality > IMAGE_MIN_QUALITY) {
    quality -= 8;
    output = await resized.clone().webp({ quality }).toBuffer();
  }

  return { buffer: output, extension: "webp" };
}

/**
 * Transcodes an uploaded video to a web-friendly H.264/AAC MP4 with a capped
 * bitrate and resolution, plus a JPEG poster frame grabbed at the very first
 * frame (some product clips are under a second long, so seeking further in
 * would find nothing). ffmpeg only works on real files, so this uses a
 * scratch dir under the OS temp folder (cleaned up in a finally) rather than
 * the uploads volume.
 */
export async function processVideo(
  input: Buffer,
  sourceExtension: string
): Promise<{ video: Buffer; poster: Buffer }> {
  const dir = await mkdtemp(path.join(tmpdir(), "md-video-"));
  const inputPath = path.join(dir, `in.${sourceExtension}`);
  const outputPath = path.join(dir, "out.mp4");
  const posterPath = path.join(dir, "poster.jpg");

  try {
    await writeFile(inputPath, input);

    // -crf 28 + veryfast: decent quality-per-byte for product clips, not
    // archival quality. -vf caps resolution without upscaling smaller clips.
    // -movflags faststart lets the browser start playback before the full
    // file has downloaded.
    await execFileAsync("ffmpeg", [
      "-y",
      "-i", inputPath,
      "-vf", "scale='min(1280,iw)':'min(1280,ih)':force_original_aspect_ratio=decrease",
      "-c:v", "libx264",
      "-preset", "veryfast",
      "-crf", "28",
      "-c:a", "aac",
      "-b:a", "128k",
      "-movflags", "+faststart",
      outputPath,
    ]);

    await execFileAsync("ffmpeg", [
      "-y",
      "-i", outputPath,
      "-frames:v", "1",
      "-update", "1",
      "-q:v", "4",
      posterPath,
    ]);

    const [video, poster] = await Promise.all([readFile(outputPath), readFile(posterPath)]);
    return { video, poster };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

export function randomFilename(extension: string): string {
  return `${randomUUID()}.${extension}`;
}
