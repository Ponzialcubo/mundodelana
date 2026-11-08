import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/public/ProductCard";
import { CatalogChip } from "@/components/public/CatalogFilters";
import { segmentOf } from "@/lib/catalog-segments";
import { FooterWithSettings } from "@/components/public/FooterWithSettings";
import { categoryMetaFallback } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { name: true, description: true, metaTitle: true, metaDescription: true },
  });

  if (!category) return { title: "Categoría no encontrada" };

  const fallback = categoryMetaFallback(category);
  const title = category.metaTitle?.trim() || fallback.metaTitle;
  const description = category.metaDescription?.trim() || fallback.metaDescription;
  const canonical = `/categoria/${slug}`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
  };
}

export default async function CategoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [category, categories] = await Promise.all([
    prisma.category.findUnique({ where: { slug } }),
    prisma.category.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { products: { where: { publicationStatus: "PUBLICADO" } } } } },
    }),
  ]);

  if (!category) notFound();

  const products = await prisma.product.findMany({
    where: { publicationStatus: "PUBLICADO", categories: { some: { slug } } },
    include: { categories: { orderBy: { order: "asc" } } },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  // Only the categories of the same block (e.g. Pendientes + Complementos), not the whole list.
  const segment = segmentOf(slug);
  const siblings = categories.filter((c) => c._count.products > 0 && segment?.slugs.includes(c.slug));

  return (
    <>
      <section className="flex flex-col gap-3 px-5 pb-4 pt-6 md:flex-row md:items-end md:justify-between md:px-14 md:pb-5 md:pt-11">
        <div className="flex max-w-2xl flex-col gap-2.5">
          <Link href={segment ? `/catalogo#${segment.key}` : "/catalogo"} className="text-[13.5px] text-ink/60">
            ‹ {segment ? segment.title : "Tienda"}
          </Link>
          <h1 className="font-serif text-[30px] font-normal leading-tight md:text-[42px]">{category.name}</h1>
          <p className="text-[14px] font-light leading-relaxed text-ink/75 md:text-[15.5px]">
            {category.description || `Piezas de ${category.name}. Todo se teje a mano y por encargo.`}
          </p>
        </div>
      </section>

      <nav className="flex gap-2 overflow-x-auto px-5 pb-4 [scrollbar-width:none] md:flex-wrap md:px-14">
        {siblings.length > 1 && siblings.map((c) => (
          <CatalogChip key={c.id} label={c.name} active={c.slug === slug} href={`/categoria/${c.slug}`} />
        ))}
      </nav>

      <section className="flex items-center justify-between border-b border-ink/10 px-5 pb-3 pt-1.5 md:px-14">
        <span className="text-[13px] text-ink/65">
          {products.length} {products.length === 1 ? "pieza" : "piezas"}
        </span>
        <Link href="/catalogo" className="border-b border-ink/25 text-[13px] text-ink/65">
          Ver toda la tienda
        </Link>
      </section>

      <section className="px-5 py-6 md:px-14 md:py-8">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 md:gap-x-5 md:gap-y-8 xl:grid-cols-4">
            {products.map((p, i) => (
              <ProductCard
                key={p.id}
                priority={i < 4}
                product={{
                  slug: p.slug,
                  name: p.name,
                  price: p.price.toString(),
                  priceType: p.priceType,
                  pieceStatus: p.pieceStatus,
                  likes: p.likes,
                  mainImage: p.mainImage,
                  mainImageFocalX: p.mainImageFocalX,
                  mainImageFocalY: p.mainImageFocalY, mainImageZoom: p.mainImageZoom,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-ink/20 bg-white p-14 text-center">
            <span className="font-serif text-2xl">Nada por aquí todavía</span>
            <span className="max-w-md text-[14.5px] font-light text-ink/70">
              No hay piezas publicadas en esta categoría ahora mismo, pero casi todo se puede tejer por encargo.
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
