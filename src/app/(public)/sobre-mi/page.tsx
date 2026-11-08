import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { FooterWithSettings } from "@/components/public/FooterWithSettings";
import { SplitHero } from "@/components/public/SplitHero";
import { Icon, type IconName } from "@/components/public/Icon";
import { getSiteSettings, phoneDigits } from "@/lib/seo";
import { getSiteImages } from "@/lib/site-images";

const title = "Sobre mí";
const description =
  "Soy Elvira y tejo a mano cada pieza de Mundolana desde mi taller en Galicia: amigurumis, decoración y encargos personalizados en algodón 100 %.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/sobre-mi" },
  openGraph: { title, description, url: "/sobre-mi" },
};

// Real workshop photos used until the owner uploads her own in "Imágenes de la web".
const WORKSHOP_FALLBACK = [
  { url: "/uploads/23048a7d-014a-44d4-bb47-ec48937d5709.jpg", focalX: 0.5, focalY: 0.5 },
  { url: "/uploads/4034d106-ef5b-4369-8160-30f8d3195a65.jpg", focalX: 0.5, focalY: 0.5 },
];

const STATS = [
  ["5 años", "tejiendo"],
  ["+50", "encargos entregados"],
  ["100 %", "algodón"],
];

const VALUES: { icon: IconName; title: string; text: string }[] = [
  { icon: "yarn", title: "Materiales de mercería", text: "Algodón 100 % DMC Baby Cotton, relleno antialérgico y ojos de seguridad con anclaje interno, nunca pegados." },
  { icon: "heart", title: "Personalización de verdad", text: "Trabajo desde tu foto de referencia: el peinado, el lunar, el jersey del equipo. Si es tejible, se teje." },
  { icon: "chat", title: "Trato directo", text: "Hablas conmigo de principio a fin. Precio cerrado antes de empezar, fotos del avance y aviso si algo se retrasa." },
];

export default async function SobreMiPage() {
  const [{ phone }, images, gallery] = await Promise.all([
    getSiteSettings(),
    getSiteImages(),
    prisma.libraryMedia.findMany({ where: { showInGallery: true, mediaType: "IMAGE" }, orderBy: { takenAt: "desc" }, take: 5 }),
  ]);
  // The main photo borrows the first workshop shot until uploaded, so the story uses the other one plus a delivered order.
  const workshop = [images["about-2"] ?? (images.about ? WORKSHOP_FALLBACK[0] : (gallery[0] ? { url: gallery[0].url, focalX: 0.5, focalY: 0.5 } : WORKSHOP_FALLBACK[0])), images["about-3"] ?? WORKSHOP_FALLBACK[1]];

  return (
    <>
      <SplitHero
        eyebrow="Sobre mí"
        title={
          <>
            Soy Elvira, y cada pieza
            <br />
            <em className="text-pink-deep">pasa por mis manos</em>
          </>
        }
        text="Empecé haciendo amigurumis para mi hijo y aquello acabó convirtiéndose en mi propio taller en Galicia. Cinco años después sigo en la misma silla, con mejor luz y bastante más lana."
        photo={images.about ?? WORKSHOP_FALLBACK[0]}
        photoAlt="Elvira tejiendo en su taller"
        badge={
          <div className="rounded-2xl bg-white px-5 py-4 shadow-[0_12px_32px_rgba(74,63,59,.14)]">
            <span className="block font-serif text-[22px] italic leading-none text-pink-deep">Elvira</span>
            <span className="mt-1 block text-[12px] text-ink/60">Mundolana · taller en Galicia</span>
          </div>
        }
      >
        <dl className="grid max-w-md grid-cols-3 gap-3 border-y border-ink/10 py-4">
          {STATS.map(([big, small]) => (
            <div key={small} className="flex flex-col">
              <dt className="font-serif text-[24px] leading-none md:text-[28px]">{big}</dt>
              <dd className="mt-1 text-[12px] text-ink/60">{small}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/catalogo" className="rounded-full bg-ink px-7 py-4 text-center text-[15px] font-medium text-surface">
            Ver mis piezas
          </Link>
          <Link href="/encargo" className="rounded-full border border-ink/20 bg-white px-7 py-4 text-center text-[15px] font-medium">
            Encargar algo a medida
          </Link>
        </div>
      </SplitHero>

      {/* Story */}
      <section className="px-5 py-12 md:px-14 md:py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 grid grid-cols-2 gap-3 lg:order-1 lg:gap-4">
            {workshop.map((photo, i) => (
              <div key={photo.url} className={`relative aspect-[4/5] overflow-hidden rounded-3xl bg-cream ${i === 1 ? "mt-10" : ""}`}>
                <Image
                  src={photo.url}
                  alt={i === 0 ? "Materiales del taller" : "Piezas a medio tejer"}
                  fill
                  sizes="(min-width: 1024px) 280px, 45vw"
                  className="object-cover"
                  style={{ objectPosition: `${photo.focalX * 100}% ${photo.focalY * 100}%` }}
                />
              </div>
            ))}
          </div>
          <div className="order-1 flex flex-col gap-4 lg:order-2">
            <span className="text-[11.5px] font-medium uppercase tracking-[.2em] text-ink-soft">Mi historia</span>
            <h2 className="font-serif text-[30px] font-normal leading-tight md:text-[38px]">Cómo empezó todo</h2>
            <p className="text-[16px] font-light leading-relaxed text-ink/80">
              El primer amigurumi lo hice para mi hijo: un osito torcido, con un ojo más alto que el otro, que todavía duerme
              con él. A la semana me lo pidió una amiga, luego su madre, y así hasta hoy.
            </p>
            <p className="text-[16px] font-light leading-relaxed text-ink/80">
              Hoy tejo encargos para toda España: muñecos a partir de una foto, ropita de bebé, flores que no se marchitan y
              regalos para fechas especiales. Cada pieza la hago yo, de principio a fin.
            </p>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="bg-pink/25 px-5 py-14 md:px-14 md:py-20">
        <figure className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
          <span className="font-serif text-[56px] leading-none text-pink-deep/50" aria-hidden="true">
            “
          </span>
          <blockquote className="-mt-6 font-serif text-[24px] leading-snug md:text-[32px]">
            Elegí el crochet porque es lento. Cada punto pasa por la mano, y eso obliga a pensar la pieza entera antes de
            empezar.
          </blockquote>
          <figcaption className="text-[13.5px] text-ink/60">Una figura mediana son entre uno y tres días de trabajo</figcaption>
        </figure>
      </section>

      {/* How I work */}
      <section className="px-5 py-12 md:px-14 md:py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-6 font-serif text-[28px] font-normal md:mb-10 md:text-center md:text-[36px]">Cómo trabajo</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
            {VALUES.map((v) => (
              <div key={v.title} className="flex gap-4 rounded-3xl bg-white p-6 shadow-[0_6px_24px_rgba(74,63,59,.05)] md:flex-col md:p-8">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink/35">
                  <Icon name={v.icon} className="h-6 w-6" />
                </span>
                <span className="flex flex-col gap-1.5">
                  <span className="font-serif text-[20px]">{v.title}</span>
                  <span className="text-[14.5px] font-light leading-relaxed text-ink/75">{v.text}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="pb-12 md:px-14 md:pb-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-5 flex items-end justify-between gap-4 px-5 md:px-0">
              <div className="flex flex-col gap-1">
                <h2 className="font-serif text-[28px] font-normal md:text-[36px]">Trabajos entregados</h2>
                <p className="text-[14.5px] font-light text-ink/70">Algunos encargos que ya están en su nueva casa.</p>
              </div>
            </div>
            <div className="flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:grid md:grid-cols-5 md:overflow-visible md:px-0">
              {gallery.map((g) => (
                <figure key={g.id} className="flex w-[62vw] max-w-[240px] shrink-0 snap-start flex-col gap-2 md:w-auto md:max-w-none">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-cream">
                    <Image src={g.url} alt={g.galleryTitle ?? "Trabajo de crochet entregado"} fill sizes="(min-width: 768px) 18vw, 62vw" className="object-cover" />
                  </div>
                  {g.galleryTitle && <figcaption className="text-[13.5px] text-ink/75">{g.galleryTitle}</figcaption>}
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-5 pb-14 md:px-14 md:pb-20">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 rounded-[28px] bg-ink px-6 py-12 text-center text-surface md:py-16">
          <h2 className="max-w-xl font-serif text-[30px] font-normal leading-tight md:text-[40px]">¿Empezamos con tu pieza?</h2>
          <p className="max-w-md text-[15.5px] font-light text-surface/80">Mira lo que hay hecho o cuéntame tu idea. Presupuesto sin compromiso.</p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link href="/catalogo" className="rounded-full bg-pink px-7 py-4 text-[15px] font-medium text-ink">
              Ver la tienda
            </Link>
            <a href={`https://wa.me/${phoneDigits(phone)}`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-surface/30 px-7 py-4 text-[15px] font-medium">
              Escribir por WhatsApp
            </a>
          </div>
        </div>
      </section>

      <FooterWithSettings />
    </>
  );
}
