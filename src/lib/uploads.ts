import path from "node:path";

/**
 * Media uploaded from the backoffice lives outside `public/` in the repo so a
 * rebuild never wipes it: in production this path is a Docker volume.
 */
export const UPLOADS_DIR = process.env.UPLOADS_DIR ?? path.join(process.cwd(), "public", "uploads");

export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

const ALLOWED_TYPES: Record<string, { extension: string; mediaType: "image" | "video" }> = {
  "image/jpeg": { extension: "jpg", mediaType: "image" },
  "image/png": { extension: "png", mediaType: "image" },
  "image/webp": { extension: "webp", mediaType: "image" },
  "image/gif": { extension: "gif", mediaType: "image" },
  "video/mp4": { extension: "mp4", mediaType: "video" },
  "video/webm": { extension: "webm", mediaType: "video" },
  "video/quicktime": { extension: "mov", mediaType: "video" },
};

export function resolveMediaKind(contentType: string) {
  return ALLOWED_TYPES[contentType] ?? null;
}
