/** Yearly "MM-DD" date windows for special dates. Pure functions: usable on the server and in the admin. */

/** "MM-DD" -> comparable number (MMDD). */
function md(value: string): number {
  const [m, d] = value.split("-").map(Number);
  return m * 100 + d;
}

function todayMD(now: Date): number {
  // Spain time, so the switch happens at local midnight, not UTC.
  const parts = new Intl.DateTimeFormat("es-ES", { timeZone: "Europe/Madrid", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return get("month") * 100 + get("day");
}

/** True when today falls in [start, end], also for windows that wrap the new year (Nov -> Jan). */
export function isInWindow(startMD: string, endMD: string, now = new Date()): boolean {
  const t = todayMD(now), s = md(startMD), e = md(endMD);
  return s <= e ? t >= s && t <= e : t >= s || t <= e;
}

export const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

/** "02-07" -> "7 de febrero" */
export function formatMD(value: string): string {
  const [m, d] = value.split("-").map(Number);
  return `${d} de ${MONTHS[m - 1]}`;
}

/** Deadline still ahead (same window)? Avoids "encarga antes del 7 de febrero" on the 10th. */
export function deadlinePending(campaign: { startMD: string; deadlineMD: string | null }, now = new Date()): boolean {
  if (!campaign.deadlineMD) return false;
  return isInWindow(campaign.startMD, campaign.deadlineMD, now);
}

/** Days from today (Madrid) until the next time a "MM-DD" comes round: 0 = today. */
export function daysUntil(value: string, now = new Date()): number {
  const today = new Date(now.toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" }) + "T00:00:00Z");
  const [m, d] = value.split("-").map(Number);
  let next = Date.UTC(today.getUTCFullYear(), m - 1, d);
  if (next < today.getTime()) next = Date.UTC(today.getUTCFullYear() + 1, m - 1, d);
  return Math.round((next - today.getTime()) / 864e5);
}
