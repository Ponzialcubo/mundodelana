import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/public/ProductCard";
import { SearchLauncher } from "@/components/public/SearchLauncher";
import { FooterWithSettings } from "@/components/public/FooterWithSettings";
import { SEGMENTS } from "@/lib/catalog-segments";
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

  const [categories, brands, campaign, total] = await Promise.all([
    prisma.category.findMany({
      orderBy: { order: "asc" },
      select: { name: true, slug: true, coverImage: true, coverFocalX: true, coverFocalY: true, _count: { select: { products: { where: PUBLISHED } } } },
    }),
    prisma.brand.findMany({ orderBy: { order: "asc" }, select: { name: true, slug: true, _count: { select: { products: { where: PUBLISHED } } } } }),
    getActiveCampaign(),
    prisma.product.count({ where: PUBLISHED }),
  ]);

  const bySlug = new Map(categories.filter((c) => c._count.products > 0).map((c) => [c.slug, c]));
  const segments = SEGMENTS.map((s) => ({ ...s, cats: s.slugs.map((slug) => bySlug.get(slug)).filter((c) => c !== undefined) })).filter((s) => s.cats.length > 0);
  const liveBrands = brands.filter((b) => b._count.products > 0);

  return (
    <>
      <section className="flex flex-col gap-4 px-5 pb-6 pt-7 md:px-14 md:pb-8 md:pt-12">
        <h1 className="font-serif text-[34px] font-normal leading-tight md:text-[46px]">Tienda</h1>
        <p className="-mt-2 max-w-xl text-[15px] font-light text-ink/75">Todo se teje a mano y por encargo, en los colores que prefieras.</p>
        <SearchLauncher />
      </section>

      {campaign && (
        <section className="px-5 pb-8 md:px-14">
          <Link href={`/fechas/${campaign.slug}`} className="flex items-center justify-between gap-4 rounded-2xl px-5 py-5" style={{ background: campaign.accent }}>
            <span className="flex flex-col">
              <span className="text-[11.5px] uppercase tracking-[.16em] text-ink/70">Fecha especial</span>
              <span className="font-serif text-[22px]">{campaign.name}</span>
              {deadlinePending(campaign) && <span className="text-[13px] text-ink/80">Encarga antes del {formatMD(campaign.deadlineMD!)}</span>}
            </span>
            <span className="text-2xl text-ink/60">›</span>
          </Link>
        </section>
      )}

      <div className="flex flex-col gap-10 px-5 pb-10 md:gap-14 md:px-14">
        {segments.map((s) => (
          <section key={s.key} id={s.key} className="scroll-mt-24">
            <div className="mb-3.5 flex flex-col">
              <h2 className="font-serif text-[24px] font-normal md:text-[30px]">{s.title}</h2>
              <span className="text-[13.5px] text-ink/60">{s.subtitle}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {s.cats.map((c) => (
                <Link
                  key={c.slug}
                  href={`/categoria/${c.slug}`}
                  className={`relative flex min-h-[132px] flex-col justify-between overflow-hidden rounded-2xl p-4 md:min-h-[170px] md:p-5 ${s.cats.length === 1 ? "col-span-2 md:col-span-1" : ""}`}
                  style={{ background: s.tint, color: s.ink }}
                >
                  <span className="relative z-10 flex flex-col">
                    <span className="font-serif text-[19px] leading-tight md:text-[24px]">{c.name}</span>
                    <span className="text-[12.5px] opacity-75">{c._count.products} piezas</span>
                  </span>
                  <span className="relative z-10 text-[13px] font-medium">Ver ›</span>
                  {c.coverImage && (
                    <span className="absolute -bottom-5 -right-5 h-[92px] w-[92px] overflow-hidden rounded-full border-4 border-white/70 md:h-[120px] md:w-[120px]">
                      <Image src={c.coverImage} alt="" fill sizes="120px" className="object-cover" style={{ objectPosition: `${c.coverFocalX * 100}% ${c.coverFocalY * 100}%` }} />
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        ))}

        {liveBrands.length > 0 && (
          <section>
            <div className="mb-3.5 flex flex-col">
              <h2 className="font-serif text-[24px] font-normal md:text-[30px]">Personajes y colecciones</h2>
              <span className="text-[13.5px] text-ink/60">Y si no está tu personaje, te lo tejo por encargo.</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {liveBrands.map((b) => (
                <Link key={b.slug} href={`/marca/${b.slug}`} className="rounded-full border border-ink/14 bg-white px-4 py-2.5 text-[14.5px]">
                  {b.name} <span className="text-ink/45">· {b._count.products}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <Link href="/catalogo/todo" className="rounded-full bg-ink py-4 text-center text-[15.5px] font-medium text-surface md:mx-auto md:w-96">
          Ver todas las piezas ({total})
        </Link>
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
