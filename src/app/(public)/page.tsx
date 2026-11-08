import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ProductCard, type ProductCardData } from "@/components/public/ProductCard";
import { FooterWithSettings } from "@/components/public/FooterWithSettings";
import { YarnBackdrop } from "@/components/public/YarnBackdrop";
import { HeroBanner } from "@/components/public/HeroBanner";
import { CampaignBanner } from "@/components/public/CampaignBanner";
import { SegmentCard } from "@/components/public/SegmentCard";
import { getSiteSettings } from "@/lib/seo";
import { HowItWorks } from "@/components/public/HowItWorks";
import { SEGMENTS } from "@/lib/catalog-segments";
import { getSiteImages, heroSlides } from "@/lib/site-images";
import { deadlinePending, formatMD, getActiveCampaign } from "@/lib/campaigns";
import type { Prisma } from "@/generated/prisma";

export const dynamic = "force-dynamic";

const PUBLISHED = { publicationStatus: "PUBLICADO" } as const;
const CARD_INCLUDE = { categories: { orderBy: { order: "asc" as const } } };

type ProductWithCategories = Prisma.ProductGetPayload<{ include: { categories: true } }>;

function toCard(p: ProductWithCategories): ProductCardData {
  return {
    slug: p.slug,
    name: p.name,
    price: p.price.toString(),
    priceType: p.priceType,
    pieceStatus: p.pieceStatus,
    likes: p.likes,
    categoryName: p.categories[0]?.name,
    mainImage: p.mainImage,
    mainImageFocalX: p.mainImageFocalX,
    mainImageFocalY: p.mainImageFocalY,
  };
}

const focal = (x: number, y: number) => ({ objectPosition: `${x * 100}% ${y * 100}%` });

export default async function HomePage() {
  const [{ heroPhrases }, images, campaign, featured, categories, gallery, testimonials] = await Promise.all([
    getSiteSettings(),
    getSiteImages(),
    getActiveCampaign(),
    prisma.product.findMany({ where: { ...PUBLISHED, featured: true, mainImage: { not: null } }, include: CARD_INCLUDE, take: 8, orderBy: { updatedAt: "desc" } }),
    prisma.category.findMany({
      orderBy: { order: "asc" },
      select: { slug: true, name: true, coverImage: true, coverFocalX: true, coverFocalY: true, _count: { select: { products: { where: PUBLISHED } } } },
    }),
    prisma.libraryMedia.findMany({ where: { showInGallery: true, mediaType: "IMAGE" }, orderBy: { takenAt: "desc" }, take: 6 }),
    prisma.testimonial.findMany({ where: { visible: true }, orderBy: { order: "asc" }, take: 3 }),
  ]);

  const campaignProducts = campaign
    ? await prisma.product.findMany({
        where: { ...PUBLISHED, campaigns: { some: { id: campaign.id } }, mainImage: { not: null } },
        include: CARD_INCLUDE,
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        take: 4,
      })
    : [];

  const count = new Map(categories.map((c) => [c.slug, c]));
  const segments = SEGMENTS.filter((s) => s.slugs.some((slug) => (count.get(slug)?._count.products ?? 0) > 0));
  const about = images.about;
  // Segment card photo: the owner's AI background, else the cover of its first category.
  const segmentPhoto = (s: (typeof SEGMENTS)[number]) => {
    const own = images[`seg-${s.key}`];
    if (own) return own;
    const cat = s.slugs.map((slug) => count.get(slug)).find((c) => c?.coverImage);
    return cat ? { url: cat.coverImage!, focalX: cat.coverFocalX, focalY: cat.coverFocalY } : null;
  };

  return (
    <>
      <HeroBanner
        slides={heroSlides(images)}
        phrases={heroPhrases}
        campaign={campaign ? { name: campaign.name, slug: campaign.slug, accent: campaign.accent } : null}
      />

      {/* Trust strip */}
      <section className="grid grid-cols-3 border-b border-ink/8 bg-white text-center">
        {[
          ["100 %", "algodón"],
          ["+50", "encargos entregados"],
          ["1-2 sem.", "plazo habitual"],
        ].map(([big, small]) => (
          <div key={small} className="flex flex-col gap-0.5 px-2 py-4">
            <span className="font-serif text-[20px] md:text-[24px]">{big}</span>
            <span className="text-[11.5px] text-ink/60 md:text-[13px]">{small}</span>
          </div>
        ))}
      </section>

      {/* Running special date */}
      {campaign && (
        <section className="px-5 py-12 md:px-14 md:py-16">
          <div className="mb-7">
            <CampaignBanner
              campaign={campaign}
              deadline={deadlinePending(campaign) ? formatMD(campaign.deadlineMD!) : null}
            />
          </div>
          {campaignProducts.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4 md:gap-x-5">
                {campaignProducts.map((p) => (
                  <ProductCard key={p.id} product={toCard(p)} />
                ))}
              </div>
              <Link href={`/fechas/${campaign.slug}`} className="mt-6 block rounded-full border border-ink/20 bg-white py-3.5 text-center text-[14.5px] font-medium md:mx-auto md:w-80">
                Ver todo para {campaign.name}
              </Link>
            </>
          )}
        </section>
      )}

      {/* What are you looking for: one photo card per shop block */}
      <section className="px-5 py-12 md:px-14 md:py-16">
        <div className="mb-5 flex items-end justify-between gap-4 md:mb-7">
          <h2 className="font-serif text-[28px] font-normal md:text-[36px]">¿Qué estás buscando?</h2>
          <Link href="/catalogo" className="shrink-0 border-b border-pink pb-0.5 text-[13.5px] font-medium">
            Ir a la tienda
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4 lg:grid-cols-5">
          {segments.map((s) => (
            <SegmentCard key={s.key} href={`/catalogo#${s.key}`} photo={segmentPhoto(s)} title={s.title} subtitle={s.subtitle} tint={s.tint} />
          ))}
        </div>
      </section>

      {/* Favourites */}
      {featured.length > 0 && (
        <section className="bg-white px-5 py-12 md:px-14 md:py-16">
          <div className="mb-5 flex items-end justify-between gap-4 md:mb-7">
            <h2 className="font-serif text-[28px] font-normal md:text-[36px]">Las favoritas</h2>
            <Link href="/catalogo/todo" className="shrink-0 border-b border-pink pb-0.5 text-[13.5px] font-medium">
              Ver todo
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4 md:gap-x-5 md:gap-y-8">
            {featured.map((p) => (
              <ProductCard key={p.id} product={toCard(p)} />
            ))}
          </div>
        </section>
      )}

      <HowItWorks />

      {/* Delivered work */}
      {gallery.length > 0 && (
        <section className="py-12 md:px-14 md:py-16">
          <div className="mb-5 flex flex-col gap-1 px-5 md:mb-7 md:px-0">
            <h2 className="font-serif text-[28px] font-normal md:text-[36px]">Trabajos entregados</h2>
            <p className="text-[14.5px] font-light text-ink/70">Algunos encargos que ya están en su nueva casa.</p>
          </div>
          <div className="flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:grid md:grid-cols-5 md:overflow-visible md:px-0">
            {gallery.slice(0, 5).map((g) => (
              <figure key={g.id} className="flex w-[64vw] max-w-[260px] shrink-0 snap-start flex-col gap-2 md:w-auto md:max-w-none">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-cream">
                  <Image src={g.url} alt={g.galleryTitle ?? "Trabajo de crochet entregado"} fill sizes="(min-width: 768px) 18vw, 64vw" className="object-cover" />
                </div>
                {g.galleryTitle && <figcaption className="text-[13.5px] text-ink/75">{g.galleryTitle}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* About: the owner's own portrait photo beside the text (never product photos) */}
      <section className="px-5 pb-12 md:px-14 md:pb-16">
        <div className="grid grid-cols-1 items-center gap-6 overflow-hidden rounded-[28px] bg-cream p-4 md:grid-cols-[minmax(0,380px)_1fr] md:gap-12 md:p-6">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl sm:aspect-[4/5]">
            {about ? (
              <Image src={about.url} alt="Elvira tejiendo en su taller" fill sizes="(min-width: 768px) 380px, 100vw" className="object-cover" style={focal(about.focalX, about.focalY)} />
            ) : (
              <YarnBackdrop />
            )}
          </div>
          <div className="flex max-w-lg flex-col gap-3 px-2 pb-4 md:px-0 md:pb-0">
            <span className="text-[11.5px] font-medium uppercase tracking-[.2em] text-ink-soft">Sobre mí</span>
            <h2 className="font-serif text-[28px] font-normal leading-tight md:text-[38px]">Soy Elvira, y cada pieza pasa por mis manos</h2>
            <p className="text-[15.5px] font-light leading-relaxed text-ink/78">
              Empecé tejiendo amigurumis para mi hijo y hoy tejo encargos para toda España desde mi taller en Galicia.
            </p>
            <Link href="/sobre-mi" className="mt-1 w-fit rounded-full bg-ink px-6 py-3 text-[14.5px] font-medium text-surface">
              Conóceme
            </Link>
          </div>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="bg-cream px-5 py-12 md:px-14 md:py-16">
          <h2 className="mb-5 font-serif text-[28px] font-normal md:mb-7 md:text-[36px]">Lo que dicen mis clientas</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
            {testimonials.map((t) => (
              <figure key={t.id} className="flex flex-col gap-4 rounded-2xl bg-white p-6">
                <span className="text-sm tracking-[.14em] text-sage">★★★★★</span>
                <blockquote className="font-serif text-[16px] leading-relaxed text-ink">«{t.text}»</blockquote>
                <figcaption className="mt-auto flex flex-col">
                  <span className="text-[13.5px] font-medium">{t.author}</span>
                  {t.origin && <span className="text-xs text-ink/55">{t.origin}</span>}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col items-center gap-4 bg-pink/35 px-5 py-12 text-center md:py-16">
        <h2 className="max-w-xl font-serif text-[28px] font-normal leading-tight md:text-[36px]">¿Tienes una idea? La tejemos juntas</h2>
        <p className="max-w-md text-[15px] font-light text-ink/78">Mándame una foto o descríbeme lo que buscas y te digo precio y plazo, sin compromiso.</p>
        <Link href="/encargo" className="rounded-full bg-ink px-7 py-4 text-[15px] font-medium text-surface">
          Pedir a medida
        </Link>
      </section>

      <FooterWithSettings />
    </>
  );
}
