import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buildCampaignBannerPrompts } from "@/lib/image-edit-prompt";
import { CampaignEditorForm } from "@/components/admin/CampaignEditorForm";

export default async function AdminFechaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [campaign, products] = await Promise.all([
    prisma.campaign.findUnique({ where: { id }, include: { products: { select: { id: true } } } }),
    prisma.product.findMany({
      where: { publicationStatus: { not: "ARCHIVADO" } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, mainImage: true },
    }),
  ]);
  if (!campaign) notFound();

  return (
    <CampaignEditorForm
      initial={{
        id: campaign.id,
        name: campaign.name,
        slug: campaign.slug,
        active: campaign.active,
        startMD: campaign.startMD,
        endMD: campaign.endMD,
        deadlineMD: campaign.deadlineMD ?? "",
        bannerTitle: campaign.bannerTitle,
        bannerText: campaign.bannerText,
        banner: campaign.bannerImage ? { url: campaign.bannerImage, focalX: campaign.bannerFocalX, focalY: campaign.bannerFocalY, zoom: campaign.bannerZoom } : null,
        bannerMobile: campaign.bannerImageMobile
          ? { url: campaign.bannerImageMobile, focalX: campaign.bannerMobileFocalX, focalY: campaign.bannerMobileFocalY, zoom: campaign.bannerMobileZoom }
          : null,
        accent: campaign.accent,
        productIds: campaign.products.map((p) => p.id),
      }}
      products={products}
      prompts={buildCampaignBannerPrompts(campaign)}
    />
  );
}
