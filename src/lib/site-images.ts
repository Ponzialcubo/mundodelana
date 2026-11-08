import { prisma } from "@/lib/prisma";

import { isLive, todayMadrid } from "@/lib/site-pages";

export { SITE_IMAGE_SLOTS, SITE_IMAGE_KEYS, SITE_PAGES, slotByKey, isLive } from "@/lib/site-pages";
export type { SiteImageSlot, SitePage, PageSection } from "@/lib/site-pages";

export type SiteImageValue = { url: string; focalX: number; focalY: number; zoom: number };
export type SiteImageMeta = SiteImageValue & { hidden: boolean; startsOn: string | null; endsOn: string | null };
export type SiteImages = Partial<Record<string, SiteImageMeta>>;
/** A spot with its optional phone version. */
export type ResponsiveImage = { desktop: SiteImageValue; mobile?: SiteImageValue };

export function responsive(images: SiteImages, key: string): ResponsiveImage | undefined {
  const desktop = images[key];
  return desktop ? { desktop, mobile: images[`${key}-m`] } : undefined;
}

/** Home banners in order: only the uploaded ones that are switched on and in their dates. */
export function heroSlides(images: SiteImages): ResponsiveImage[] {
  const today = todayMadrid();
  return ["hero", "hero-2", "hero-3", "hero-4"]
    .filter((k) => images[k] && isLive(images[k]!, today))
    .map((k) => responsive(images, k)!)
}

const day = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);

export async function getSiteImages(): Promise<SiteImages> {
  const rows = await prisma.siteImage.findMany();
  return Object.fromEntries(
    rows.map((r) => [r.key, { url: r.url, focalX: r.focalX, focalY: r.focalY, zoom: r.zoom, hidden: r.hidden, startsOn: day(r.startsOn), endsOn: day(r.endsOn) }]),
  );
}
