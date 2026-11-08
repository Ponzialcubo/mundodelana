import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductGallery } from "@/components/public/ProductGallery";
import { LikeButton } from "@/components/public/LikeButton";
import { ProductCard } from "@/components/public/ProductCard";
import { FooterWithSettings } from "@/components/public/FooterWithSettings";
import { STATUS_DOT, STATUS_SCHEMA_AVAILABILITY, formatPrice, hasPrice, productAction } from "@/lib/product-status";
import { Icon, type IconName } from "@/components/public/Icon";
import { MobileBuyBar } from "@/components/public/MobileBuyBar";
import { productMetaFallback, getSiteSettings, phoneDigits, SITE_URL } from "@/lib/seo";

const SUMMARY = "flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[15px] font-medium [&::-webkit-details-marker]:hidden";
const PLUS = "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-ink/60 transition group-open:rotate-45";

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
            zoom: product.mainImageZoom,
          },
        ]
      : []),
    ...product.images.map((img) => ({
      url: img.url,
      mediaType: img.mediaType === "VIDEO" ? ("video" as const) : ("image" as const),
      posterUrl: img.posterUrl,
      focalX: img.focalX,
      focalY: img.focalY,
      zoom: img.zoom,
    })),
  ];
  const galleryPhotoUrls = galleryItems.filter((i) => i.mediaType === "image").map((i) => i.url);

  const whatsappHref = `https://wa.me/${phoneDigits(phone)}?text=${encodeURIComponent(`Hola, me interesa «${product.name}» (${SITE_URL}/producto/${product.slug})`)}`;
  const perks: { icon: IconName; title: string; text: string }[] = [
    product.pieceStatus === "DISPONIBLE" && product.priceType === "STOCK"
      ? { icon: "clock", title: "Ya tejida", text: "Sale del taller en 24-72 h" }
      : { icon: "clock", title: "Se teje para ti", text: "Plazo habitual, 1-2 semanas" },
    { icon: "pencil", title: "Personalizable", text: "En tus colores o con cambios" },
    { icon: "box", title: "Envío a toda España", text: "4,50 € · gratis desde 60 €" },
    { icon: "camera", title: "Fotos del avance", text: "Validas antes de terminar" },
  ];

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

      <section className="grid grid-cols-1 gap-6 px-5 pb-8 pt-3 md:grid-cols-2 md:gap-10 md:px-14 md:py-6 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-14 xl:px-20">
        <ProductGallery productName={product.name} items={galleryItems} />

        <div className="flex flex-col lg:max-w-[560px] lg:pt-2">
          <div className="mb-3 flex flex-wrap items-center gap-2.5">
            <span className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[12px] font-medium shadow-[0_2px_8px_rgba(74,63,59,.06)]">
              <span className="h-2 w-2 rounded-full" style={{ background: STATUS_DOT[product.pieceStatus] }} />
              {action.label}
            </span>
            {category && (
              <Link href={`/categoria/${category.slug}`} className="text-[11.5px] font-medium uppercase tracking-[.14em] text-ink-soft hover:text-ink">
                {category.name}
              </Link>
            )}
          </div>

          <h1 className="font-serif text-[30px] font-normal leading-[1.1] tracking-[-.01em] md:text-[40px]">{product.name}</h1>
          {product.shortDescription && <p className="mt-2 text-[15.5px] font-light leading-relaxed text-ink/75 md:text-[16.5px]">{product.shortDescription}</p>}

          <div className="mt-5 flex items-end justify-between gap-4 border-y border-ink/10 py-4">
            <div className="flex flex-col gap-1">
              <span className={priced ? "font-serif text-[28px] leading-none md:text-[32px]" : "font-serif text-[22px] leading-tight md:text-[26px]"}>
                {formatPrice(product.price.toString(), product.priceType)}
              </span>
              <span className="text-[12.5px] text-ink/60">
                {priced ? "Envío 4,50 € · gratis desde 60 €" : "Depende del tamaño y los colores: te lo digo sin compromiso."}
              </span>
            </div>
            <LikeButton slug={product.slug} initialLikes={product.likes} />
          </div>

          <div id="comprar" className="mt-5 flex flex-col gap-2.5">
            <Link href={`/encargo?producto=${product.slug}`} className="rounded-full bg-ink px-6 py-4 text-center text-[15.5px] font-medium text-surface transition hover:bg-ink/90">
              {action.cta}
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-full border border-ink/18 bg-white px-6 py-4 text-center text-[15.5px] font-medium text-ink transition hover:border-ink/35"
            >
              <svg viewBox="0 0 32 32" className="h-[18px] w-[18px] text-[#1FAF55]" fill="currentColor" aria-hidden="true">
                <path d="M16.04 3C9.4 3 4 8.36 4 14.97c0 2.11.56 4.17 1.62 5.99L4 29l8.25-2.15a12.1 12.1 0 0 0 3.79.61h.01C22.68 27.46 28 22.1 28 15.49 28 8.88 22.68 3 16.04 3Zm5.43 14.58c-.3-.15-1.76-.86-2.03-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47 0 1.46 1.07 2.87 1.21 3.07.15.2 2.1 3.2 5.08 4.48 2.49 1.08 2.99.87 3.56.81.57-.06 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
              </svg>
              Preguntar por WhatsApp
            </a>
          </div>

          <ul className="mt-5 grid grid-cols-1 gap-3 rounded-2xl bg-white p-4 sm:grid-cols-2 md:p-5">
            {perks.map((perk) => (
              <li key={perk.title} className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream text-ink/80">
                  <Icon name={perk.icon} className="h-[18px] w-[18px]" />
                </span>
                <span className="flex flex-col">
                  <span className="text-[13.5px] font-medium leading-snug">{perk.title}</span>
                  <span className="text-[12.5px] leading-snug text-ink/60">{perk.text}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col divide-y divide-ink/10 border-y border-ink/10">
            {product.description && (
              <details open className="group py-1">
                <summary className={SUMMARY}>
                  Descripción
                  <span className={PLUS}>+</span>
                </summary>
                <p className="whitespace-pre-line pb-4 text-[15px] font-light leading-relaxed text-ink/82">{product.description}</p>
              </details>
            )}
            <details className="group py-1">
              <summary className={SUMMARY}>
                Materiales y cuidados
                <span className={PLUS}>+</span>
              </summary>
              <div className="flex flex-col gap-3 pb-4 text-[14.5px] font-light leading-relaxed text-ink/82">
                {materials.length > 0 && (
                  <ul className="flex flex-col gap-1">
                    {materials.map((m) => (
                      <li key={m} className="flex gap-2">
                        <span className="text-sage">—</span>
                        {m}
                      </li>
                    ))}
                  </ul>
                )}
                <p>Lavar a mano en agua fría con un jabón suave y dejar secar al aire, sin retorcer.</p>
              </div>
            </details>
            <details className="group py-1">
              <summary className={SUMMARY}>
                Envíos, pagos y cambios
                <span className={PLUS}>+</span>
              </summary>
              <ul className="flex flex-col gap-2 pb-4 text-[14.5px] font-light leading-relaxed text-ink/82">
                <li>Envío a península, Baleares y Canarias: 4,50 €, gratis a partir de 60 €, siempre con seguimiento.</li>
                <li>Pago por Bizum o transferencia. En encargos de más de 50 €, la mitad al empezar y el resto al terminar.</li>
                <li>Puedes cambiar detalles mientras la pieza no esté montada. Si algo llega dañado, lo reparo o lo rehago sin coste.</li>
              </ul>
            </details>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[13.5px] font-medium text-ink/70">
            <Link href="/como-funciona" className="underline underline-offset-4 hover:text-ink">
              ¿Cómo funciona un encargo?
            </Link>
            {product.instagramUrl && (
              <a href={product.instagramUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-ink">
                Ver esta pieza en Instagram ↗
              </a>
            )}
          </div>
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
                  mainImageFocalY: p.mainImageFocalY, mainImageZoom: p.mainImageZoom,
                }}
              />
            ))}
          </div>
        </section>
      )}

      <FooterWithSettings />
      <MobileBuyBar price={formatPrice(product.price.toString(), product.priceType)} cta={action.cta} href={`/encargo?producto=${product.slug}`} whatsappHref={whatsappHref} />
    </>
  );
}
