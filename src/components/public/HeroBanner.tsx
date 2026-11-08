"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { YarnBackdrop } from "@/components/public/YarnBackdrop";

type Slide = { url: string; focalX: number; focalY: number };

const SLIDE_MS = 6500;
const PHRASE_MS = 3200;

/** Cycles 0..length-1 on an interval; paused for people who prefer reduced motion. */
function useCycle(length: number, ms: number) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % length), ms);
    return () => clearInterval(id);
  }, [length, ms]);
  return [index, setIndex] as const;
}

/**
 * Home banner: the owner's background images cross-fading one after another,
 * with the second line of the title dissolving through her phrases.
 */
export function HeroBanner({
  slides,
  phrases,
  campaign,
}: {
  slides: Slide[];
  phrases: string[];
  campaign: { name: string; slug: string; accent: string } | null;
}) {
  const [slide, setSlide] = useCycle(slides.length, SLIDE_MS);
  const [phrase] = useCycle(phrases.length, PHRASE_MS);
  const hasImage = slides.length > 0;
  const words = phrases.length > 0 ? phrases : ["pensado para ti"];

  return (
    <section className="relative flex min-h-[78svh] items-end overflow-hidden md:min-h-[min(640px,calc(100svh-140px))] md:items-center">
      {hasImage ? (
        slides.map((s, i) => (
          <Image
            key={s.url}
            src={s.url}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            quality={80}
            className={`object-cover transition-[opacity,transform] duration-[1400ms] ease-out ${i === slide ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"}`}
            style={{ objectPosition: `${s.focalX * 100}% ${s.focalY * 100}%` }}
          />
        ))
      ) : (
        <YarnBackdrop />
      )}
      {hasImage && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#3d322e]/85 via-[#3d322e]/30 to-transparent md:bg-gradient-to-r md:from-[#3d322e]/75 md:via-[#3d322e]/35 md:to-transparent"
        />
      )}

      <div className={`relative flex w-full max-w-2xl flex-col gap-5 px-5 pb-12 pt-24 md:px-14 md:py-20 ${hasImage ? "text-white" : "text-ink"}`}>
        {campaign && (
          <Link href={`/fechas/${campaign.slug}`} className="w-fit rounded-full px-3.5 py-1.5 text-[12.5px] font-medium text-ink" style={{ background: campaign.accent }}>
            {campaign.name} · ver regalos ›
          </Link>
        )}
        <h1 className="font-serif text-[40px] font-normal leading-[1.08] tracking-[-.015em] md:text-[64px]">
          Tejido a mano,
          {/* All phrases share one grid cell so the line keeps the height of the longest one: no layout jump. */}
          <span className="grid" aria-live="off">
            {words.map((w, i) => (
              <em
                key={w}
                aria-hidden={i !== phrase}
                className={`col-start-1 row-start-1 transition-[opacity,filter,transform] duration-700 ease-out ${hasImage ? "text-pink" : "text-pink-deep"} ${
                  i === phrase ? "translate-y-0 opacity-100 blur-0" : "translate-y-1 opacity-0 blur-[6px]"
                }`}
              >
                {w}
              </em>
            ))}
          </span>
        </h1>
        <p className={`max-w-md text-[16px] font-light leading-relaxed md:text-[18px] ${hasImage ? "text-white/90" : "text-ink/80"}`}>
          Amigurumis, ropita de bebé, flores que no se marchitan y regalos de crochet hechos por encargo en Galicia.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/catalogo" className="rounded-full bg-pink px-7 py-4 text-center text-[15.5px] font-medium text-ink">
            Ver la tienda
          </Link>
          <Link
            href="/encargo"
            className={`rounded-full px-7 py-4 text-center text-[15.5px] font-medium ${hasImage ? "border border-white/60 text-white backdrop-blur-sm" : "border border-ink/22 bg-white/70 text-ink"}`}
          >
            Encargar algo personalizado
          </Link>
        </div>
        {slides.length > 1 && (
          <div className="mt-1 flex gap-2">
            {slides.map((s, i) => (
              <button
                key={s.url}
                type="button"
                onClick={() => setSlide(i)}
                aria-label={`Ver banner ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === slide ? "w-7 bg-white" : "w-3 bg-white/50"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
