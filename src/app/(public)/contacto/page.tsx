import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/public/ContactForm";
import { FooterWithSettings } from "@/components/public/FooterWithSettings";
import { PageHero } from "@/components/public/PageHero";
import { getSiteSettings, phoneDigits } from "@/lib/seo";
import { getSiteImages } from "@/lib/site-images";

const title = "Contacto";
const description =
  "Escríbeme por WhatsApp, Instagram o por formulario para pedir presupuesto sin compromiso. Contesto yo, no un bot, en menos de 24 h laborables.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/contacto" },
  openGraph: { title, description, url: "/contacto" },
};

function absoluteUrl(url: string) {
  return url.startsWith("http") ? url : `https://${url}`;
}

/** "instagram.com/mundolana16" -> "@mundolana16" */
function handle(url: string) {
  return "@" + url.replace(/\/+$/, "").split("/").pop();
}

export default async function ContactoPage() {
  const [{ phone, publicEmail, instagramUrl }, images] = await Promise.all([getSiteSettings(), getSiteImages()]);

  const channels = [
    {
      title: "WhatsApp",
      detail: `${phone} · la vía más rápida`,
      href: `https://wa.me/${phoneDigits(phone)}`,
      cta: "Abrir chat",
      style: { background: "#25D366", color: "#fff" },
    },
    instagramUrl && {
      title: "Instagram",
      detail: `${handle(instagramUrl)} · procesos y piezas nuevas`,
      href: absoluteUrl(instagramUrl),
      cta: "Ver perfil",
      style: { background: "linear-gradient(135deg,#F2A65A,#D85B8C 55%,#8E5BD6)", color: "#fff" },
    },
    { title: "Email", detail: publicEmail, href: `mailto:${publicEmail}`, cta: "Escribir", style: { background: "#fff", color: "#4A3F3B" } },
    { title: "Teléfono", detail: phone, href: `tel:${phoneDigits(phone)}`, cta: "Llamar", style: { background: "#fff", color: "#4A3F3B" } },
  ].filter(Boolean) as { title: string; detail: string; href: string; cta: string; style: React.CSSProperties }[];

  return (
    <>
      <PageHero
        eyebrow="Contacto"
        title="Escríbeme y hablamos"
        text="Contesto yo, no un bot, normalmente en menos de 24 horas. Pregunta lo que quieras: presupuestos, colores o plazos."
        image={images.contact}
      />

      <section className="grid grid-cols-1 gap-3 px-5 py-8 sm:grid-cols-2 md:grid-cols-4 md:gap-4 md:px-14 md:py-12">
        {channels.map((c) => (
          <a
            key={c.title}
            href={c.href}
            target={c.href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="flex flex-col gap-1 rounded-2xl p-5 shadow-[0_6px_20px_rgba(74,63,59,.06)]"
            style={c.style}
          >
            <span className="font-serif text-[21px]">{c.title}</span>
            <span className="text-[13.5px] opacity-90">{c.detail}</span>
            <span className="mt-2 text-[13.5px] font-medium underline underline-offset-4">{c.cta} ›</span>
          </a>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-8 px-5 pb-14 md:grid-cols-[1.3fr_1fr] md:gap-12 md:px-14 md:pb-16">
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 md:p-8">
          <div className="flex flex-col gap-1.5">
            <h2 className="font-serif text-[24px] font-normal md:text-[28px]">¿Prefieres dejarlo por escrito?</h2>
            <p className="text-[14.5px] font-light text-ink/75">Este formulario me llega igual y te respondo por el medio que me digas.</p>
          </div>
          <ContactForm />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 rounded-2xl bg-cream p-6">
            <span className="font-serif text-[19px]">Horario</span>
            <div className="flex flex-col gap-1 text-[14px] text-ink/78">
              <div className="flex justify-between"><span>Lunes a viernes</span><span>10:00 – 19:00</span></div>
              <div className="flex justify-between"><span>Sábado</span><span>10:00 – 14:00</span></div>
              <div className="flex justify-between"><span>Domingo</span><span>Cerrado</span></div>
            </div>
            <span className="mt-1 text-[12.5px] text-ink/55">Si escribes un domingo, te respondo el lunes por la mañana.</span>
          </div>
          <div className="flex flex-col gap-2 rounded-2xl bg-cream p-6">
            <span className="font-serif text-[19px]">¿Quieres encargar algo?</span>
            <span className="text-[14px] text-ink/75">Cuéntame tu idea con una foto de referencia y te digo precio y plazo.</span>
            <Link href="/encargo" className="mt-1 w-fit rounded-full bg-ink px-5 py-3 text-[14px] font-medium text-surface">
              Pedir a medida
            </Link>
          </div>
          <Link href="/faq" className="rounded-2xl border border-ink/12 bg-white p-6 text-[14px]">
            <span className="block font-serif text-[19px]">Preguntas frecuentes</span>
            Plazos, envíos, pagos y cuidados ›
          </Link>
        </div>
      </section>

      <FooterWithSettings />
    </>
  );
}
