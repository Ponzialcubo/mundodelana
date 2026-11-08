import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SplitHero } from "@/components/public/SplitHero";
import { FaqList } from "@/components/public/FaqList";
import { Icon, type IconName } from "@/components/public/Icon";
import { FooterWithSettings } from "@/components/public/FooterWithSettings";
import { getSiteImages } from "@/lib/site-images";
import { getSiteSettings, phoneDigits } from "@/lib/seo";

const title = "Cómo funciona";
const description =
  "Pide una pieza de crochet a medida en 5 pasos: me cuentas tu idea, te doy precio y plazo en menos de 24 h y solo pagas cuando confirmas. Envíos a toda España.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/como-funciona" },
  openGraph: { title, description, url: "/como-funciona" },
};

const STEPS = [
  { title: "Cuéntame qué quieres", text: "Elige una pieza de la tienda o mándame una foto o una idea, desde el formulario o por WhatsApp.", chip: "Gratis" },
  { title: "Te doy precio y plazo", text: "Contesto yo, no un bot, con el precio cerrado y la fecha en la que lo tendrías.", chip: "En menos de 24 h" },
  { title: "Confirmas y empiezo", text: "Pagas por Bizum o transferencia. En encargos de más de 50 €, solo la mitad al empezar.", chip: "Sin sorpresas" },
  { title: "Tejo tu pieza", text: "Te mando fotos del avance y puedes cambiar detalles mientras no esté montada.", chip: "1-2 semanas" },
  { title: "Te llega a casa", text: "Sale del taller con número de seguimiento. 4,50 €, gratis a partir de 60 €.", chip: "24-72 h" },
];

const INCLUDED: { icon: IconName; title: string; text: string }[] = [
  { icon: "tag", title: "Precio cerrado antes de empezar", text: "Lo acordado queda por escrito en el chat. Si un cambio afecta al precio, te aviso antes." },
  { icon: "camera", title: "Fotos del avance", text: "Validas colores y detalles mientras se teje, no al final." },
  { icon: "yarn", title: "Algodón 100 %", text: "DMC Baby Cotton, relleno antialérgico y ojos de seguridad anclados, nunca pegados." },
  { icon: "baby", title: "Apto para bebés", text: "Suave y apto para pieles delicadas. Si es para un recién nacido, dímelo al pedir." },
  { icon: "box", title: "Envío con seguimiento", text: "Península, Baleares y Canarias, siempre con número de seguimiento." },
  { icon: "shield", title: "Llega bien o lo arreglo", text: "Si algo llega defectuoso o dañado en el envío, lo reparo o lo rehago sin coste." },
];

// The questions people ask right before ordering, in this order.
const FAQ_KEYWORDS = ["Cuánto tarda", "Cómo pago", "envíos", "cambiar algo", "devoluciones", "Consultar precio"];

export default async function ComoFuncionaPage() {
  const [{ phone }, images, total, faqs, testimonials] = await Promise.all([
    getSiteSettings(),
    getSiteImages(),
    prisma.product.count({ where: { publicationStatus: "PUBLICADO" } }),
    prisma.faq.findMany({ orderBy: { order: "asc" } }),
    prisma.testimonial.findMany({ where: { visible: true }, orderBy: { order: "asc" }, take: 3 }),
  ]);
  // Until the owner uploads this page's photo, a real delivered order fills the frame.
  const delivered = images.how ? null : await prisma.libraryMedia.findFirst({ where: { showInGallery: true, mediaType: "IMAGE" }, orderBy: { takenAt: "desc" } });
  const wa = `https://wa.me/${phoneDigits(phone)}?text=${encodeURIComponent("Hola Elvira, me gustaría encargar una pieza.")}`;
  const keyFaqs = FAQ_KEYWORDS.map((k) => faqs.find((f) => f.question.toLowerCase().includes(k.toLowerCase()))).filter((f) => f !== undefined);

  return (
    <>
      <SplitHero
        eyebrow="Cómo funciona"
        title={
          <>
            Tu pieza hecha a mano,
            <br />
            <em className="text-pink-deep">sin complicaciones</em>
          </>
        }
        text="Me cuentas qué quieres, te digo precio y plazo, y solo cuando estés conforme empiezo a tejer. Sin carritos y sin compromiso hasta que digas que sí."
        photo={images.how ?? (delivered && { url: delivered.url, focalX: 0.5, focalY: 0.5 })}
        badge={
          <div className="flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-[0_12px_32px_rgba(74,63,59,.14)]">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E3F5E9] text-[#1FAF55]">
              <Icon name="chat" />
            </span>
            <span className="flex flex-col">
              <span className="text-[13.5px] font-medium">Presupuesto en menos de 24 h</span>
              <span className="text-[12px] text-ink/60">Contesto yo, no un bot</span>
            </span>
          </div>
        }
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/encargo" className="rounded-full bg-ink px-7 py-4 text-center text-[15px] font-medium text-surface">
            Pedir presupuesto gratis
          </Link>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="rounded-full border border-ink/20 bg-white px-7 py-4 text-center text-[15px] font-medium">
            Escribir por WhatsApp
          </a>
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[13.5px] text-ink/70">
          {["Sin compromiso", "No pagas hasta confirmar", "Envíos a toda España"].map((t) => (
            <li key={t} className="flex items-center gap-1.5">
              <span className="text-sage">
                <Icon name="check" className="h-4 w-4" />
              </span>
              {t}
            </li>
          ))}
        </ul>
      </SplitHero>

      {/* Two ways to order */}
      <section className="px-5 py-12 md:px-14 md:py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-6 font-serif text-[28px] font-normal md:mb-8 md:text-center md:text-[36px]">Dos formas de pedir</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            {[
              { icon: "shop" as const, title: "Elige algo de la tienda", text: `Hay ${total} piezas que puedo tejer igual o en los colores que prefieras.`, href: "/catalogo", cta: "Ver la tienda", tint: "#F1DCDD" },
              { icon: "pencil" as const, title: "Pide algo a medida", text: "Mándame una foto de referencia o descríbeme tu idea y lo tejo desde cero.", href: "/encargo", cta: "Contar mi idea", tint: "#E3EADB" },
            ].map((c) => (
              <Link key={c.href} href={c.href} className="group flex items-start gap-4 rounded-3xl bg-white p-6 shadow-[0_6px_24px_rgba(74,63,59,.06)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(74,63,59,.10)] md:p-8">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl" style={{ background: c.tint }}>
                  <Icon name={c.icon} className="h-6 w-6" />
                </span>
                <span className="flex flex-col gap-1.5">
                  <span className="font-serif text-[22px] leading-tight">{c.title}</span>
                  <span className="text-[14.5px] font-light leading-relaxed text-ink/75">{c.text}</span>
                  <span className="mt-1.5 text-[14px] font-medium text-pink-deep">
                    {c.cta} <span className="inline-block transition group-hover:translate-x-0.5">→</span>
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="bg-cream px-5 py-12 md:px-14 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-1.5 md:mb-10 md:items-center md:text-center">
            <h2 className="font-serif text-[28px] font-normal md:text-[36px]">Paso a paso</h2>
            <p className="max-w-lg text-[15px] font-light text-ink/70">De la idea a tu casa en unas dos semanas.</p>
          </div>
          <ol className="relative grid grid-cols-1 gap-4 md:grid-cols-5 md:gap-4">
            <span aria-hidden="true" className="absolute bottom-8 left-[27px] top-8 border-l-2 border-dashed border-pink-deep/25 md:hidden" />
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative flex gap-4 md:flex-col md:gap-0 md:rounded-3xl md:bg-white md:p-6 md:shadow-[0_6px_24px_rgba(74,63,59,.05)]">
                <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white font-serif text-[22px] text-pink-deep shadow-[0_6px_18px_rgba(74,63,59,.08)] md:mb-4 md:h-12 md:w-12 md:bg-pink/40 md:text-[20px] md:text-ink md:shadow-none">
                  {i + 1}
                </span>
                <span className="flex flex-col gap-1.5 rounded-2xl bg-white p-4 md:bg-transparent md:p-0">
                  <span className="font-serif text-[18.5px] leading-snug">{s.title}</span>
                  <span className="text-[14px] font-light leading-relaxed text-ink/75">{s.text}</span>
                  <span className="mt-1.5 w-fit rounded-full bg-surface px-3 py-1 text-[12px] font-medium text-ink/70 md:bg-cream">{s.chip}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What every order includes */}
      <section className="px-5 py-12 md:px-14 md:py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-6 font-serif text-[28px] font-normal md:mb-8 md:text-center md:text-[36px]">Lo que incluye cada encargo</h2>
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {INCLUDED.map((item) => (
              <div key={item.title} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink/35 text-ink">
                  <Icon name={item.icon} />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="font-serif text-[18px] leading-snug">{item.title}</span>
                  <span className="text-[14px] font-light leading-relaxed text-ink/72">{item.text}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="bg-cream px-5 py-12 md:px-14 md:py-16">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.id} className="flex flex-col gap-4 rounded-2xl bg-white p-6">
                <span className="text-sm tracking-[.14em] text-sage">★★★★★</span>
                <blockquote className="font-serif text-[16px] leading-relaxed">«{t.text}»</blockquote>
                <figcaption className="mt-auto text-[13.5px] font-medium">{t.author}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {keyFaqs.length > 0 && (
        <section className="px-5 pb-12 md:px-14 md:pb-16">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[.8fr_1.2fr] lg:gap-14">
            <div className="flex flex-col gap-2">
              <h2 className="font-serif text-[28px] font-normal md:text-[36px]">Antes de pedir</h2>
              <p className="text-[15px] font-light text-ink/70">Las dudas más habituales. Si te queda alguna, pregúntame sin compromiso.</p>
              <Link href="/faq" className="mt-2 w-fit border-b border-pink pb-0.5 text-[14px] font-medium">
                Ver todas las preguntas
              </Link>
            </div>
            <FaqList faqs={keyFaqs} />
          </div>
        </section>
      )}

      <section className="px-5 pb-14 md:px-14 md:pb-20">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 rounded-[28px] bg-ink px-6 py-12 text-center text-surface md:py-16">
          <h2 className="max-w-xl font-serif text-[30px] font-normal leading-tight md:text-[40px]">¿Tienes una idea en la cabeza?</h2>
          <p className="max-w-md text-[15.5px] font-light text-surface/80">
            Cuéntamela. Te digo si es viable, cuánto costaría y cuándo lo tendrías. Presupuestar no cuesta nada.
          </p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link href="/encargo" className="rounded-full bg-pink px-7 py-4 text-[15px] font-medium text-ink">
              Pedir presupuesto gratis
            </Link>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="rounded-full border border-surface/30 px-7 py-4 text-[15px] font-medium">
              Escribir por WhatsApp
            </a>
          </div>
        </div>
      </section>

      <FooterWithSettings />
    </>
  );
}
