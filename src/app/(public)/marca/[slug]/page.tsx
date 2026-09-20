import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/public/ProductCard";
import { CatalogChip } from "@/components/public/CatalogFilters";
import { FooterWithSettings } from "@/components/public/FooterWithSettings";
import { brandMetaFallback } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = await prisma.brand.findUnique({
    where: { slug },
    select: { name: true, metaTitle: true, metaDescription: true },
  });

  if (!brand) return { title: "Marca no encontrada" };

  const fallback = brandMetaFallback(brand);
  const title = brand.metaTitle?.trim() || fallback.metaTitle;
  const description = brand.metaDescription?.trim() || fallback.metaDescription;
  const canonical = `/marca/${slug}`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
  };
}

export default async function MarcaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [brand, brands] = await Promise.all([
    prisma.brand.findUnique({ where: { slug } }),
    prisma.brand.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { products: { where: { publicationStatus: "PUBLICADO" } } } } },
    }),
  ]);

  if (!brand) notFound();

  const products = await prisma.product.findMany({
    where: { publicationStatus: "PUBLICADO", brands: { some: { slug } } },
    include: { categories: true },
    orderBy: { createdAt: "desc" },
  });

  const availableBrands = brands.filter((b) => b._count.products > 0);

  return (
    <>
      <section className="flex flex-col gap-3 px-5 pb-4 pt-8 md:flex-row md:items-end md:justify-between md:px-14 md:pb-5 md:pt-11">
        <div className="flex max-w-2xl flex-col gap-2.5">
          <span className="font-mono text-[11.5px] uppercase tracking-[.16em] text-ink-soft">Marca</span>
          <h1 className="font-serif text-[30px] font-normal leading-tight md:text-[42px]">{brand.name}</h1>
          <p className="text-[14px] font-light leading-relaxed text-ink/75 md:text-[15.5px]">
            Amigurumis de {brand.name}. Lo vendido se puede volver a tejer por encargo.
          </p>
        </div>
      </section>

      {availableBrands.length > 1 && (
        <section className="flex flex-wrap gap-2.5 px-5 pb-5 md:px-14">
          {availableBrands.map((b) => (
            <CatalogChip key={b.id} label={b.name} active={b.slug === slug} href={`/marca/${b.slug}`} />
          ))}
        </section>
      )}

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
              No hay piezas publicadas de esta marca ahora mismo, pero casi todo se puede tejer por encargo.
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
