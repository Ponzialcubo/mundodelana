import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductGallery } from "@/components/public/ProductGallery";
import { LikeButton } from "@/components/public/LikeButton";
import { ProductCard } from "@/components/public/ProductCard";
import { Footer } from "@/components/public/Footer";
import { STATUS_DOT, STATUS_LABEL, STATUS_CTA, formatPrice } from "@/lib/product-status";
import { productMetaFallback } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      name: true,
      shortDescription: true,
      description: true,
      metaTitle: true,
      metaDescription: true,
      mainImage: true,
      publicationStatus: true,
    },
  });

  if (!product) return { title: "Pieza no encontrada" };

  const fallback = productMetaFallback(product);
  const title = product.metaTitle?.trim() || fallback.metaTitle;
  const description = product.metaDescription?.trim() || fallback.metaDescription;
  const canonical = `/producto/${slug}`;
  const noindex = product.publicationStatus !== "PUBLICADO";

  return {
    // absolute: the product meta title is already the full title — skip the "%s · Mundodelana" template.
    title: { absolute: title },
    description,
    alternates: { canonical },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: product.mainImage ? [{ url: product.mainImage }] : undefined,
    },
  };
}

export default async function ProductoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      categories: true,
      relatedTo: {
        where: { publicationStatus: "PUBLICADO" },
        include: { categories: true },
        take: 4,
      },
    },
  });

  if (!product) notFound();

  const category = product.categories[0];
  const { cta, note } = STATUS_CTA[product.pieceStatus];
  const materials = (product.materials ?? "").split("\n").filter(Boolean);

  return (
    <>
      <div className="px-5 pt-4 text-[12.5px] text-ink/60 md:px-14 md:pt-5">
        <Link href="/">Inicio</Link>
        <span className="mx-2">/</span>
        {category && (
          <>
            <Link href={`/catalogo?cat=${encodeURIComponent(category.name)}`}>{category.name}</Link>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-ink">{product.name}</span>
      </div>

      <section className="grid grid-cols-1 gap-8 px-5 py-6 md:grid-cols-2 md:gap-12 md:px-14 md:py-8">
        <ProductGallery productName={product.name} />

        <div className="flex flex-col">
          <div className="mb-3.5 flex items-center gap-3">
            <span className="flex items-center gap-2 rounded-full border border-ink/14 bg-white px-3 py-1.5 font-mono text-[11.5px] font-medium tracking-wide">
              <span className="h-2 w-2 rounded-full" style={{ background: STATUS_DOT[product.pieceStatus] }} />
              {STATUS_LABEL[product.pieceStatus]}
            </span>
            {category && (
              <span className="font-mono text-[11.5px] tracking-wider text-ink-soft">
                {category.name.toUpperCase()}
              </span>
            )}
          </div>

          <h1 className="mb-3 font-serif text-[32px] font-normal leading-tight tracking-[-.01em] md:text-[44px]">
            {product.name}
          </h1>
          {product.description && (
            <p className="mb-5 max-w-lg text-[15px] font-light leading-relaxed text-ink/82 md:text-[16.5px]">
              {product.description}
            </p>
          )}

          <div className="flex items-end gap-5 border-y border-ink/12 py-5">
            <div className="flex flex-col gap-1">
              <span className="font-serif text-[28px] font-medium leading-none md:text-[34px]">
                {formatPrice(product.price.toString(), product.priceType)}
              </span>
              <span className="text-[12.5px] text-ink/60">IVA incluido · envío 4,50 € (gratis desde 60 €)</span>
            </div>
            <LikeButton slug={product.slug} initialLikes={product.likes} />
          </div>

          {materials.length > 0 && (
            <div className="flex flex-col gap-3 py-5">
              <span className="font-mono text-[11.5px] uppercase tracking-[.14em] text-ink-soft">Materiales</span>
              <ul className="grid grid-cols-1 gap-2.5 text-[14.5px] font-light leading-normal text-ink/85 md:grid-cols-2 md:gap-x-6 md:gap-y-2.5">
                {materials.map((m) => (
                  <li key={m} className="flex gap-2">
                    <span className="text-sage">—</span>
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-1.5 md:flex-row">
            <button className="flex-1 rounded-full bg-pink px-6 py-4 text-[15.5px] font-medium text-ink">
              {cta}
            </button>
            <a
              href="https://wa.me/34600000000"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-ink/22 bg-white px-6 py-4 text-center text-[15.5px] font-medium text-ink"
            >
              Preguntar por WhatsApp
            </a>
          </div>
          <span className="pt-3 text-[12.5px] text-ink/60">{note}</span>
        </div>
      </section>

      {product.relatedTo.length > 0 && (
        <section className="border-t border-ink/8 bg-white px-5 py-10 md:px-14 md:py-13">
          <div className="mb-5 flex items-end justify-between md:mb-6">
            <h2 className="font-serif text-2xl font-normal md:text-[30px]">También te puede gustar</h2>
            {category && (
              <Link
                href={`/catalogo?cat=${encodeURIComponent(category.name)}`}
                className="border-b border-pink pb-0.5 text-[13.5px] font-medium"
              >
                Ver categoría completa
              </Link>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-4.5">
            {product.relatedTo.map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  slug: p.slug,
                  name: p.name,
                  price: p.price.toString(),
                  priceType: p.priceType,
                  pieceStatus: p.pieceStatus,
                  likes: p.likes,
                }}
              />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
