import type { Metadata } from "next";
import Link from "next/link";
import { BannerImage } from "@/components/public/BannerImage";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/public/ProductCard";
import { FooterWithSettings } from "@/components/public/FooterWithSettings";
import { deadlinePending, formatMD, isInWindow } from "@/lib/campaigns";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { slug } });
  if (!campaign) return { title: "Fecha no encontrada" };
  const title = `Regalos de ${campaign.name} hechos a mano`;
  const description = campaign.metaDescription ?? campaign.bannerText;
  return {
    title,
    description,
    alternates: { canonical: `/fechas/${slug}` },
    openGraph: { title, description, url: `/fechas/${slug}`, images: campaign.bannerImage ? [{ url: campaign.bannerImage }] : undefined },
  };
}

export default async function FechaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { slug },
    include: {
      products: {
        where: { publicationStatus: "PUBLICADO" },
        include: { categories: { orderBy: { order: "asc" } } },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      },
    },
  });
  if (!campaign || !campaign.active) notFound();

  const live = isInWindow(campaign.startMD, campaign.endMD);
  const image = campaign.bannerImage;

  return (
    <>
      <section className="relative flex aspect-[4/5] max-h-[80svh] w-full items-end overflow-hidden sm:aspect-[2/1] md:aspect-[3/1] md:max-h-[560px] md:items-center">
        {image ? (
          <BannerImage
            priority
            desktop={{ url: image, focalX: campaign.bannerFocalX, focalY: campaign.bannerFocalY }}
            mobile={campaign.bannerImageMobile ? { url: campaign.bannerImageMobile, focalX: campaign.bannerMobileFocalX, focalY: campaign.bannerMobileFocalY } : undefined}
          />
        ) : (
          <span className="absolute inset-0" style={{ background: `linear-gradient(150deg, ${campaign.accent} 0%, #F7F1EA 85%)` }} />
        )}
        {image && <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent md:bg-gradient-to-r md:from-black/55 md:via-black/20" />}
        <div className={`relative flex max-w-2xl flex-col gap-3 px-5 pb-9 pt-16 md:px-14 md:pb-14 ${image ? "text-white" : "text-ink"}`}>
          <Link href="/catalogo" className="text-[13px] opacity-80">‹ Tienda</Link>
          <h1 className="font-serif text-[36px] font-normal leading-[1.06] md:text-[54px]">{campaign.bannerTitle}</h1>
          <p className="max-w-lg text-[15.5px] font-light leading-relaxed opacity-90">{campaign.bannerText}</p>
          {live && deadlinePending(campaign) && (
            <span className="w-fit rounded-full bg-white/90 px-4 py-2 text-[13.5px] font-medium text-ink">
              Encarga antes del {formatMD(campaign.deadlineMD!)} para tenerlo a tiempo
            </span>
          )}
          {!live && (
            <span className="w-fit rounded-full bg-white/90 px-4 py-2 text-[13.5px] font-medium text-ink">
              Vuelve el {formatMD(campaign.startMD)}, pero puedes encargar cuando quieras
            </span>
          )}
        </div>
      </section>

      <section className="px-5 py-10 md:px-14 md:py-14">
        {campaign.products.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 md:gap-x-5 md:gap-y-8 xl:grid-cols-4">
            {campaign.products.map((p, i) => (
              <ProductCard
                key={p.id}
                priority={i < 4}
                product={{
                  slug: p.slug, name: p.name, price: p.price.toString(), priceType: p.priceType, pieceStatus: p.pieceStatus, likes: p.likes,
                  categoryName: p.categories[0]?.name, mainImage: p.mainImage, mainImageFocalX: p.mainImageFocalX, mainImageFocalY: p.mainImageFocalY,
                }}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-[15px] text-ink/70">Pronto añadiré piezas para esta fecha.</p>
        )}
      </section>

      <section className="flex flex-col items-center gap-4 px-5 py-12 text-center md:py-16" style={{ background: `${campaign.accent}55` }}>
        <h2 className="max-w-xl font-serif text-[26px] font-normal leading-tight md:text-[34px]">¿Buscas algo especial para {campaign.name}?</h2>
        <p className="max-w-md text-[15px] font-light text-ink/78">Lo tejo a tu medida: con un nombre, en sus colores favoritos o a partir de una foto.</p>
        <Link href="/encargo" className="rounded-full bg-ink px-7 py-4 text-[15px] font-medium text-surface">
          Pedir a medida
        </Link>
      </section>

      <FooterWithSettings />
    </>
  );
}
