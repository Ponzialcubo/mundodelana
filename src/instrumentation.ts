/**
 * Runs once when the server starts. Instagram has no scheduling of its own, so
 * the app checks every few minutes for posts whose scheduled time has passed.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || !process.env.INSTAGRAM_PAGE_ACCESS_TOKEN) return;

  const { publishDuePosts } = await import("@/lib/social/publish");
  const EVERY_MS = 3 * 60 * 1000;
  const tick = () => publishDuePosts().catch((err) => console.error("[instagram] programadas:", err));
  setInterval(tick, EVERY_MS);
  setTimeout(tick, 30_000); // also shortly after a deploy, in case one was due meanwhile
}
