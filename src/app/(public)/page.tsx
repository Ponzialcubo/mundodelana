import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { ProductCard } from "@/components/public/ProductCard";
import { Footer } from "@/components/public/Footer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, categories, testimonials] = await Promise.all([
    prisma.product.findMany({
      where: { publicationStatus: "PUBLICADO", featured: true },
      include: { categories: true },
      take: 4,
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { products: true } } },
    }),
    prisma.testimonial.findMany({
      where: { visible: true },
      orderBy: { order: "asc" },
      take: 3,
    }),
  ]);

  const visibleCategories = categories.filter((c) => c._count.products > 0);

  return (
    <>
      {/* Hero */}
      <section className="flex flex-col items-center gap-5 px-5 py-14 text-center md:gap-6 md:px-14 md:py-20">
        <span className="font-mono text-[11px] uppercase tracking-[.16em] text-ink-soft">
          Crochet hecho a mano · España
        </span>
        <h1 className="max-w-3xl font-serif text-[34px] font-normal leading-[1.1] tracking-[-.015em] md:text-[62px] md:leading-[1.06]">
          Piezas de lana tejidas una a una, <em className="text-pink-deep not-italic">a tu medida</em>
        </h1>
        <p className="max-w-md text-[14.5px] font-light leading-relaxed text-ink/78 md:max-w-xl md:text-[17px] md:leading-relaxed">
          Amigurumis y decoración en algodón de mercería, con acabados que aguantan el uso diario. Cada encargo se
          teje desde cero.
        </p>
        <div className="mt-1 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            href="/catalogo"
            className="rounded-full bg-pink px-6 py-3.5 text-center text-[14.5px] font-medium text-ink"
          >
            Ver piezas disponibles
          </Link>
          <Link
            href="/encargo"
            className="rounded-full border border-ink/22 bg-white px-6 py-3.5 text-center text-[14.5px] font-medium text-ink"
          >
            Encargar algo personalizado
          </Link>
        </div>
        <div className="mt-1 flex flex-wrap justify-center gap-2.5 text-[12.5px] text-ink/60">
          <span>Envío en 24-72 h desde Galicia</span>
          <span>·</span>
          <span>Algodón OEKO-TEX</span>
          <span>·</span>
          <span>+50 encargos entregados</span>
        </div>
      </section>

      {/* Galería hero */}
      <section className="px-5 pb-14 md:px-14 md:pb-14">
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-[1.4fr_1fr] md:grid-rows-2 md:gap-3.5">
          <ImagePlaceholder
            label="foto hero — cesta de amigurumis sobre mesa de madera"
            className="col-span-2 h-[160px] rounded-xl md:col-span-1 md:row-span-2 md:h-full"
          />
          <ImagePlaceholder label="detalle de puntada" className="h-[130px] rounded-xl md:h-full" />
          <ImagePlaceholder label="manos tejiendo" className="h-[130px] rounded-xl md:h-full" />
        </div>
      </section>

      {/* Destacados */}
      <section className="px-5 pb-14 md:px-14 md:pb-16">
        <div className="mb-5 flex items-end justify-between md:mb-6">
          <div className="flex flex-col gap-1.5">
            <h2 className="font-serif text-2xl font-normal md:text-[32px]">Destacados</h2>
            <p className="hidden text-[14.5px] font-light text-ink/70 md:block">
              Seleccionados a mano esta semana. Stock real: si aparece, existe.
            </p>
          </div>
          <Link href="/catalogo" className="border-b border-pink pb-0.5 text-[13.5px] font-medium text-ink">
            Ver toda la tienda
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-4.5">
          {featured.map((p) => (
            <ProductCard
              key={p.id}
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
      </section>

      {/* Categorías */}
      <section className="border-y border-ink/8 bg-white px-5 py-12 md:px-14 md:py-14">
        <h2 className="mb-5 font-serif text-2xl font-normal md:mb-6 md:text-[32px]">Categorías</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-4">
          {visibleCategories.map((cat) => (
            <Link key={cat.id} href={`/catalogo?cat=${encodeURIComponent(cat.name)}`} className="flex flex-col gap-3">
              <ImagePlaceholder label={cat.name.toLowerCase()} className="h-[130px] rounded-[10px] md:h-[200px]" />
              <div className="flex items-baseline justify-between">
                <span className="font-serif text-base font-medium md:text-lg">{cat.name}</span>
                <span className="text-[12.5px] text-ink/55">{cat._count.products} piezas</span>
              </div>
              {cat.description && (
                <span className="hidden text-[13.5px] font-light leading-normal text-ink/70 md:block">
                  {cat.description}
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Sobre mí */}
      <section className="grid grid-cols-1 gap-8 px-5 py-14 md:grid-cols-[420px_1fr] md:items-center md:gap-13 md:px-14 md:py-16">
        <ImagePlaceholder label="foto de la artesana en su taller" className="h-[260px] rounded-xl md:h-[420px]" />
        <div className="flex max-w-xl flex-col gap-4">
          <span className="font-mono text-[11.5px] uppercase tracking-[.16em] text-ink-soft">Sobre mí</span>
          <h2 className="font-serif text-2xl font-normal leading-tight md:text-[34px]">
            Soy Elvira, y llevo cinco años tejiendo por encargo
          </h2>
          <p className="text-[15px] font-light leading-relaxed text-ink/80 md:text-base">
            Empecé haciendo amigurumis para mi hijo y, paso a paso, aquello acabó convirtiéndose en mi propio taller.
            Trabajo exclusivamente con algodón de alta calidad, relleno antialérgico y ojos de seguridad con anclaje
            o broche interno: no van pegados ni cosidos, así no se separan nunca.
          </p>
          <p className="text-[15px] font-light leading-relaxed text-ink/80 md:text-base">
            Cada encargo pasa por una conversación previa: revisamos juntas la foto de referencia, los colores, el
            tamaño y la fecha ideal. Te iré enseñando el avance en fotos antes de hacer el envío.
          </p>
          <div className="mt-1.5 flex gap-9 border-t border-ink/12 pt-3.5">
            <div className="flex flex-col gap-0.5">
              <span className="font-serif text-2xl font-medium">5 años</span>
              <span className="text-[12.5px] text-ink/60">tejiendo a mano</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-serif text-2xl font-medium">+50</span>
              <span className="text-[12.5px] text-ink/60">encargos entregados</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-serif text-2xl font-medium">1-3 días</span>
              <span className="text-[12.5px] text-ink/60">de trabajo por figura</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="bg-cream px-5 py-14 md:px-14 md:py-14">
        <h2 className="mb-5 font-serif text-2xl font-normal md:mb-6 md:text-[32px]">Lo que dicen mis clientas</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-4.5">
          {testimonials.map((t) => (
            <figure key={t.id} className="flex flex-col gap-4 rounded-xl bg-white p-6">
              <span className="text-sm tracking-[.14em] text-sage">★★★★★</span>
              <blockquote className="font-serif text-[16px] leading-relaxed text-ink md:text-[16.5px]">
                «{t.text}»
              </blockquote>
              <figcaption className="mt-auto flex items-center gap-2.5">
                <span className="h-[34px] w-[34px] rounded-full bg-pink" />
                <span className="flex flex-col">
                  <span className="text-[13.5px] font-medium">{t.author}</span>
                  {t.origin && <span className="text-xs text-ink/55">{t.origin}</span>}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <Footer full />
    </>
  );
}
