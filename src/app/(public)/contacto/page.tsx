import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/public/ContactForm";
import { FooterWithSettings } from "@/components/public/FooterWithSettings";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/session";
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

const ICONS: Record<string, React.ReactNode> = {
  WhatsApp: (
    <path d="M16.04 3C9.4 3 4 8.36 4 14.97c0 2.11.56 4.17 1.62 5.99L4 29l8.25-2.15a12.1 12.1 0 0 0 3.79.61h.01C22.68 27.46 28 22.1 28 15.49 28 8.88 22.68 3 16.04 3Zm5.43 14.58c-.3-.15-1.76-.86-2.03-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47 0 1.46 1.07 2.87 1.21 3.07.15.2 2.1 3.2 5.08 4.48 2.49 1.08 2.99.87 3.56.81.57-.06 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" fill="currentColor" />
  ),
  Instagram: (
    <g fill="none" stroke="currentColor" strokeWidth="2.4">
      <rect x="5" y="5" width="22" height="22" rx="6.5" />
      <circle cx="16" cy="16" r="5.2" />
      <circle cx="22.6" cy="9.4" r="1.2" fill="currentColor" stroke="none" />
    </g>
  ),
  Email: (
    <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round">
      <rect x="4.5" y="7.5" width="23" height="17" rx="3" />
      <path d="m5.5 9 10.5 8 10.5-8" />
    </g>
  ),
  Teléfono: (
    <path
      d="M11.2 5.5 8.4 5c-1.6 0-3.4 1.5-3.4 3.6C5 18 14 27 23.4 27c2.1 0 3.6-1.8 3.6-3.4l-.5-2.8-5.2-2.2-2.4 2.4c-2.8-1.3-5.6-4.1-6.9-6.9l2.4-2.4-2.2-5.2Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinejoin="round"
    />
  ),
};

export default async function ContactoPage() {
  const [{ phone, publicEmail, instagramUrl, hours }, images, customerId] = await Promise.all([getSiteSettings(), getSiteImages(), getCustomerSession()]);
  const customer = customerId ? await prisma.customer.findUnique({ where: { id: customerId }, select: { name: true, email: true } }) : null;
  const photo = images.contact;

  const channels = [
    { title: "WhatsApp", detail: "La vía más rápida", href: `https://wa.me/${phoneDigits(phone)}`, cta: "Abrir chat", color: "#1FAF55", tint: "#E3F5E9" },
    instagramUrl && { title: "Instagram", detail: handle(instagramUrl), href: absoluteUrl(instagramUrl), cta: "Ver perfil", color: "#C8467E", tint: "#FBE6EF" },
    { title: "Email", detail: publicEmail, href: `mailto:${publicEmail}`, cta: "Escribir", color: "#4A3F3B", tint: "#EFE7DE" },
    { title: "Teléfono", detail: phone, href: `tel:${phoneDigits(phone)}`, cta: "Llamar", color: "#4A3F3B", tint: "#EFE7DE" },
  ].filter(Boolean) as { title: string; detail: string; href: string; cta: string; color: string; tint: string }[];

  return (
    <>
      <section className="bg-gradient-to-b from-cream to-surface px-5 pb-12 pt-8 md:px-14 md:pb-16 md:pt-14">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <span className="text-[11.5px] font-medium uppercase tracking-[.18em] text-ink-soft">Contacto</span>
              <h1 className="font-serif text-[36px] font-normal leading-[1.06] md:text-[52px]">Escríbeme y hablamos</h1>
              <p className="max-w-lg text-[15.5px] font-light leading-relaxed text-ink/78 md:text-[17px]">
                Contesto yo, no un bot, normalmente en menos de 24 horas. Pregunta lo que quieras: presupuestos, colores o plazos.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {channels.map((c) => (
                <a
                  key={c.title}
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-3 rounded-2xl border border-ink/8 bg-white p-4 shadow-[0_6px_24px_rgba(74,63,59,.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(74,63,59,.10)] md:p-5"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: c.tint, color: c.color }}>
                    <svg viewBox="0 0 32 32" className="h-[22px] w-[22px]" aria-hidden="true">
                      {ICONS[c.title]}
                    </svg>
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="font-serif text-[19px] leading-tight">{c.title}</span>
                    <span className="truncate text-[12.5px] text-ink/60 md:text-[13.5px]">{c.detail}</span>
                  </span>
                  <span className="mt-auto text-[13px] font-medium" style={{ color: c.color }}>
                    {c.cta} <span className="inline-block transition group-hover:translate-x-0.5">→</span>
                  </span>
                </a>
              ))}
            </div>

            <div className="flex flex-col gap-3 rounded-2xl bg-white/70 p-5 md:flex-row md:items-center md:justify-between md:gap-6">
              <div className="flex items-center gap-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sage" />
                </span>
                <span className="text-[14px] font-medium">Respondo en menos de 24 h laborables</span>
              </div>
              <dl className="grid grid-cols-3 gap-3 text-[12.5px] md:text-right">
                <div><dt className="text-ink/55">Lun – Vie</dt><dd className="font-medium">{hours.weekday}</dd></div>
                <div><dt className="text-ink/55">Sábado</dt><dd className="font-medium">{hours.saturday}</dd></div>
                <div><dt className="text-ink/55">Domingo</dt><dd className="font-medium">{hours.sunday}</dd></div>
              </dl>
            </div>
          </div>

          <div className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-[0_14px_44px_rgba(74,63,59,.08)] lg:self-start">
            {photo && (
              <div className="relative aspect-[16/7]">
                <Image src={photo.url} alt="" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" style={{ objectPosition: `${photo.focalX * 100}% ${photo.focalY * 100}%` }} />
              </div>
            )}
            <div className="flex flex-col gap-4 p-5 md:p-8">
              <div className="flex flex-col gap-1.5">
                <h2 className="font-serif text-[24px] font-normal md:text-[28px]">¿Prefieres dejarlo por escrito?</h2>
                <p className="text-[14.5px] font-light text-ink/75">Te respondo por el medio que me digas. Si tienes cuenta, verás mi respuesta en «Mi cuenta → Mensajes».</p>
              </div>
              <ContactForm defaultName={customer?.name} defaultContact={customer?.email} />
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-14 md:px-14 md:pb-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          <Link href="/encargo" className="group flex items-center justify-between gap-4 rounded-2xl bg-pink/35 p-6 md:p-7">
            <span className="flex flex-col gap-1">
              <span className="font-serif text-[21px]">¿Quieres encargar algo?</span>
              <span className="text-[14px] text-ink/75">Cuéntame tu idea con una foto y te digo precio y plazo.</span>
            </span>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-surface transition group-hover:translate-x-0.5">→</span>
          </Link>
          <Link href="/faq" className="group flex items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-white p-6 md:p-7">
            <span className="flex flex-col gap-1">
              <span className="font-serif text-[21px]">Preguntas frecuentes</span>
              <span className="text-[14px] text-ink/75">Plazos, envíos, pagos y cuidados de las piezas.</span>
            </span>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink/15 transition group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
      </section>

      <FooterWithSettings />
    </>
  );
}
