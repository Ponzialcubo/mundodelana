import { SITE_URL } from "@/lib/seo";

const GRAPH_API_VERSION = "v21.0";
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

function requireEnv(name: "INSTAGRAM_PAGE_ACCESS_TOKEN" | "INSTAGRAM_BUSINESS_ACCOUNT_ID"): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
}

/** Turns a relative /uploads/... URL into an absolute one the Graph API can fetch. */
function absoluteUrl(url: string): string {
  return url.startsWith("http") ? url : `${SITE_URL}${url}`;
}

async function graphFetch<T>(path: string, params: Record<string, string>, method: "GET" | "POST" = "GET"): Promise<T> {
  const accessToken = requireEnv("INSTAGRAM_PAGE_ACCESS_TOKEN");
  const url = new URL(`${GRAPH_API_BASE}${path}`);
  const body = new URLSearchParams({ ...params, access_token: accessToken });

  const res = method === "GET"
    ? await fetch(`${url.toString()}?${body.toString()}`)
    : await fetch(url.toString(), { method: "POST", body });

  const json = await res.json();
  if (!res.ok || json.error) {
    const message = json.error?.message ?? `Instagram API error (${res.status})`;
    throw new Error(message);
  }
  return json as T;
}

export type InstagramMedia = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
};

/**
 * Fetches the account's existing posts (photos/videos, captions, likes,
 * comment counts) so the admin can see what's already live on Instagram
 * without leaving the backoffice.
 */
export async function fetchInstagramMedia(limit = 25): Promise<InstagramMedia[]> {
  const igUserId = requireEnv("INSTAGRAM_BUSINESS_ACCOUNT_ID");
  const fields = "caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count";
  const { data } = await graphFetch<{ data: InstagramMedia[] }>(`/${igUserId}/media`, {
    fields,
    limit: String(limit),
  });
  return data;
}

/**
 * Publishes a single photo or video to the Instagram feed.
 *
 * The Content Publishing API only accepts a publicly reachable URL (it
 * fetches the file itself), never raw bytes — which is why this takes the
 * already-uploaded /uploads/... URL rather than a File/Buffer. Publishing is
 * a two-step dance: create a media container, then publish it. A video
 * container needs a short poll because Instagram transcodes it async before
 * it's publishable.
 */
export async function publishToInstagram(params: {
  mediaUrl: string;
  mediaType: "image" | "video";
  caption: string;
}): Promise<{ mediaId: string; permalink?: string }> {
  const igUserId = requireEnv("INSTAGRAM_BUSINESS_ACCOUNT_ID");
  const url = absoluteUrl(params.mediaUrl);

  const containerParams: Record<string, string> =
    params.mediaType === "video"
      ? { video_url: url, media_type: "REELS", caption: params.caption }
      : { image_url: url, caption: params.caption };

  const { id: creationId } = await graphFetch<{ id: string }>(`/${igUserId}/media`, containerParams, "POST");

  if (params.mediaType === "video") {
    await waitUntilContainerReady(creationId);
  }

  const { id: mediaId } = await graphFetch<{ id: string }>(
    `/${igUserId}/media_publish`,
    { creation_id: creationId },
    "POST"
  );

  const { permalink } = await graphFetch<{ permalink?: string }>(`/${mediaId}`, { fields: "permalink" });
  return { mediaId, permalink };
}

const CONTAINER_POLL_INTERVAL_MS = 3000;
const CONTAINER_POLL_TIMEOUT_MS = 90_000;

/** Reels containers transcode asynchronously; publish fails until status is FINISHED. */
async function waitUntilContainerReady(creationId: string): Promise<void> {
  const deadline = Date.now() + CONTAINER_POLL_TIMEOUT_MS;

  while (Date.now() < deadline) {
    const { status_code } = await graphFetch<{ status_code: string }>(`/${creationId}`, {
      fields: "status_code",
    });
    if (status_code === "FINISHED") return;
    if (status_code === "ERROR") throw new Error("Instagram no ha podido procesar el vídeo.");
    await new Promise((resolve) => setTimeout(resolve, CONTAINER_POLL_INTERVAL_MS));
  }

  throw new Error("El vídeo está tardando demasiado en procesarse en Instagram. Inténtalo de nuevo en un minuto.");
}
