import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/public/ProductCard";
import { SearchLauncher } from "@/components/public/SearchLauncher";
import { FooterWithSettings } from "@/components/public/FooterWithSettings";
import { SEGMENTS } from "@/lib/catalog-segments";
import { getSiteImages } from "@/lib/site-images";
import { SegmentCard } from "@/components/public/SegmentCard";
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
      take: 10,
    }),
  ]);

  const cover = (c: (typeof categories)[number]) => (c.coverImage ? { url: c.coverImage, focalX: c.coverFocalX, focalY: c.coverFocalY } : null);
  const bySlug = new Map(categories.filter((c) => c._count.products > 0).map((c) => [c.slug, c]));
  const segments = SEGMENTS.map((s) => {
    const cats = s.slugs.map((slug) => bySlug.get(slug)).filter((c) => c !== undefined);
    return {
      ...s,
      cats: cats.map((c) => ({ name: c.name, slug: c.slug, count: c._count.products, cover: cover(c) })),
      // The owner's AI card image, else the cover of its first category that has one.
      photo: images[`seg-${s.key}`] ?? cats.map(cover).find(Boolean) ?? null,
    };
  }).filter((s) => s.cats.length > 0);
  const liveBrands = brands.filter((b) => b._count.products > 0);

  return (
    <>
      <div className="mx-auto w-full max-w-[1240px] px-5 md:px-8">
        <section className="flex flex-col gap-4 pb-6 pt-7 md:flex-row md:items-end md:justify-between md:gap-8 md:pb-8 md:pt-10">
          <div className="flex flex-col gap-1">
            <span className="text-[11.5px] font-medium uppercase tracking-[.18em] text-ink-soft">{total} piezas tejidas a mano</span>
            <h1 className="font-serif text-[34px] font-normal leading-tight md:text-[40px]">Tienda</h1>
            <p className="text-[14.5px] font-light text-ink/70">Todo se teje a mano y por encargo, en los colores que prefieras.</p>
          </div>
          <div className="flex w-full items-center gap-2.5 md:w-auto">
            <div className="flex-1 md:w-80 md:flex-none">
              <SearchLauncher placeholder="Buscar piezas o personajes…" />
            </div>
            <Link href="/catalogo/todo" className="shrink-0 rounded-full bg-ink px-4 py-3 text-[13.5px] font-medium text-surface">
              Ver todo
            </Link>
          </div>
        </section>

        {campaign && (
          <section className="pb-8 md:pb-10">
            <CampaignBanner compact campaign={campaign} deadline={deadlinePending(campaign) ? formatMD(campaign.deadlineMD!) : null} />
          </section>
        )}

        <section className="pb-10 md:pb-14">
          <h2 className="mb-4 font-serif text-[22px] font-normal md:text-[26px]">Explora por categoría</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4 lg:grid-cols-5">
            {segments.map((s, i) => (
              <SegmentCard
                key={s.key}
                id={s.key}
                href={`/categoria/${s.cats[0].slug}`}
                photo={s.photo}
                title={s.title}
                tint={s.tint}
                categories={s.cats}
                priority={i < 3}
              />
            ))}
          </div>
        </section>

        {latest.length > 0 && (
          <section className="pb-10 md:pb-14">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div className="flex flex-col">
                <h2 className="font-serif text-[22px] font-normal md:text-[26px]">Recién salidas del taller</h2>
                <span className="text-[13.5px] text-ink/60">Las últimas piezas que he subido.</span>
              </div>
              <Link href="/catalogo/todo" className="shrink-0 border-b border-pink pb-0.5 text-[13.5px] font-medium">
                Ver las {total}
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 md:gap-x-4 lg:grid-cols-5">
              {latest.map((p, i) => (
                <div key={p.id} className={i >= 6 ? "hidden lg:block" : ""}>
                  <ProductCard
                    showCategory
                    product={{
                      slug: p.slug, name: p.name, price: p.price.toString(), priceType: p.priceType, pieceStatus: p.pieceStatus, likes: p.likes,
                      categoryName: p.categories[0]?.name, mainImage: p.mainImage, mainImageFocalX: p.mainImageFocalX, mainImageFocalY: p.mainImageFocalY,
                    }}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 gap-3 pb-12 md:gap-4 md:pb-16 lg:grid-cols-[1.5fr_1fr]">
          {liveBrands.length > 0 && (
            <div className="flex flex-col gap-3 rounded-2xl bg-white p-5 md:p-6">
              <div className="flex flex-col">
                <h2 className="font-serif text-[20px] font-normal">Personajes y colecciones</h2>
                <span className="text-[13px] text-ink/60">Y si no está tu personaje, te lo tejo por encargo.</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {liveBrands.map((b) => (
                  <Link key={b.slug} href={`/marca/${b.slug}`} className="rounded-full border border-ink/12 bg-surface px-3.5 py-2 text-[13.5px] hover:border-ink/30">
                    {b.name} <span className="text-ink/45">· {b._count.products}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-col justify-center gap-2 rounded-2xl bg-pink/30 p-5 md:p-6">
            <span className="font-serif text-[20px] leading-tight">¿No encuentras lo que buscas?</span>
            <span className="text-[13.5px] text-ink/70">Casi todo se puede tejer a medida. Cuéntame tu idea y te digo precio y plazo.</span>
            <Link href="/encargo" className="mt-1 w-fit rounded-full bg-ink px-5 py-2.5 text-[13.5px] font-medium text-surface">
              Pedir a medida
            </Link>
          </div>
        </section>
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
