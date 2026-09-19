import { Footer } from "@/components/public/Footer";
import { getSiteSettings } from "@/lib/seo";

// Thin wrapper so pages under (public) — which is already force-dynamic —
// can render the Footer with live social links without Footer itself
// touching the DB (it's also used from the static /not-found page).
export async function FooterWithSettings() {
  const { instagramUrl, tiktokUrl } = await getSiteSettings();
  return <Footer instagramUrl={instagramUrl} tiktokUrl={tiktokUrl} />;
}
