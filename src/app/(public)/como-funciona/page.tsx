import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/public/PageHero";
import { HowItWorks } from "@/components/public/HowItWorks";
import { getSiteImages, responsive } from "@/lib/site-images";
import { FooterWithSettings } from "@/components/public/FooterWithSettings";
import { getSiteSettings, phoneDigits } from "@/lib/seo";

const title = "Cómo funciona";
const description =
  "Pide una pieza a medida en 5 pasos: escribes por WhatsApp, cerramos colores, tamaño y precio, y solo pagas cuando confirmas el encargo.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/como-funciona" },
  openGraph: { title, description, url: "/como-funciona" },
};

const STEPS = [
  { icon: "idea" as const, title: "Elige o pide algo a medida", text: "Mira la tienda o mándame una foto de referencia. Si no está hecho, lo tejo desde cero." },
  { icon: "chat" as const, title: "Escríbeme por WhatsApp", text: "Contesto yo, no un bot. Suelo responder el mismo día, de lunes a sábado." },
  { icon: "check" as const, title: "Cerramos detalles y precio", text: "Colores, tamaño, fecha y precio cerrado antes de empezar." },
  { icon: "yarn" as const, title: "Tejo tu pieza", text: "Te mando fotos del avance para que lo veas crecer." },
  { icon: "box" as const, title: "Te llega a casa", text: "Envío en 24-72 h a toda España, con número de seguimiento." },
];

const DETAILS = [
  { title: "Plazos", text: "Entre una y dos semanas, según la pieza. Si tienes una fecha límite, dímela y te confirmo antes de empezar." },
  { title: "Pagos", text: "Bizum o transferencia. En encargos de más de 50 €, la mitad al empezar y el resto al terminar." },
  { title: "Envíos", text: "Península, Baleares y Canarias. 4,50 €, gratis a partir de 60 €, siempre con seguimiento." },
  { title: "Cambios", text: "Puedes cambiar detalles mientras la pieza no esté montada. Si afecta al precio, te aviso antes." },
];

export default async function ComoFuncionaPage() {
  const [{ phone }, images] = await Promise.all([getSiteSettings(), getSiteImages()]);

  return (
    <>
      <PageHero
        eyebrow="Cómo funciona"
        title="Pedir algo hecho a mano es más fácil de lo que parece"
        text="Hablamos por WhatsApp, acordamos lo que quieres y solo entonces pagas. Sin carritos y sin compromiso hasta que digas que sí."
        image={responsive(images, "how")}
      />

      <HowItWorks steps={STEPS} title="Paso a paso" showLink={false} />

      <section className="px-5 py-12 md:px-14 md:py-16">
        <h2 className="mb-6 font-serif text-[28px] font-normal md:text-[34px]">Lo que conviene saber</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
          {DETAILS.map((d) => (
            <div key={d.title} className="flex flex-col gap-1.5 rounded-2xl bg-white p-5 md:p-6">
              <span className="font-serif text-[19px]">{d.title}</span>
              <span className="text-[14.5px] font-light leading-relaxed text-ink/78">{d.text}</span>
            </div>
          ))}
        </div>
        <Link href="/faq" className="mt-5 inline-block border-b border-pink pb-0.5 text-[14px] font-medium">
          Ver todas las preguntas frecuentes
        </Link>
      </section>

      <section className="flex flex-col items-center gap-5 bg-pink/35 px-5 py-14 text-center md:px-14">
        <h2 className="font-serif text-[28px] font-normal md:text-[34px]">¿Tienes una idea en la cabeza?</h2>
        <p className="max-w-md text-[15px] font-light text-ink/78">
          Cuéntamela sin compromiso. Te digo si es viable, cuánto costaría y cuándo lo tendrías.
        </p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link href="/encargo" className="rounded-full bg-ink px-6 py-4 text-[15px] font-medium text-surface">
            Pedir a medida
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
