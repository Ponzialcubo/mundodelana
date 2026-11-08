import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/public/ProductCard";
import { SearchLauncher } from "@/components/public/SearchLauncher";
import { FooterWithSettings } from "@/components/public/FooterWithSettings";
import { SEGMENTS } from "@/lib/catalog-segments";
import { getSiteImages } from "@/lib/site-images";
import { PhotoCard } from "@/components/public/PhotoCard";
import { CampaignBanner } from "@/components/public/CampaignBanner";
import { deadlinePending, formatMD, getActiveCampaign } from "@/lib/campaigns";

const PUBLISHED = { publicationStatus: "PUBLICADO" } as const;

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
  const { q } = await searchParams;
  const title = q ? `Resultados para «${q}»` : "Tienda de crochet y amigurumis";
  const description =
    "Amigurumis, ropita de bebé, pendientes, flores que no se marchitan y regalos de crochet tejidos a mano por encargo en Galicia.";
  return { title, description, alternates: { canonical: "/catalogo" }, robots: q ? { index: false } : undefined, openGraph: { title, description, url: "/catalogo" } };
}

export default async function CatalogoPage({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string; marca?: string }> }) {
  const { q = "", cat, marca } = await searchParams;

  // Old filter URLs keep working by sending them to their clean pages.
  if (cat || marca) {
    const target = cat
      ? await prisma.category.findFirst({ where: { name: cat }, select: { slug: true } }).then((c) => c && `/categoria/${c.slug}`)
      : await prisma.brand.findFirst({ where: { name: marca }, select: { slug: true } }).then((b) => b && `/marca/${b.slug}`);
    redirect(target ?? "/catalogo/todo");
  }

  if (q) return <SearchResults q={q} />;

  const [categories, brands, campaign, total, images, latest] = await Promise.all([
    prisma.category.findMany({
      orderBy: { order: "asc" },
      select: { name: true, slug: true, coverImage: true, coverFocalX: true, coverFocalY: true, _count: { select: { products: { where: PUBLISHED } } } },
    }),
    prisma.brand.findMany({ orderBy: { order: "asc" }, select: { name: true, slug: true, _count: { select: { products: { where: PUBLISHED } } } } }),
    getActiveCampaign(),
    prisma.product.count({ where: PUBLISHED }),
    getSiteImages(),
    prisma.product.findMany({
      where: { ...PUBLISHED, mainImage: { not: null } },
      include: { categories: { orderBy: { order: "asc" } } },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  const campaignPhotos = campaign
    ? await prisma.product.findMany({
        where: { ...PUBLISHED, campaigns: { some: { id: campaign.id } }, mainImage: { not: null } },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        select: { mainImage: true, mainImageFocalX: true, mainImageFocalY: true },
        take: 3,
      })
    : [];

  const bySlug = new Map(categories.filter((c) => c._count.products > 0).map((c) => [c.slug, c]));
  const segments = SEGMENTS.map((s) => {
    const cats = s.slugs.map((slug) => bySlug.get(slug)).filter((c) => c !== undefined);
    return { ...s, cats, pieces: cats.reduce((n, c) => n + c._count.products, 0), photo: images[`seg-${s.key}`] ?? null };
  }).filter((s) => s.cats.length > 0);
  const liveBrands = brands.filter((b) => b._count.products > 0);
  const cover = (c: (typeof categories)[number]) => (c.coverImage ? { url: c.coverImage, focalX: c.coverFocalX, focalY: c.coverFocalY } : null);

  return (
    <>
      <section className="relative overflow-hidden border-b border-ink/8 bg-cream">
        <div className="relative flex flex-col gap-4 px-5 pb-5 pt-7 md:px-14 md:pb-7 md:pt-12">
          <span className="text-[11.5px] font-medium uppercase tracking-[.18em] text-ink-soft">{total} piezas tejidas a mano</span>
          <h1 className="-mt-2 font-serif text-[36px] font-normal leading-tight md:text-[52px]">La tienda</h1>
          <p className="-mt-2 max-w-xl text-[15px] font-light text-ink/75 md:text-[16.5px]">Todo se teje a mano y por encargo, en los colores que prefieras.</p>
          <div className="md:max-w-md">
            <SearchLauncher />
          </div>
          {/* Quick jump to each block: saves scrolling on mobile */}
          <nav aria-label="Secciones de la tienda" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
            {segments.map((s) => (
              <a key={s.key} href={`#${s.key}`} className="shrink-0 rounded-full border border-ink/12 bg-white px-4 py-2 text-[13.5px] font-medium">
                {s.title}
              </a>
            ))}
            <Link href="/catalogo/todo" className="shrink-0 rounded-full bg-ink px-4 py-2 text-[13.5px] font-medium text-surface">
              Ver todo
            </Link>
          </nav>
        </div>
      </section>

      {campaign && (
        <section className="px-5 pt-8 md:px-14 md:pt-12">
          <CampaignBanner
            compact
            campaign={campaign}
            photos={campaignPhotos.map((p) => ({ url: p.mainImage!, focalX: p.mainImageFocalX, focalY: p.mainImageFocalY }))}
            deadline={deadlinePending(campaign) ? formatMD(campaign.deadlineMD!) : null}
          />
        </section>
      )}

      <div className="flex flex-col gap-11 px-5 py-10 md:gap-16 md:px-14 md:py-14">
        {segments.map((s) => (
          <section key={s.key} id={s.key} className="scroll-mt-24 md:flex md:h-[380px] md:gap-4">
            {/* Block intro: a heading on mobile, a full panel on desktop */}
            <div
              className="relative mb-3.5 flex flex-col justify-end overflow-hidden md:mb-0 md:w-[26%] md:shrink-0 md:rounded-3xl md:p-7"
              style={{ color: s.ink }}
            >
              <span aria-hidden="true" className="absolute inset-0 hidden md:block" style={{ background: s.tint }} />
              {s.photo && (
                <>
                  <Image src={s.photo.url} alt="" fill sizes="26vw" className="hidden object-cover md:block" style={{ objectPosition: `${s.photo.focalX * 100}% ${s.photo.focalY * 100}%` }} />
                  <span aria-hidden="true" className="absolute inset-0 hidden bg-gradient-to-t from-[#2f2623]/80 to-transparent md:block" />
                </>
              )}
              <span className={`relative flex flex-col gap-1 ${s.photo ? "md:text-white" : ""}`}>
                <span className="hidden text-[11px] font-medium uppercase tracking-[.16em] opacity-75 md:block">{s.pieces} piezas</span>
                <h2 className="font-serif text-[25px] font-normal leading-tight text-ink md:text-[32px] md:text-inherit">{s.title}</h2>
                <span className="text-[13.5px] text-ink/60 md:text-[14px] md:text-inherit md:opacity-85">{s.subtitle}</span>
              </span>
            </div>

            <div className={`grid gap-3 md:flex md:flex-1 md:gap-4 ${s.cats.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
              {s.cats.map((c, i) => (
                <PhotoCard
                  key={c.slug}
                  href={`/categoria/${c.slug}`}
                  photo={cover(c)}
                  title={c.name}
                  subtitle={`${c._count.products} piezas`}
                  tint={s.tint}
                  ink={s.ink}
                  large={s.cats.length === 1}
                  sizes={s.cats.length === 1 ? "(min-width: 768px) 70vw, 100vw" : "(min-width: 768px) 25vw, 50vw"}
                  className={`md:h-full md:flex-1 ${
                    s.cats.length === 1 ? "aspect-[4/3] md:aspect-auto" : s.cats.length === 3 && i === 0 ? "col-span-2 aspect-[16/10] md:aspect-auto" : "aspect-[3/4] md:aspect-auto"
                  }`}
                />
              ))}
            </div>
          </section>
        ))}

        {latest.length > 0 && (
          <section>
            <div className="mb-4 flex items-end justify-between gap-4 md:mb-6">
              <div className="flex flex-col">
                <h2 className="font-serif text-[25px] font-normal md:text-[32px]">Recién salidas del taller</h2>
                <span className="text-[13.5px] text-ink/60">Las últimas piezas que he subido.</span>
              </div>
              <Link href="/catalogo/todo" className="shrink-0 border-b border-pink pb-0.5 text-[13.5px] font-medium">
                Ver todo
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4 md:gap-x-5">
              {latest.map((p) => (
                <ProductCard
                  key={p.id}
                  showCategory
                  product={{
                    slug: p.slug, name: p.name, price: p.price.toString(), priceType: p.priceType, pieceStatus: p.pieceStatus, likes: p.likes,
                    categoryName: p.categories[0]?.name, mainImage: p.mainImage, mainImageFocalX: p.mainImageFocalX, mainImageFocalY: p.mainImageFocalY,
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {liveBrands.length > 0 && (
          <section className="flex flex-col gap-4 rounded-3xl bg-white p-6 md:flex-row md:items-center md:justify-between md:p-9">
            <div className="flex flex-col">
              <h2 className="font-serif text-[23px] font-normal md:text-[28px]">Personajes y colecciones</h2>
              <span className="text-[13.5px] text-ink/60">Y si no está tu personaje, te lo tejo por encargo.</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {liveBrands.map((b) => (
                <Link key={b.slug} href={`/marca/${b.slug}`} className="rounded-full border border-ink/14 bg-surface px-4 py-2.5 text-[14.5px]">
                  {b.name} <span className="text-ink/45">· {b._count.products}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="flex flex-col items-center gap-3 rounded-3xl bg-pink/30 px-6 py-9 text-center md:py-12">
          <span className="font-serif text-[24px] leading-tight md:text-[30px]">¿No encuentras lo que buscas?</span>
          <span className="max-w-md text-[14.5px] font-light text-ink/75">Casi todo se puede tejer a medida. Cuéntame tu idea y te digo precio y plazo.</span>
          <div className="mt-1 flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
            <Link href="/catalogo/todo" className="rounded-full bg-ink px-6 py-3.5 text-[14.5px] font-medium text-surface">
              Ver las {total} piezas
            </Link>
            <Link href="/encargo" className="rounded-full border border-ink/20 bg-white px-6 py-3.5 text-[14.5px] font-medium">
              Pedir a medida
            </Link>
          </div>
        </div>
      </div>

      <FooterWithSettings />
    </>
  );
}

/** Text search across name, short description, categories and characters. */
async function SearchResults({ q }: { q: string }) {
  const contains = { contains: q, mode: "insensitive" as const };
  const products = await prisma.product.findMany({
    where: {
      ...PUBLISHED,
      OR: [
        { name: contains },
        { shortDescription: contains },
        { categories: { some: { name: contains } } },
        { brands: { some: { name: contains } } },
      ],
    },
    include: { categories: { orderBy: { order: "asc" } } },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
    take: 48,
  });

  return (
    <>
      <section className="flex flex-col gap-4 px-5 pb-5 pt-7 md:px-14 md:pt-12">
        <Link href="/catalogo" className="text-[13.5px] text-ink/60">‹ Tienda</Link>
        <h1 className="font-serif text-[30px] font-normal leading-tight md:text-[40px]">Resultados para «{q}»</h1>
        <SearchLauncher placeholder="Buscar otra cosa…" />
      </section>
      <section className="px-5 pb-12 md:px-14">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 md:gap-x-5 md:gap-y-8 xl:grid-cols-4">
            {products.map((p, i) => (
              <ProductCard
                key={p.id}
                priority={i < 4}
                showCategory
                product={{
                  slug: p.slug, name: p.name, price: p.price.toString(), priceType: p.priceType, pieceStatus: p.pieceStatus, likes: p.likes,
                  categoryName: p.categories[0]?.name, mainImage: p.mainImage, mainImageFocalX: p.mainImageFocalX, mainImageFocalY: p.mainImageFocalY,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-12 text-center">
            <span className="font-serif text-2xl">No encuentro esa pieza</span>
            <span className="max-w-md text-[14.5px] font-light text-ink/70">Casi todo se puede tejer por encargo. Cuéntame qué buscas.</span>
            <Link href="/encargo" className="mt-1.5 rounded-full bg-pink px-5 py-3 text-[14.5px] font-medium">Pedir a medida</Link>
          </div>
        )}
      </section>
      <FooterWithSettings />
    </>
  );
}
