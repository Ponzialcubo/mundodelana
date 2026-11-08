import { prisma } from "@/lib/prisma";
import { isInWindow } from "@/lib/campaign-dates";

export { isInWindow, formatMD, deadlinePending, daysUntil, MONTHS } from "@/lib/campaign-dates";

/** The campaign currently running (first by order), or null. */
export async function getActiveCampaign(now = new Date()) {
  const campaigns = await prisma.campaign.findMany({ where: { active: true }, orderBy: { order: "asc" } });
  return campaigns.find((c) => isInWindow(c.startMD, c.endMD, now)) ?? null;
}
