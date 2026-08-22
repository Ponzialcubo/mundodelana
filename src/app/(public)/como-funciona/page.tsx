import Link from "next/link";
import { Footer } from "@/components/public/Footer";

const STEPS = [
  {
    n: 1,
    title: "Elige o pide algo a medida",
    text: "Mira la tienda o mándame una foto de referencia. Si no está hecho, lo tejo desde cero.",
  },
  {
    n: 2,
    title: "Escríbeme por WhatsApp",
    text: "Contesto yo, no un bot. Suelo responder el mismo día, de lunes a sábado.",
  },
  {
    n: 3,
    title: "Confirmamos detalles y precio",
    text: "Colores, tamaño, fecha y precio cerrado por WhatsApp antes de empezar.",
  },
  {
    n: 4,
    title: "Pagas por Bizum o transferencia",
    text: "En encargos grandes, la mitad al empezar y el resto al terminar. Te lo confirmo todo por WhatsApp.",
  },
  {
    n: 5,
    title: "Recibes tu pedido",
    text: "Te mando fotos del avance y el número de seguimiento. Envío en 24-72 h a toda España.",
  },
];

export default function ComoFuncionaPage() {
  return (
    <>
      <section className="flex flex-col items-center gap-4 px-5 py-12 text-center md:gap-4.5 md:px-14 md:py-16">
        <span className="font-mono text-[11.5px] uppercase tracking-[.16em] text-ink-soft">Cómo funciona</span>
        <h1 className="max-w-2xl font-serif text-[32px] font-normal leading-tight md:text-[50px]">
          Pedir algo hecho a mano es más fácil de lo que parece
        </h1>
        <p className="max-w-lg text-[15px] font-light leading-relaxed text-ink/80 md:text-[16.5px]">
          Hablamos por WhatsApp, acordamos lo que quieres y solo entonces pagas. Sin registrarte, sin carritos y sin
          compromiso hasta que digas que sí.
        </p>
      </section>

      <section className="px-5 pb-14 md:px-14 md:pb-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((s) => (
            <div key={s.n} className="flex flex-col gap-3.5 rounded-xl border border-ink/8 bg-white p-6">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/12 bg-surface font-serif text-[17px] font-medium">
                  {s.n}
                </span>
              </div>
              <span className="font-serif text-[19px] font-medium leading-tight">{s.title}</span>
              <span className="text-sm font-light leading-relaxed text-ink/78">{s.text}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col items-center gap-5 bg-cream px-5 py-14 text-center md:px-14">
        <h2 className="font-serif text-2xl font-normal md:text-[32px]">¿Tienes una idea en la cabeza?</h2>
        <p className="max-w-md text-[14.5px] font-light text-ink/75">
          Cuéntamela sin compromiso. Te digo si es viable, cuánto costaría y cuándo lo tendrías.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href="https://wa.me/34600000000"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-pink px-6 py-3.5 text-[14.5px] font-medium"
          >
            Escribir por WhatsApp
          </a>
          <Link href="/catalogo" className="rounded-full border border-ink/22 bg-white px-6 py-3.5 text-[14.5px] font-medium">
            Ver la tienda
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
