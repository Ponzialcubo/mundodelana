"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SearchOverlay } from "@/components/public/SearchOverlay";

export type MenuSegment = { key: string; title: string; categories: { name: string; slug: string; count: number }[] };

const DESKTOP_LINKS = [
  { href: "/catalogo", label: "Tienda" },
  { href: "/como-funciona", label: "Cómo funciona" },
  { href: "/sobre-mi", label: "Sobre mí" },
  { href: "/contacto", label: "Contacto" },
];

const INFO_LINKS = [
  { href: "/encargo", label: "Pedir a medida" },
  { href: "/como-funciona", label: "Cómo funciona" },
  { href: "/faq", label: "Preguntas frecuentes" },
];

function absoluteUrl(url: string) {
  return url.startsWith("http") ? url : `https://${url}`;
}

export function Header({
  loggedIn = false,
  segments = [],
  campaign = null,
  instagramUrl = "",
  whatsapp = "",
}: {
  loggedIn?: boolean;
  segments?: MenuSegment[];
  campaign?: { name: string; slug: string } | null;
  instagramUrl?: string;
  whatsapp?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>("tienda");
  const pathname = usePathname();

  // Lock the page behind the menu while it's open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const toggle = (key: string) => setOpenSection((s) => (s === key ? null : key));

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-surface/95 backdrop-blur">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 md:px-14 md:py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo-mundolana.png" alt="" width={40} height={40} priority className="h-9 w-9 md:h-10 md:w-10" />
            <span className="font-serif text-[19px] font-medium leading-none text-ink md:text-[22px]">Mundolana</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm text-ink md:flex">
            {DESKTOP_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={pathname.startsWith(link.href) ? "text-pink-deep" : "hover:text-pink-deep"}>
                {link.label}
              </Link>
            ))}
            {campaign && (
              <Link href={`/fechas/${campaign.slug}`} className="rounded-full bg-pink/40 px-3 py-1.5 font-medium">
                {campaign.name}
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Buscar"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 bg-white text-ink"
            >
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </button>
            <Link href={loggedIn ? "/cuenta" : "/acceso"} className="hidden border-b border-ink/30 pb-0.5 text-[13.5px] text-ink md:block">
              {loggedIn ? "Mi cuenta" : "Entrar"}
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menú"
              className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-full border border-ink/15 bg-white md:hidden"
            >
              <span className="h-[1.5px] w-4 bg-ink" />
              <span className="h-[1.5px] w-4 bg-ink" />
              <span className="h-[1.5px] w-3 self-center bg-ink" />
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen mobile menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-surface md:hidden"
          role="dialog"
          aria-label="Menú"
          // Any link inside closes the menu (navigation happens client-side, the menu would stay open).
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) setMenuOpen(false);
          }}
        >
          <div className="flex items-center justify-between border-b border-ink/10 px-4 py-2.5">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/logo-mundolana.png" alt="" width={36} height={36} className="h-9 w-9" />
              <span className="font-serif text-[19px] font-medium">Mundolana</span>
            </Link>
            <button type="button" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú" className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-xl text-surface">
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-6">
            {campaign && (
              <Link href={`/fechas/${campaign.slug}`} className="mt-4 flex items-center justify-between rounded-2xl bg-pink/45 px-4 py-4">
                <span className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-[.14em] text-ink/70">Ahora</span>
                  <span className="font-serif text-[19px]">{campaign.name}</span>
                </span>
                <span className="text-xl text-ink/60">›</span>
              </Link>
            )}

            <nav className="mt-2 flex flex-col">
              <div className="border-b border-ink/10">
                <button type="button" onClick={() => toggle("tienda")} className="flex w-full items-center justify-between py-4 text-left" aria-expanded={openSection === "tienda"}>
                  <span className="font-serif text-[22px]">Tienda</span>
                  <span className={`text-xl text-ink/50 transition-transform ${openSection === "tienda" ? "rotate-90" : ""}`}>›</span>
                </button>
                {openSection === "tienda" && (
                  <div className="flex flex-col gap-4 pb-5">
                    <Link href="/catalogo" className="rounded-xl bg-white px-4 py-3 text-[15px] font-medium">
                      Ver toda la tienda
                    </Link>
                    {segments.map((s) => (
                      <div key={s.key} className="flex flex-col gap-1">
                        <span className="px-1 text-[11.5px] uppercase tracking-[.14em] text-ink-soft">{s.title}</span>
                        {s.categories.map((c) => (
                          <Link key={c.slug} href={`/categoria/${c.slug}`} className="flex items-center justify-between rounded-lg px-1 py-2 text-[16px]">
                            {c.name}
                            <span className="text-[13px] text-ink/45">{c.count}</span>
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-b border-ink/10">
                <button type="button" onClick={() => toggle("encargos")} className="flex w-full items-center justify-between py-4 text-left" aria-expanded={openSection === "encargos"}>
                  <span className="font-serif text-[22px]">Encargos</span>
                  <span className={`text-xl text-ink/50 transition-transform ${openSection === "encargos" ? "rotate-90" : ""}`}>›</span>
                </button>
                {openSection === "encargos" && (
                  <div className="flex flex-col pb-4">
                    {INFO_LINKS.map((l) => (
                      <Link key={l.href} href={l.href} className="px-1 py-2.5 text-[16px]">
                        {l.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link href="/sobre-mi" className="border-b border-ink/10 py-4 font-serif text-[22px]">
                Sobre mí
              </Link>
              <Link href="/contacto" className="border-b border-ink/10 py-4 font-serif text-[22px]">
                Contacto
              </Link>
            </nav>
          </div>

          <div className="flex flex-col gap-3 border-t border-ink/10 bg-white px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4">
            <Link href={loggedIn ? "/cuenta" : "/acceso"} className="rounded-full bg-ink px-5 py-3.5 text-center text-[15px] font-medium text-surface">
              {loggedIn ? "Mi cuenta" : "Entrar o crear cuenta"}
            </Link>
            <div className="flex gap-3">
              {whatsapp && (
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-full border border-ink/18 px-4 py-3 text-center text-[14px] font-medium">
                  WhatsApp
                </a>
              )}
              {instagramUrl && (
                <a href={absoluteUrl(instagramUrl)} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-full border border-ink/18 px-4 py-3 text-center text-[14px] font-medium">
                  Instagram
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  );
}
