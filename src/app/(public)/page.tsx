import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ProductCard, type ProductCardData } from "@/components/public/ProductCard";
import { FooterWithSettings } from "@/components/public/FooterWithSettings";
import { YarnBackdrop } from "@/components/public/YarnBackdrop";
import { HowItWorks } from "@/components/public/HowItWorks";
import { SEGMENTS } from "@/lib/catalog-segments";
import { getSiteImages } from "@/lib/site-images";
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
  const [images, campaign, featured, categories, gallery, testimonials] = await Promise.all([
    getSiteImages(),
    getActiveCampaign(),
    prisma.product.findMany({ where: { ...PUBLISHED, featured: true, mainImage: { not: null } }, include: CARD_INCLUDE, take: 8, orderBy: { updatedAt: "desc" } }),
    prisma.category.findMany({ select: { slug: true, name: true, _count: { select: { products: { where: PUBLISHED } } } } }),
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
  const hero = images.hero;
  const about = images.about;

  return (
    <>
      {/* Hero: full-bleed banner, text over the owner's background image (or the yarn backdrop) */}
      <section className="relative flex min-h-[78svh] items-end overflow-hidden md:min-h-[620px] md:items-center">
        {hero ? (
          <Image src={hero.url} alt="" fill priority sizes="100vw" quality={80} className="object-cover" style={focal(hero.focalX, hero.focalY)} />
        ) : (
          <YarnBackdrop />
        )}
        <div
          aria-hidden="true"
          className={hero ? "absolute inset-0 bg-gradient-to-t from-[#3d322e]/80 via-[#3d322e]/25 to-transparent md:bg-gradient-to-r md:from-[#3d322e]/70 md:via-[#3d322e]/30" : ""}
        />
        <div className={`relative flex w-full max-w-2xl flex-col gap-5 px-5 pb-10 pt-24 md:px-14 md:py-20 ${hero ? "text-white" : "text-ink"}`}>
          {campaign && (
            <Link href={`/fechas/${campaign.slug}`} className="w-fit rounded-full px-3.5 py-1.5 text-[12.5px] font-medium text-ink" style={{ background: campaign.accent }}>
              {campaign.name} · ver regalos ›
            </Link>
          )}
          <h1 className="font-serif text-[40px] font-normal leading-[1.05] tracking-[-.015em] md:text-[64px]">
            Tejido a mano,
            <br />
            <em className={hero ? "text-pink" : "text-pink-deep"}>pensado para ti</em>
          </h1>
          <p className={`max-w-md text-[16px] font-light leading-relaxed md:text-[18px] ${hero ? "text-white/90" : "text-ink/80"}`}>
            Amigurumis, ropita de bebé, flores que no se marchitan y regalos de crochet hechos por encargo en Galicia.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/catalogo" className="rounded-full bg-pink px-7 py-4 text-center text-[15.5px] font-medium text-ink">
              Ver la tienda
            </Link>
            <Link
              href="/encargo"
              className={`rounded-full px-7 py-4 text-center text-[15.5px] font-medium ${hero ? "border border-white/60 text-white backdrop-blur-sm" : "border border-ink/22 bg-white/70 text-ink"}`}
            >
              Encargar algo personalizado
            </Link>
          </div>
        </div>
      </section>

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
          <Link href={`/fechas/${campaign.slug}`} className="relative mb-6 flex min-h-[220px] items-end overflow-hidden rounded-3xl md:min-h-[300px]">
            {campaign.bannerImage ? (
              <Image src={campaign.bannerImage} alt="" fill sizes="(min-width: 768px) 90vw, 100vw" className="object-cover" style={focal(campaign.bannerFocalX, campaign.bannerFocalY)} />
            ) : (
              <span className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${campaign.accent}, #F7F1EA)` }} />
            )}
            <span aria-hidden="true" className={campaign.bannerImage ? "absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" : ""} />
            <span className={`relative flex flex-col gap-2 p-6 md:p-10 ${campaign.bannerImage ? "text-white" : "text-ink"}`}>
              <span className="text-[11.5px] uppercase tracking-[.16em] opacity-80">Fecha especial</span>
              <span className="font-serif text-[30px] leading-tight md:text-[44px]">{campaign.bannerTitle}</span>
              <span className="max-w-lg text-[15px] opacity-90">{campaign.bannerText}</span>
              {deadlinePending(campaign) && (
                <span className="mt-1 w-fit rounded-full bg-white/90 px-3.5 py-1.5 text-[13px] font-medium text-ink">
                  Encarga antes del {formatMD(campaign.deadlineMD!)}
                </span>
              )}
            </span>
          </Link>
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

      {/* What are you looking for: typographic segment cards */}
      <section className="px-5 py-12 md:px-14 md:py-16">
        <h2 className="mb-5 font-serif text-[28px] font-normal md:mb-7 md:text-[36px]">¿Qué estás buscando?</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
          {segments.map((s, i) => (
            <Link
              key={s.key}
              href={`/catalogo#${s.key}`}
              className={`relative flex min-h-[150px] flex-col justify-end overflow-hidden rounded-2xl p-4 md:min-h-[210px] md:p-5 ${i === 0 ? "col-span-2 md:col-span-1" : ""}`}
              style={{ background: s.tint, color: s.ink }}
            >
              <span aria-hidden="true" className="absolute -right-6 -top-6 h-24 w-24 rounded-full border-[10px] opacity-25" style={{ borderColor: s.ink }} />
              <span className="font-serif text-[20px] leading-tight md:text-[22px]">{s.title}</span>
              <span className="mt-1 text-[12.5px] opacity-80">{s.subtitle}</span>
            </Link>
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

      {/* About: the owner's professional photo as background (never product photos) */}
      <section className="px-5 pb-12 md:px-14 md:pb-16">
        <div className="relative flex min-h-[460px] items-end overflow-hidden rounded-3xl md:min-h-[420px] md:items-center">
          {about ? (
            <Image src={about.url} alt="Elvira tejiendo en su taller" fill sizes="(min-width: 768px) 90vw, 100vw" className="object-cover" style={focal(about.focalX, about.focalY)} />
          ) : (
            <YarnBackdrop />
          )}
          <div aria-hidden="true" className={about ? "absolute inset-0 bg-gradient-to-t from-[#3d322e]/85 via-[#3d322e]/30 to-transparent md:bg-gradient-to-r md:from-[#3d322e]/80" : ""} />
          <div className={`relative flex max-w-lg flex-col gap-3 p-6 md:p-12 ${about ? "text-white" : "text-ink"}`}>
            <span className="text-[11.5px] uppercase tracking-[.18em] opacity-80">Sobre mí</span>
            <h2 className="font-serif text-[28px] font-normal leading-tight md:text-[38px]">Soy Elvira, y cada pieza pasa por mis manos</h2>
            <p className="text-[15px] font-light leading-relaxed opacity-90">
              Empecé tejiendo amigurumis para mi hijo y hoy tejo encargos para toda España desde mi taller en Galicia.
            </p>
            <Link href="/sobre-mi" className={`mt-1 w-fit rounded-full px-6 py-3 text-[14.5px] font-medium ${about ? "bg-white text-ink" : "bg-ink text-surface"}`}>
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
