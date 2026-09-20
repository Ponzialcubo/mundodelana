import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/public/ProductCard";
import { CatalogSearch, CatalogChip } from "@/components/public/CatalogFilters";
import { FooterWithSettings } from "@/components/public/FooterWithSettings";
import type { Prisma } from "@/generated/prisma";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; marca?: string }>;
}): Promise<Metadata> {
  const { cat = "Todo" } = await searchParams;
  const title = cat === "Todo" ? "Tienda de crochet y amigurumis" : `${cat} · Tienda`;
  const description =
    cat === "Todo"
      ? "Todas las piezas de crochet, amigurumis y decoración tejidas a mano por Mundolana. Lo vendido se puede volver a tejer por encargo."
      : `Piezas de ${cat} tejidas a mano en algodón por Mundolana. Envíos a toda España desde Galicia.`;
  // Canonical always points to the clean catalog (filters/search are not indexable variants).
  return {
    title,
    description,
    alternates: { canonical: "/catalogo" },
    openGraph: { title, description, url: "/catalogo" },
  };
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; marca?: string }>;
}) {
  const { q = "", cat = "Todo", marca = "Todas" } = await searchParams;

  const where: Prisma.ProductWhereInput = {
    publicationStatus: "PUBLICADO",
    ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    ...(cat !== "Todo" ? { categories: { some: { name: cat } } } : {}),
    ...(marca !== "Todas" ? { brands: { some: { name: marca } } } : {}),
  };

  const [products, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { categories: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { products: { where: { publicationStatus: "PUBLICADO" } } } } },
    }),
    prisma.brand.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: {
            products: {
              where: {
                publicationStatus: "PUBLICADO",
                ...(cat !== "Todo" ? { categories: { some: { name: cat } } } : {}),
              },
            },
          },
        },
      },
    }),
  ]);

  const availableCats = categories.filter((c) => c._count.products > 0);
  const availableBrands = brands.filter((b) => b._count.products > 0);
  const title = marca !== "Todas" ? marca : cat === "Todo" ? "Toda la tienda" : cat;
  const intro =
    cat === "Todo" && marca === "Todas"
      ? "Lo vendido se puede volver a tejer por encargo."
      : `Piezas de ${[cat !== "Todo" ? `la categoría ${cat}` : null, marca !== "Todas" ? `la marca ${marca}` : null]
          .filter(Boolean)
          .join(" y ")}. Lo vendido se puede volver a tejer por encargo.`;

  function catHref(name: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (name !== "Todo") params.set("cat", name);
    if (marca !== "Todas") params.set("marca", marca);
    const qs = params.toString();
    return `/catalogo${qs ? `?${qs}` : ""}`;
  }

  function brandHref(name: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (cat !== "Todo") params.set("cat", cat);
    if (name !== "Todas") params.set("marca", name);
    const qs = params.toString();
    return `/catalogo${qs ? `?${qs}` : ""}`;
  }

  return (
    <>
      <section className="flex flex-col gap-3 px-5 pb-4 pt-8 md:flex-row md:items-end md:justify-between md:px-14 md:pb-5 md:pt-11">
        <div className="flex max-w-2xl flex-col gap-2.5">
          <span className="font-mono text-[11.5px] uppercase tracking-[.16em] text-ink-soft">Tienda</span>
          <h1 className="font-serif text-[30px] font-normal leading-tight md:text-[42px]">{title}</h1>
          <p className="text-[14px] font-light leading-relaxed text-ink/75 md:text-[15.5px]">{intro}</p>
        </div>
        <CatalogSearch defaultValue={q} />
      </section>

      <section className="flex flex-wrap gap-2.5 px-5 pb-2.5 md:px-14">
        <CatalogChip label="Todo" active={cat === "Todo"} href={catHref("Todo")} />
        {availableCats.map((c) => (
          <CatalogChip key={c.id} label={c.name} active={cat === c.name} href={catHref(c.name)} />
        ))}
      </section>

      {availableBrands.length > 0 && (
        <section className="flex flex-wrap gap-2 px-5 pb-5 md:px-14">
          <CatalogChip label="Todas las marcas" active={marca === "Todas"} href={brandHref("Todas")} />
          {availableBrands.map((b) => (
            <CatalogChip key={b.id} label={b.name} active={marca === b.name} href={brandHref(b.name)} />
          ))}
        </section>
      )}

      <section className="flex items-center justify-between border-b border-ink/10 px-5 pb-3 pt-1.5 md:px-14">
        <span className="text-[13px] text-ink/65">
          {products.length} {products.length === 1 ? "pieza" : "piezas"}
        </span>
        <Link href="/catalogo" className="border-b border-ink/25 text-[13px] text-ink/65">
          Quitar filtros
        </Link>
      </section>

      <section className="px-5 py-6 md:px-14 md:py-8">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-4.5 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                showCategory
                product={{
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
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-ink/20 bg-white p-14 text-center">
            <span className="font-serif text-2xl">Nada por aquí todavía</span>
            <span className="max-w-md text-[14.5px] font-light text-ink/70">
              No encuentro esa pieza, pero casi todo se puede tejer por encargo. Cuéntame qué buscas.
            </span>
            <Link href="/encargo" className="mt-1.5 rounded-full bg-pink px-5.5 py-3 text-[14px] font-medium">
              Pedir personalizado
            </Link>
          </div>
        )}
      </section>

      <FooterWithSettings />
    </>
  );
}
