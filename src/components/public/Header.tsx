"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/catalogo", label: "Tienda" },
  { href: "/como-funciona", label: "Cómo funciona" },
  { href: "/faq", label: "Preguntas frecuentes" },
  { href: "/sobre-mi", label: "Sobre mí" },
  { href: "/contacto", label: "Contacto" },
];

export function Header({ statusLabel = "Encargos abiertos" }: { statusLabel?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-ink/10 bg-surface">
      <div className="flex items-center justify-between px-5 py-3.5 md:px-14 md:py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-pink font-serif text-[12px] font-medium text-ink md:h-[30px] md:w-[30px] md:text-[13px]">
            m
          </span>
          <span className="font-serif text-[17px] font-medium leading-none text-ink md:text-[20px]">
            Mundodelana
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-ink md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-pink-deep">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <span className="flex items-center gap-1.5 rounded-full border border-sage/50 bg-white px-3 py-1.5 text-[12.5px] text-ink">
            <span className="h-1.5 w-1.5 rounded-full bg-sage" />
            {statusLabel}
          </span>
          <Link href="/cuenta" className="border-b border-ink/30 pb-0.5 text-[13.5px] text-ink">
            Mi cuenta
          </Link>
        </div>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Abrir menú"
          className="flex h-10 w-10 flex-col items-center justify-center gap-1 rounded-[10px] border border-ink/15 bg-white md:hidden"
        >
          <span className="h-[1.5px] w-4 bg-ink" />
          <span className="h-[1.5px] w-4 bg-ink" />
          <span className="h-[1.5px] w-4 bg-ink" />
        </button>
      </div>

      {menuOpen && (
        <div className="flex flex-col bg-white md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="border-b border-ink/8 px-5 py-3.5 text-[14.5px] text-ink"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-2.5 bg-surface p-4">
            <Link
              href="/encargo"
              onClick={() => setMenuOpen(false)}
              className="flex-1 rounded-full bg-pink px-4 py-2.5 text-center text-[13.5px] font-medium text-ink"
            >
              Pedir a medida
            </Link>
            <Link
              href="/contacto"
              onClick={() => setMenuOpen(false)}
              className="flex-1 rounded-full border border-ink/18 bg-white px-4 py-2.5 text-center text-[13.5px] font-medium text-ink"
            >
              WhatsApp
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
