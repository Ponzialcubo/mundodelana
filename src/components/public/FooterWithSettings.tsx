import { Footer } from "@/components/public/Footer";
import { getSiteSettings } from "@/lib/seo";
import { prisma } from "@/lib/prisma";

// Thin wrapper so pages under (public) — which is already force-dynamic —
// can render the Footer with live social links without Footer itself
// touching the DB (it's also used from the static /not-found page).
export async function FooterWithSettings() {
  const [{ instagramUrl, tiktokUrl }, categories] = await Promise.all([
    getSiteSettings(),
    prisma.category.findMany({
      where: { products: { some: { publicationStatus: "PUBLICADO" } } },
      orderBy: { order: "asc" },
      select: { slug: true, name: true },
    }),
  ]);
  return <Footer instagramUrl={instagramUrl} tiktokUrl={tiktokUrl} categories={categories} />;
}
