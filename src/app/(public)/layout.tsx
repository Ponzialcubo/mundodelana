import { Header, type MenuSegment } from "@/components/public/Header";
import { AnnouncementBar } from "@/components/public/AnnouncementBar";
import { WhatsAppFloat } from "@/components/public/WhatsAppFloat";
import { OrganizationJsonLd } from "@/components/OrganizationJsonLd";
import { getSiteSettings, phoneDigits } from "@/lib/seo";
import { getCustomerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { SEGMENTS } from "@/lib/catalog-segments";
import { deadlinePending, formatMD, getActiveCampaign } from "@/lib/campaigns";

// Contact info (phone, WhatsApp link, JSON-LD) is edited live from the admin
// panel, so every public page renders on each request instead of being
// prerendered at build time — otherwise a phone change wouldn't show up
// until the next deploy.
export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [{ phone, instagramUrl }, customerId, categories, campaign] = await Promise.all([
    getSiteSettings(),
    getCustomerSession(),
    prisma.category.findMany({
      orderBy: { order: "asc" },
      select: { name: true, slug: true, _count: { select: { products: { where: { publicationStatus: "PUBLICADO" } } } } },
    }),
    getActiveCampaign(),
  ]);

  const withCount = categories.filter((c) => c._count.products > 0).map((c) => ({ name: c.name, slug: c.slug, count: c._count.products }));
  const grouped = new Set(SEGMENTS.flatMap((s) => s.slugs));
  const segments: MenuSegment[] = [
    ...SEGMENTS.map((s) => ({ key: s.key, title: s.title, categories: withCount.filter((c) => s.slugs.includes(c.slug)) })),
    { key: "mas", title: "Más", categories: withCount.filter((c) => !grouped.has(c.slug)) },
  ].filter((s) => s.categories.length > 0);

  return (
    <div className="flex min-h-screen flex-col bg-cream text-ink">
      <OrganizationJsonLd />
      <AnnouncementBar
        campaign={
          campaign
            ? { name: campaign.name, slug: campaign.slug, accent: campaign.accent, deadline: deadlinePending(campaign) ? formatMD(campaign.deadlineMD!) : null }
            : null
        }
      />
      <Header
        loggedIn={Boolean(customerId)}
        segments={segments}
        campaign={campaign ? { name: campaign.name, slug: campaign.slug } : null}
        instagramUrl={instagramUrl}
        whatsapp={phoneDigits(phone)}
      />
      <main className="flex-1 bg-surface">{children}</main>
      <WhatsAppFloat phone={phoneDigits(phone)} />
    </div>
  );
}
