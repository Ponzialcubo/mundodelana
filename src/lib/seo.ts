import { prisma } from "@/lib/prisma";

/**
 * Public site URL. Comes from NEXTAUTH_URL (already set for auth cookies),
 * falls back to the production domain. Never a trailing slash.
 */
export const SITE_URL = (process.env.NEXTAUTH_URL || "https://mundodelana.sergiolab.es").replace(/\/$/, "");

export const SITE_NAME = "Mundodelana";

/** Trim a string to `max` chars without cutting a word in half. */
function clamp(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim() + "…";
}

/**
 * Build a template-based meta title/description for a product.
 * Used both as a fallback in metadata and to auto-fill on create.
 */
export function productMetaFallback(p: {
  name: string;
  shortDescription?: string | null;
  description?: string | null;
}): { metaTitle: string; metaDescription: string } {
  const metaTitle = clamp(`${p.name} · ${SITE_NAME}`, 60);
  const source = p.shortDescription?.trim() || p.description?.trim() || "";
  const metaDescription = source
    ? clamp(source, 155)
    : clamp(`${p.name}, tejido a mano en algodón. Envíos a toda España desde Galicia.`, 155);
  return { metaTitle, metaDescription };
}

let cachedDefaults: { title: string; description: string } | null = null;

/** Site-wide default meta from SiteSettings, with a hardcoded safety net. */
export async function getDefaultMeta() {
  if (cachedDefaults) return cachedDefaults;
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  cachedDefaults = {
    title:
      settings?.defaultMetaTitle ||
      "Mundodelana · crochet y amigurumis hechos a mano en España",
    description:
      settings?.defaultMetaDescription ||
      "Amigurumis, decoración y piezas de bebé tejidas a mano por encargo, con algodón 100 % de alta calidad. Envíos a toda España desde Galicia.",
  };
  return cachedDefaults;
}
