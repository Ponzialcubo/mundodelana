import Link from "next/link";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { Footer } from "@/components/public/Footer";

export default function SobreMiPage() {
  return (
    <>
      <section className="grid grid-cols-1 gap-8 px-5 py-12 md:grid-cols-[1fr_520px] md:items-center md:gap-12 md:px-14 md:py-16">
        <div className="flex flex-col gap-4">
          <span className="font-mono text-[11.5px] uppercase tracking-[.16em] text-ink-soft">Sobre mí</span>
          <h1 className="font-serif text-[30px] font-normal leading-tight md:text-[44px]">
            Soy Elvira y tejo desde mi taller en Galicia
          </h1>
          <p className="text-[15px] font-light leading-relaxed text-ink/80 md:text-base">
            Empecé haciendo amigurumis para mi hijo y, paso a paso, aquello acabó convirtiéndose en mi propio
            taller. Cinco años después sigo en la misma silla, con mejor luz y bastante más lana.
          </p>
          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            <Link href="/catalogo" className="rounded-full bg-pink px-6 py-3.5 text-center text-[14.5px] font-medium">
              Ver la tienda
            </Link>
            <a
              href="https://wa.me/34600000000"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-ink/22 bg-white px-6 py-3.5 text-center text-[14.5px] font-medium"
            >
              Escribirme
            </a>
          </div>
        </div>
        <ImagePlaceholder label="retrato de la artesana tejiendo en el taller" className="h-[280px] rounded-xl md:h-[420px]" />
      </section>

      <section className="border-t border-ink/8 bg-white px-5 py-12 md:px-14 md:py-14">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          <h2 className="font-serif text-2xl font-normal md:text-[28px]">Cómo empezó todo</h2>
          <p className="text-[15px] font-light leading-relaxed text-ink/80">
            El primer amigurumi lo hice para mi hijo: un osito torcido, con un ojo más alto que el otro, que
            todavía duerme con él. A la semana me lo pidió una amiga, luego su madre, y así hasta hoy.
          </p>
          <p className="text-[15px] font-light leading-relaxed text-ink/80">
            Elegí el crochet porque es lento. No hay máquina que lo acelere: cada punto pasa por la mano, y eso
            obliga a pensar la pieza entera antes de empezar. Una figura mediana son entre uno y tres días de
            trabajo, según lo complicada que sea.
          </p>
          <p className="text-[15px] font-light leading-relaxed text-ink/80">
            Para mí los materiales son lo primero: algodón de alta calidad, relleno antialérgico y ojos de
            seguridad con anclaje interno. Detrás del WhatsApp hay una persona con nombre y cara, no un formulario.
          </p>
        </div>
        <div className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-3 md:grid-cols-3">
          <ImagePlaceholder label="mesa de trabajo con ovillos ordenados" className="col-span-2 h-[180px] rounded-xl md:h-[220px]" />
          <ImagePlaceholder label="primer amigurumi, 2021" className="h-[180px] rounded-xl md:h-[220px]" />
          <ImagePlaceholder label="detalle de agujas e hilos" className="col-span-2 h-[180px] rounded-xl md:col-span-1 md:h-[220px]" />
        </div>
      </section>

      <section className="px-5 py-12 md:px-14 md:py-14">
        <h2 className="mb-6 text-center font-serif text-2xl font-normal md:text-[28px]">Cómo trabajo</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-2.5 rounded-xl border border-ink/8 bg-white p-6">
            <span className="font-serif text-[17px] font-medium">Materiales de mercería, no de bazar</span>
            <span className="text-sm font-light leading-relaxed text-ink/78">
              Algodón 100 % DMC Baby Cotton, relleno antialérgico y ojos de seguridad con anclaje interno. Cuesta
              más y se nota a los veinte lavados.
            </span>
          </div>
          <div className="flex flex-col gap-2.5 rounded-xl border border-ink/8 bg-white p-6">
            <span className="font-serif text-[17px] font-medium">Personalización de verdad</span>
            <span className="text-sm font-light leading-relaxed text-ink/78">
              No es elegir entre tres colores. Trabajo desde tu foto de referencia: el peinado, el lunar, el jersey
              del equipo. Si es tejible, se teje.
            </span>
          </div>
          <div className="flex flex-col gap-2.5 rounded-xl border border-ink/8 bg-white p-6">
            <span className="font-serif text-[17px] font-medium">Trato directo y sin sustos</span>
            <span className="text-sm font-light leading-relaxed text-ink/78">
              Hablas conmigo de principio a fin. Precio cerrado antes de empezar, fotos del avance y aviso si algo
              se retrasa.
            </span>
          </div>
        </div>
      </section>

      <section className="flex flex-col items-center gap-5 bg-cream px-5 py-14 text-center md:px-14">
        <h2 className="font-serif text-2xl font-normal md:text-[30px]">¿Empezamos con tu pieza?</h2>
        <p className="max-w-md text-[14.5px] font-light text-ink/75">
          Mira lo que hay hecho o cuéntame tu idea. Presupuesto sin compromiso y sin coste.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/catalogo" className="rounded-full bg-pink px-6 py-3.5 text-[14.5px] font-medium">
            Ver la tienda
          </Link>
          <a
            href="https://wa.me/34600000000"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-ink/22 bg-white px-6 py-3.5 text-[14.5px] font-medium"
          >
            Escribir por WhatsApp
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
