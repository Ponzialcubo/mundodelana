import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FaqAccordion } from "@/components/public/FaqAccordion";
import { Footer } from "@/components/public/Footer";

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const faqs = await prisma.faq.findMany({ orderBy: { order: "asc" } });

  return (
    <>
      <section className="flex flex-col items-center gap-4 px-5 py-12 text-center md:px-14 md:py-14">
        <span className="font-mono text-[11.5px] uppercase tracking-[.16em] text-ink-soft">
          Preguntas frecuentes
        </span>
        <h1 className="max-w-xl font-serif text-[30px] font-normal leading-tight md:text-[42px]">
          Lo que suelen preguntarme antes de encargar
        </h1>
      </section>

      <section className="px-5 pb-14 md:px-14 md:pb-16">
        <FaqAccordion faqs={faqs} />
      </section>

      <section className="flex flex-col items-center gap-5 border-t border-ink/8 bg-white px-5 py-14 text-center md:px-14">
        <h2 className="font-serif text-2xl font-normal md:text-[30px]">¿No encuentras tu respuesta?</h2>
        <p className="max-w-md text-[14.5px] font-light text-ink/75">
          Escríbeme y te contesto yo, no un bot. De lunes a sábado, normalmente el mismo día.
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
          <Link href="/como-funciona" className="rounded-full border border-ink/22 bg-white px-6 py-3.5 text-[14.5px] font-medium">
            Ver cómo funciona
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
