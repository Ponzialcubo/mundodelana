import { prisma } from "@/lib/prisma";
import { TEXT_DEFS, type SiteTexts } from "@/lib/site-texts";

/** Every page text: the owner's version when saved, else the default. */
export async function getSiteTexts(): Promise<SiteTexts> {
  const rows = await prisma.siteText.findMany();
  const saved = new Map(rows.map((r) => [r.key, r.value]));
  return Object.fromEntries(TEXT_DEFS.map((d) => [d.key, saved.get(d.key)?.trim() || d.default]));
}
