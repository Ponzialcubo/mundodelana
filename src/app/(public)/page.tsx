import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ProductCard, type ProductCardData } from "@/components/public/ProductCard";
import { FooterWithSettings } from "@/components/public/FooterWithSettings";
import type { Prisma } from "@/generated/prisma";

export const dynamic = "force-dynamic";

const PUBLISHED = { publicationStatus: "PUBLICADO" } as const;

type ProductWithCategories = Prisma.ProductGetPayload<{ include: { categories: true } }>;

function toCard(p: ProductWithCategories): ProductCardData {
  return {
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
  };
}

/** Christmas pieces get their own block from November to Epiphany. */
function isChristmasSeason(now: Date) {
  const m = now.getMonth();
  return m === 10 || m === 11 || (m === 0 && now.getDate() <= 6);
}

const STEPS = [
  { n: "1", title: "Elige o cuéntame tu idea", text: "Una pieza del catálogo, en tus colores, o algo nuevo a partir de una foto." },
  { n: "2", title: "Te digo precio y plazo", text: "Te respondo por WhatsApp y, cuando estés conforme, empiezo a tejer." },
  { n: "3", title: "Ves el avance y te llega a casa", text: "Te enseño fotos mientras la hago y la envío a toda España." },
];

export default async function HomePage() {
  const now = new Date();
  const productInclude = { categories: { orderBy: { order: "asc" as const } } };

  const [featured, categories, gallery, testimonials, christmas] = await Promise.all([
    prisma.product.findMany({
      where: { ...PUBLISHED, featured: true, mainImage: { not: null } },
      include: productInclude,
      take: 8,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.category.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { products: { where: PUBLISHED } } } },
    }),
    prisma.libraryMedia.findMany({ where: { showInGallery: true, mediaType: "IMAGE" }, orderBy: { takenAt: "desc" }, take: 6 }),
    prisma.testimonial.findMany({ where: { visible: true }, orderBy: { order: "asc" }, take: 3 }),
    isChristmasSeason(now)
      ? prisma.product.findMany({
          where: { ...PUBLISHED, categories: { some: { slug: "navidad" } }, mainImage: { not: null } },
          include: productInclude,
          take: 4,
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([] as ProductWithCategories[]),
  ]);

  const visibleCategories = categories.filter((c) => c._count.products > 0);
  const heroPhotos = featured.slice(0, 3);
  // A group shot reads as "the workshop"; keep it out of the delivered-work strip to avoid repeating it.
  const workshopPhoto = gallery.find((g) => g.galleryTitle?.toLowerCase().includes("vaquitas")) ?? gallery[gallery.length - 1];
  const deliveredWork = gallery.filter((g) => g.id !== workshopPhoto?.id);

  return (
    <>
      {/* Hero */}
      <section className="grid grid-cols-1 items-center gap-8 px-5 pb-10 pt-8 md:grid-cols-[1fr_1.1fr] md:gap-14 md:px-14 md:pb-16 md:pt-14">
        <div className="flex flex-col gap-5 md:gap-6">
          <span className="text-[11.5px] uppercase tracking-[.18em] text-ink-soft">Crochet hecho a mano en Galicia</span>
          <h1 className="font-serif text-[36px] font-normal leading-[1.08] tracking-[-.015em] md:text-[58px]">
            Amigurumis y regalos tejidos <em className="text-pink-deep">a mano</em>, pieza a pieza
          </h1>
          <p className="max-w-md text-[15px] font-light leading-relaxed text-ink/78 md:text-[17px]">
            Muñecos, ropita de bebé, flores que no se marchitan y detalles para regalar. Todo se teje por encargo, en
            los colores que elijas.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/catalogo" className="rounded-full bg-pink px-7 py-3.5 text-center text-[15px] font-medium text-ink">
              Ver la tienda
            </Link>
            <Link
              href="/encargo"
              className="rounded-full border border-ink/22 bg-white px-7 py-3.5 text-center text-[15px] font-medium text-ink"
            >
              Encargar algo personalizado
            </Link>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[12.5px] text-ink/60">
            <span>✓ Algodón 100 %</span>
            <span>✓ Envíos a toda España</span>
            <span>✓ +50 encargos entregados</span>
          </div>
        </div>

        {heroPhotos.length === 3 && (
          <div className="grid grid-cols-[1.25fr_1fr] grid-rows-2 gap-2.5 md:gap-3.5">
            <Link href={`/producto/${heroPhotos[0].slug}`} className="relative row-span-2 aspect-[4/5] overflow-hidden rounded-2xl">
              <Image
                src={heroPhotos[0].mainImage!}
                alt={heroPhotos[0].name}
                fill
                priority
                sizes="(min-width: 768px) 30vw, 55vw"
                className="object-cover"
                style={{ objectPosition: `${heroPhotos[0].mainImageFocalX * 100}% ${heroPhotos[0].mainImageFocalY * 100}%` }}
              />
            </Link>
            {heroPhotos.slice(1).map((p) => (
              <Link key={p.id} href={`/producto/${p.slug}`} className="relative overflow-hidden rounded-2xl">
                <Image
                  src={p.mainImage!}
                  alt={p.name}
                  fill
                  priority
                  sizes="(min-width: 768px) 22vw, 42vw"
                  className="object-cover"
                  style={{ objectPosition: `${p.mainImageFocalX * 100}% ${p.mainImageFocalY * 100}%` }}
                />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Categories: horizontal scroller on phones, grid on desktop */}
      <section className="pb-12 md:px-14 md:pb-16">
        <h2 className="mb-4 px-5 font-serif text-[26px] font-normal md:mb-6 md:px-0 md:text-[34px]">Explora por categoría</h2>
        <div className="flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:grid md:grid-cols-5 md:gap-4 md:overflow-visible md:px-0">
          {visibleCategories.map((cat) => (
            <Link key={cat.id} href={`/categoria/${cat.slug}`} className="flex w-[38vw] max-w-[180px] shrink-0 snap-start flex-col gap-2 md:w-auto md:max-w-none">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-cream">
                {cat.coverImage && (
                  <Image
                    src={cat.coverImage}
                    alt={cat.name}
                    fill
                    sizes="(min-width: 768px) 18vw, 38vw"
                    className="object-cover"
                    style={{ objectPosition: `${cat.coverFocalX * 100}% ${cat.coverFocalY * 100}%` }}
                  />
                )}
              </div>
              <span className="font-serif text-[15px] font-medium leading-tight md:text-[17px]">{cat.name}</span>
              <span className="-mt-1.5 text-[12px] text-ink/55">{cat._count.products} piezas</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Favourites */}
      {featured.length > 0 && (
        <section className="px-5 pb-12 md:px-14 md:pb-16">
          <div className="mb-5 flex items-end justify-between gap-4 md:mb-6">
            <h2 className="font-serif text-[26px] font-normal md:text-[34px]">Las favoritas</h2>
            <Link href="/catalogo" className="shrink-0 border-b border-pink pb-0.5 text-[13.5px] font-medium text-ink">
              Ver todo
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4 md:gap-x-5 md:gap-y-8">
            {featured.map((p) => (
              <ProductCard key={p.id} product={toCard(p)} />
            ))}
          </div>
        </section>
      )}

      {/* Seasonal block */}
      {christmas.length > 0 && (
        <section className="bg-white px-5 py-12 md:px-14 md:py-16">
          <div className="mb-5 flex items-end justify-between gap-4 md:mb-6">
            <div className="flex flex-col gap-1">
              <span className="text-[11.5px] uppercase tracking-[.18em] text-pink-deep">Temporada</span>
              <h2 className="font-serif text-[26px] font-normal md:text-[34px]">Ya llega la Navidad</h2>
            </div>
            <Link href="/categoria/navidad" className="shrink-0 border-b border-pink pb-0.5 text-[13.5px] font-medium text-ink">
              Ver Navidad
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4 md:gap-x-5">
            {christmas.map((p) => (
              <ProductCard key={p.id} product={toCard(p)} />
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="px-5 py-12 md:px-14 md:py-16">
        <h2 className="mb-6 font-serif text-[26px] font-normal md:mb-8 md:text-[34px]">Así funciona un encargo</h2>
        <ol className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {STEPS.map((s) => (
            <li key={s.n} className="flex gap-4 rounded-2xl bg-white p-5 md:flex-col md:gap-3 md:p-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink font-serif text-lg">{s.n}</span>
              <span className="flex flex-col gap-1">
                <span className="font-serif text-[17px] font-medium">{s.title}</span>
                <span className="text-[14px] font-light leading-relaxed text-ink/75">{s.text}</span>
              </span>
            </li>
          ))}
        </ol>
        <Link href="/como-funciona" className="mt-5 inline-block border-b border-pink pb-0.5 text-[13.5px] font-medium">
          Más detalles sobre plazos, envíos y pagos
        </Link>
      </section>

      {/* Finished work */}
      {deliveredWork.length > 0 && (
        <section className="bg-cream py-12 md:px-14 md:py-16">
          <div className="mb-5 flex flex-col gap-1 px-5 md:mb-6 md:px-0">
            <h2 className="font-serif text-[26px] font-normal md:text-[34px]">Trabajos entregados</h2>
            <p className="text-[14px] font-light text-ink/70">Algunos encargos que ya están en su nueva casa.</p>
          </div>
          <div className="flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:grid md:grid-cols-5 md:overflow-visible md:px-0">
            {deliveredWork.slice(0, 5).map((g) => (
              <figure key={g.id} className="flex w-[62vw] max-w-[260px] shrink-0 snap-start flex-col gap-2 md:w-auto md:max-w-none">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                  <Image src={g.url} alt={g.galleryTitle ?? "Trabajo de crochet entregado"} fill sizes="(min-width: 768px) 18vw, 62vw" className="object-cover" />
                </div>
                {g.galleryTitle && <figcaption className="text-[13.5px] text-ink/75">{g.galleryTitle}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* About */}
      <section className="grid grid-cols-1 gap-7 px-5 py-12 md:grid-cols-[400px_1fr] md:items-center md:gap-14 md:px-14 md:py-16">
        {workshopPhoto && (
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
            <Image src={workshopPhoto.url} alt="Piezas de crochet en el taller de Mundolana" fill sizes="(min-width: 768px) 400px, 90vw" className="object-cover" />
          </div>
        )}
        <div className="flex max-w-xl flex-col gap-4">
          <span className="text-[11.5px] uppercase tracking-[.18em] text-ink-soft">Sobre mí</span>
          <h2 className="font-serif text-[26px] font-normal leading-tight md:text-[36px]">
            Soy Elvira, y llevo cinco años tejiendo por encargo
          </h2>
          <p className="text-[15px] font-light leading-relaxed text-ink/80 md:text-base">
            Empecé haciendo amigurumis para mi hijo y, punto a punto, aquello acabó convirtiéndose en mi propio taller.
            Trabajo con algodón de alta calidad, relleno antialérgico y ojos de seguridad con anclaje, para que cada
            pieza aguante el cariño diario.
          </p>
          <p className="text-[15px] font-light leading-relaxed text-ink/80 md:text-base">
            Cada encargo empieza con una conversación: colores, tamaño y fecha. Te voy enseñando el avance en fotos
            antes de enviarlo.
          </p>
          <Link href="/sobre-mi" className="w-fit border-b border-pink pb-0.5 text-[13.5px] font-medium">
            Conóceme mejor
          </Link>
        </div>
      </section>

      {/* Testimonials only when there are any */}
      {testimonials.length > 0 && (
        <section className="bg-cream px-5 py-12 md:px-14 md:py-16">
          <h2 className="mb-5 font-serif text-[26px] font-normal md:mb-6 md:text-[34px]">Lo que dicen mis clientas</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
            {testimonials.map((t) => (
              <figure key={t.id} className="flex flex-col gap-4 rounded-2xl bg-white p-6">
                <span className="text-sm tracking-[.14em] text-sage">★★★★★</span>
                <blockquote className="font-serif text-[16px] leading-relaxed text-ink">«{t.text}»</blockquote>
                <figcaption className="mt-auto flex flex-col">
                  <span className="text-[13.5px] font-medium">{t.author}</span>
                  {t.origin && <span className="text-xs text-ink/55">{t.origin}</span>}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* Closing call to action */}
      <section className="flex flex-col items-center gap-4 bg-pink/35 px-5 py-12 text-center md:py-16">
        <h2 className="max-w-xl font-serif text-[26px] font-normal leading-tight md:text-[34px]">
          ¿Tienes una idea? La tejemos juntas
        </h2>
        <p className="max-w-md text-[15px] font-light text-ink/78">
          Mándame una foto o descríbeme lo que buscas y te digo precio y plazo, sin compromiso.
        </p>
        <Link href="/encargo" className="rounded-full bg-ink px-7 py-3.5 text-[15px] font-medium text-surface">
          Pedir a medida
        </Link>
      </section>

      <FooterWithSettings />
    </>
  );
}
