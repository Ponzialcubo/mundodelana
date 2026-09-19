import { Header } from "@/components/public/Header";
import { WhatsAppFloat } from "@/components/public/WhatsAppFloat";
import { OrganizationJsonLd } from "@/components/OrganizationJsonLd";
import { getSiteSettings, phoneDigits } from "@/lib/seo";
import { getCustomerSession } from "@/lib/session";

// Contact info (phone, WhatsApp link, JSON-LD) is edited live from the admin
// panel, so every public page renders on each request instead of being
// prerendered at build time — otherwise a phone change wouldn't show up
// until the next deploy.
export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [{ phone }, customerId] = await Promise.all([getSiteSettings(), getCustomerSession()]);

  return (
    <div className="flex min-h-screen flex-col bg-cream text-ink">
      <OrganizationJsonLd />
      <Header loggedIn={Boolean(customerId)} />
      <main className="flex-1 bg-surface">{children}</main>
      <WhatsAppFloat phone={phoneDigits(phone)} />
    </div>
  );
}
