import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/public/ProductCard";
import { CatalogSearch, CatalogChip } from "@/components/public/CatalogFilters";
import { Footer } from "@/components/public/Footer";
import type { Prisma } from "@/generated/prisma";

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const { q = "", cat = "Todo" } = await searchParams;

  const where: Prisma.ProductWhereInput = {
    publicationStatus: "PUBLICADO",
    ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    ...(cat !== "Todo" ? { categories: { some: { name: cat } } } : {}),
  };

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { categories: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { products: { where: { publicationStatus: "PUBLICADO" } } } } },
    }),
  ]);

  const availableCats = categories.filter((c) => c._count.products > 0);
  const title = cat === "Todo" ? "Toda la tienda" : cat;
  const intro =
    cat === "Todo"
      ? "Lo vendido se puede volver a tejer por encargo."
      : `Piezas de la categoría ${cat}. Lo vendido se puede volver a tejer por encargo.`;

  function catHref(name: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (name !== "Todo") params.set("cat", name);
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

      <section className="flex flex-wrap gap-2.5 px-5 pb-5 md:px-14">
        <CatalogChip label="Todo" active={cat === "Todo"} href={catHref("Todo")} />
        {availableCats.map((c) => (
          <CatalogChip key={c.id} label={c.name} active={cat === c.name} href={catHref(c.name)} />
        ))}
      </section>

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

      <Footer />
    </>
  );
}
