import { prisma } from "@/lib/prisma";

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

const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

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

/** The campaign currently running (first by order), or null. */
export async function getActiveCampaign(now = new Date()) {
  const campaigns = await prisma.campaign.findMany({ where: { active: true }, orderBy: { order: "asc" } });
  return campaigns.find((c) => isInWindow(c.startMD, c.endMD, now)) ?? null;
}
