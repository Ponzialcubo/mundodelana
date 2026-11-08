import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { FooterWithSettings } from "@/components/public/FooterWithSettings";
import { getSiteSettings, phoneDigits } from "@/lib/seo";
import { getSiteImages } from "@/lib/site-images";
import { PageHero } from "@/components/public/PageHero";

const title = "Sobre mí";
const description =
  "Soy Elvira y tejo a mano cada pieza de Mundolana desde mi taller en Galicia: amigurumis, decoración y encargos personalizados en algodón 100 %.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/sobre-mi" },
  openGraph: { title, description, url: "/sobre-mi" },
};


// Workshop photos without finished products: the yarn and the pieces before assembly.
const WORKSHOP = [
  { src: "/uploads/23048a7d-014a-44d4-bb47-ec48937d5709.jpg", alt: "Ovillos de algodón DMC listos para empezar" },
  { src: "/uploads/4034d106-ef5b-4369-8160-30f8d3195a65.jpg", alt: "Piezas recién tejidas, antes de montarlas" },
];

const VALUES = [
  { title: "Materiales de mercería", text: "Algodón 100 % DMC Baby Cotton, relleno antialérgico y ojos de seguridad con anclaje interno. Se nota a los veinte lavados." },
  { title: "Personalización de verdad", text: "Trabajo desde tu foto de referencia: el peinado, el lunar, el jersey del equipo. Si es tejible, se teje." },
  { title: "Trato directo", text: "Hablas conmigo de principio a fin. Precio cerrado antes de empezar, fotos del avance y aviso si algo se retrasa." },
];

export default async function SobreMiPage() {
  const [{ phone }, images] = await Promise.all([getSiteSettings(), getSiteImages()]);

  return (
    <>
      <PageHero
        eyebrow="Sobre mí"
        title="Soy Elvira y tejo desde mi taller en Galicia"
        text="Empecé haciendo amigurumis para mi hijo y aquello acabó convirtiéndose en mi propio taller. Cinco años después sigo en la misma silla, con mejor luz y bastante más lana."
        image={images.about}
      />

      <section className="grid grid-cols-1 gap-8 px-5 py-12 md:grid-cols-[1fr_1fr] md:items-center md:gap-14 md:px-14 md:py-16">
        <div className="flex flex-col gap-4">
          <h2 className="font-serif text-[28px] font-normal md:text-[34px]">Cómo empezó todo</h2>
          <p className="text-[15.5px] font-light leading-relaxed text-ink/80">
            El primer amigurumi lo hice para mi hijo: un osito torcido, con un ojo más alto que el otro, que todavía
            duerme con él. A la semana me lo pidió una amiga, luego su madre, y así hasta hoy.
          </p>
          <p className="text-[15.5px] font-light leading-relaxed text-ink/80">
            Elegí el crochet porque es lento. No hay máquina que lo acelere: cada punto pasa por la mano, y eso obliga
            a pensar la pieza entera antes de empezar. Una figura mediana son entre uno y tres días de trabajo.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {WORKSHOP.map((photo, i) => (
            <div key={photo.src} className={`relative aspect-[4/5] overflow-hidden rounded-2xl ${i === 1 ? "mt-8" : ""}`}>
              <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 768px) 25vw, 45vw" className="object-cover" />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-cream px-5 py-12 md:px-14 md:py-16">
        <h2 className="mb-6 font-serif text-[28px] font-normal md:mb-8 md:text-center md:text-[34px]">Cómo trabajo</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-5">
          {VALUES.map((v, i) => (
            <div key={v.title} className="flex gap-4 rounded-2xl bg-white p-5 md:flex-col md:p-7">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink font-serif text-lg">{i + 1}</span>
              <span className="flex flex-col gap-1.5">
                <span className="font-serif text-[19px]">{v.title}</span>
                <span className="text-[14.5px] font-light leading-relaxed text-ink/78">{v.text}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col items-center gap-5 px-5 py-14 text-center md:px-14">
        <h2 className="font-serif text-[28px] font-normal md:text-[34px]">¿Empezamos con tu pieza?</h2>
        <p className="max-w-md text-[15px] font-light text-ink/75">Mira lo que hay hecho o cuéntame tu idea. Presupuesto sin compromiso.</p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link href="/catalogo" className="rounded-full bg-pink px-6 py-4 text-[15px] font-medium">
            Ver la tienda
          </Link>
          <a href={`https://wa.me/${phoneDigits(phone)}`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-ink/22 bg-white px-6 py-4 text-[15px] font-medium">
            Escribir por WhatsApp
          </a>
        </div>
      </section>

      <FooterWithSettings />
    </>
  );
}
