"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { SearchIndex } from "@/app/api/buscar/route";

// Shared across openings: the index is downloaded once per page view.
let indexPromise: Promise<SearchIndex> | null = null;
function loadIndex() {
  indexPromise ??= fetch("/api/buscar").then((r) => r.json());
  return indexPromise;
}

/** Lowercase without accents, so "munecas" finds "Muñecas" and "boligrafo" finds "Bolígrafo". */
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Every word typed must appear somewhere (name or terms); name matches rank first. */
function matches(text: string, words: string[]) {
  const t = norm(text);
  return words.every((w) => t.includes(w));
}

export function SearchOverlay({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadIndex().then(setIndex).catch(() => setIndex({ products: [], categories: [], brands: [], campaigns: [] }));
    inputRef.current?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const words = useMemo(() => norm(query).split(/\s+/).filter(Boolean), [query]);

  const results = useMemo(() => {
    if (!index || words.length === 0) return null;
    const byName = index.products.filter((p) => matches(p.name, words));
    const byTerms = index.products.filter((p) => !byName.includes(p) && matches(`${p.name} ${p.terms}`, words));
    return {
      categories: index.categories.filter((c) => matches(c.name, words)),
      brands: index.brands.filter((b) => matches(b.name, words)),
      campaigns: index.campaigns.filter((c) => matches(c.name, words)),
      products: [...byName, ...byTerms].slice(0, 24),
    };
  }, [index, words]);

  const empty = results && !results.categories.length && !results.brands.length && !results.campaigns.length && !results.products.length;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    onClose();
    router.push(`/catalogo?q=${encodeURIComponent(query.trim())}`);
  }

  const chip = "rounded-full border border-ink/14 bg-white px-3.5 py-2 text-[14px]";

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-surface" role="dialog" aria-label="Buscar">
      <form onSubmit={submit} className="flex items-center gap-2 border-b border-ink/10 px-4 py-3">
        <span className="text-lg text-ink/45" aria-hidden="true">⌕</span>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="search"
          enterKeyHint="search"
          placeholder="Busca piezas, categorías o personajes…"
          className="min-w-0 flex-1 bg-transparent py-2 text-[16px] text-ink outline-none"
        />
        <button type="button" onClick={onClose} className="shrink-0 px-2 py-2 text-[14px] font-medium text-ink/70">
          Cerrar
        </button>
      </form>

      <div className="flex-1 overflow-y-auto px-4 pb-10 pt-4">
        {!results && (
          <div className="flex flex-col gap-5">
            {!index && <span className="shimmer h-10 w-full rounded-full" />}
            {index && index.campaigns.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-[11.5px] uppercase tracking-[.14em] text-ink-soft">Ahora</span>
                <div className="flex flex-wrap gap-2">
                  {index.campaigns.map((c) => (
                    <Link key={c.slug} href={`/fechas/${c.slug}`} onClick={onClose} className={`${chip} border-pink bg-pink/30`}>
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {index && (
              <div className="flex flex-col gap-2">
                <span className="text-[11.5px] uppercase tracking-[.14em] text-ink-soft">Categorías</span>
                <div className="flex flex-wrap gap-2">
                  {index.categories.map((c) => (
                    <Link key={c.slug} href={`/categoria/${c.slug}`} onClick={onClose} className={chip}>
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {index && index.brands.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-[11.5px] uppercase tracking-[.14em] text-ink-soft">Personajes y colecciones</span>
                <div className="flex flex-wrap gap-2">
                  {index.brands.map((b) => (
                    <Link key={b.slug} href={`/marca/${b.slug}`} onClick={onClose} className={chip}>
                      {b.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {results && (
          <div className="flex flex-col gap-6">
            {(results.campaigns.length > 0 || results.categories.length > 0 || results.brands.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {results.campaigns.map((c) => (
                  <Link key={c.slug} href={`/fechas/${c.slug}`} onClick={onClose} className={`${chip} border-pink bg-pink/30`}>
                    {c.name}
                  </Link>
                ))}
                {results.categories.map((c) => (
                  <Link key={c.slug} href={`/categoria/${c.slug}`} onClick={onClose} className={chip}>
                    {c.name} <span className="text-ink/45">· {c.count}</span>
                  </Link>
                ))}
                {results.brands.map((b) => (
                  <Link key={b.slug} href={`/marca/${b.slug}`} onClick={onClose} className={chip}>
                    {b.name} <span className="text-ink/45">· {b.count}</span>
                  </Link>
                ))}
              </div>
            )}

            {results.products.length > 0 && (
              <div className="flex flex-col divide-y divide-ink/8">
                {results.products.map((p) => (
                  <Link key={p.slug} href={`/producto/${p.slug}`} onClick={onClose} className="flex items-center gap-3 py-2.5">
                    <span className="relative h-16 w-[52px] shrink-0 overflow-hidden rounded-lg bg-cream">
                      {p.image && <Image src={p.image} alt="" fill sizes="64px" className="object-cover" />}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate font-serif text-[15.5px]">{p.name}</span>
                      <span className="text-[13px] text-ink-soft">{p.price}</span>
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {empty && (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <span className="font-serif text-xl">No encuentro «{query}»</span>
                <span className="max-w-xs text-[14px] text-ink/70">Casi todo se puede tejer por encargo. Cuéntame qué buscas.</span>
                <Link href="/encargo" onClick={onClose} className="rounded-full bg-pink px-5 py-3 text-[14px] font-medium">
                  Pedir a medida
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
