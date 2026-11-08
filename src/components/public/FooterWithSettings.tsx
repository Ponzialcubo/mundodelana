import { Footer } from "@/components/public/Footer";
import { getSiteSettings } from "@/lib/seo";
import { SEGMENTS } from "@/lib/catalog-segments";

// Thin wrapper so pages under (public) — which is already force-dynamic —
// can render the Footer with live social links without Footer itself
// touching the DB (it's also used from the static /not-found page).
export async function FooterWithSettings() {
  const { instagramUrl, tiktokUrl } = await getSiteSettings();
  // The five shop blocks instead of every category: a short, scannable list.
  const links = SEGMENTS.map((s) => ({ href: `/catalogo#${s.key}`, name: s.title }));
  return <Footer instagramUrl={instagramUrl} tiktokUrl={tiktokUrl} shopLinks={links} />;
}
