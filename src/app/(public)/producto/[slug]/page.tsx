import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductGallery } from "@/components/public/ProductGallery";
import { LikeButton } from "@/components/public/LikeButton";
import { ProductCard } from "@/components/public/ProductCard";
import { FooterWithSettings } from "@/components/public/FooterWithSettings";
import { STATUS_DOT, STATUS_SCHEMA_AVAILABILITY, formatPrice, hasPrice, productAction } from "@/lib/product-status";
import { productMetaFallback, getSiteSettings, phoneDigits, SITE_URL } from "@/lib/seo";

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
    // absolute: the product meta title is already the full title — skip the "%s · Mundolana" template.
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

  const [product, { phone }] = await Promise.all([
    prisma.product.findUnique({
      where: { slug },
      include: {
        categories: { orderBy: { order: "asc" } },
        images: { orderBy: { order: "asc" } },
        relatedTo: {
          where: { publicationStatus: "PUBLICADO" },
          include: { categories: { orderBy: { order: "asc" } } },
          take: 4,
        },
      },
    }),
    getSiteSettings(),
  ]);

  if (!product) notFound();

  const category = product.categories[0];
  const action = productAction(product.pieceStatus, product.priceType);
  const priced = hasPrice(product.price.toString());
  const materials = (product.materials ?? "").split("\n").filter(Boolean);
  const galleryItems = [
    ...(product.mainImage
      ? [
          {
            url: product.mainImage,
            mediaType: "image" as const,
            focalX: product.mainImageFocalX,
            focalY: product.mainImageFocalY,
          },
        ]
      : []),
    ...product.images.map((img) => ({
      url: img.url,
      mediaType: img.mediaType === "VIDEO" ? ("video" as const) : ("image" as const),
      posterUrl: img.posterUrl,
      focalX: img.focalX,
      focalY: img.focalY,
    })),
  ];
  const galleryPhotoUrls = galleryItems.filter((i) => i.mediaType === "image").map((i) => i.url);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription || product.description || undefined,
    image: galleryPhotoUrls.map((url) => (url.startsWith("http") ? url : `${SITE_URL}${url}`)),
    category: category?.name,
    // Without a real price Google would show "0 €": leave the offer out until it's set.
    offers: hasPrice(product.price.toString())
      ? {
          "@type": "Offer",
          url: `${SITE_URL}/producto/${slug}`,
          priceCurrency: "EUR",
          price: product.price.toString(),
          availability: STATUS_SCHEMA_AVAILABILITY[product.pieceStatus],
        }
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <div className="px-5 pt-4 text-[12.5px] text-ink/60 md:px-14 md:pt-5">
        <Link href="/">Inicio</Link>
        <span className="mx-2">/</span>
        {category && (
          <>
            <Link href={`/categoria/${category.slug}`}>{category.name}</Link>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-ink">{product.name}</span>
      </div>

      <section className="grid grid-cols-1 gap-6 px-5 pb-8 pt-3 md:grid-cols-2 md:gap-14 md:px-14 md:py-8">
        <ProductGallery productName={product.name} items={galleryItems} />

        <div className="flex flex-col">
          <div className="mb-2.5 flex flex-wrap items-center gap-2.5">
            <span className="flex items-center gap-2 rounded-full border border-ink/14 bg-white px-3 py-1.5 text-[12px] font-medium">
              <span className="h-2 w-2 rounded-full" style={{ background: STATUS_DOT[product.pieceStatus] }} />
              {action.label}
            </span>
            {category && (
              <Link href={`/categoria/${category.slug}`} className="text-[12px] uppercase tracking-[.12em] text-ink-soft">
                {category.name}
              </Link>
            )}
          </div>

          <h1 className="mb-3 font-serif text-[30px] font-normal leading-[1.12] tracking-[-.01em] md:text-[42px]">
            {product.name}
          </h1>

          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span className={priced ? "font-serif text-[26px] font-medium leading-none md:text-[30px]" : "font-serif text-[21px] leading-tight md:text-[24px]"}>
                {formatPrice(product.price.toString(), product.priceType)}
              </span>
              <span className="text-[12.5px] text-ink/60">
                {priced
                  ? "Envío 4,50 € · gratis desde 60 €"
                  : "Depende del tamaño y los colores: te lo digo sin compromiso."}
              </span>
            </div>
            <LikeButton slug={product.slug} initialLikes={product.likes} />
          </div>

          <div className="flex flex-col gap-2.5">
            <Link
              href={`/encargo?producto=${product.slug}`}
              className="rounded-full bg-pink px-6 py-4 text-center text-[15.5px] font-medium text-ink"
            >
              {action.cta}
            </Link>
            <a
              href={`https://wa.me/${phoneDigits(phone)}?text=${encodeURIComponent(`Hola, me interesa «${product.name}» (${SITE_URL}/producto/${product.slug})`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-ink/22 bg-white px-6 py-4 text-center text-[15.5px] font-medium text-ink"
            >
              Preguntar por WhatsApp
            </a>
            <span className="text-[12.5px] leading-relaxed text-ink/60">{action.note}</span>
          </div>

          {product.description && (
            <div className="mt-6 border-t border-ink/12 pt-5">
              <h2 className="mb-2 text-[12px] uppercase tracking-[.14em] text-ink-soft">Descripción</h2>
              <p className="whitespace-pre-line text-[15px] font-light leading-relaxed text-ink/85 md:text-[16px]">
                {product.description}
              </p>
            </div>
          )}

          {materials.length > 0 && (
            <div className="mt-5 border-t border-ink/12 pt-5">
              <h2 className="mb-2 text-[12px] uppercase tracking-[.14em] text-ink-soft">Materiales</h2>
              <ul className="flex flex-col gap-1.5 text-[14.5px] font-light text-ink/85">
                {materials.map((m) => (
                  <li key={m} className="flex gap-2">
                    <span className="text-sage">—</span>
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ul className="mt-5 grid grid-cols-1 gap-2 rounded-2xl bg-white p-4 text-[13.5px] text-ink/75 sm:grid-cols-2">
            <li>✓ Tejido a mano en Galicia</li>
            <li>✓ Personalizable en colores</li>
            <li>✓ Envíos a toda España</li>
            <li>✓ Fotos del avance por WhatsApp</li>
          </ul>
        </div>
      </section>

      {product.relatedTo.length > 0 && (
        <section className="border-t border-ink/8 bg-white px-5 py-10 md:px-14 md:py-13">
          <div className="mb-5 flex items-end justify-between md:mb-6">
            <h2 className="font-serif text-[24px] font-normal md:text-[30px]">También te puede gustar</h2>
            {category && (
              <Link
                href={`/categoria/${category.slug}`}
                className="border-b border-pink pb-0.5 text-[13.5px] font-medium"
              >
                Ver más
              </Link>
            )}
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4 md:gap-x-5">
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
                  mainImage: p.mainImage,
                  mainImageFocalX: p.mainImageFocalX,
                  mainImageFocalY: p.mainImageFocalY,
                }}
              />
            ))}
          </div>
        </section>
      )}

      <FooterWithSettings />
    </>
  );
}
