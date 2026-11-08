"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { FadeImage } from "@/components/public/FadeImage";
import { LoopVideo } from "@/components/public/LoopVideo";

export type GalleryItem = {
  url: string;
  mediaType: "image" | "video";
  posterUrl?: string | null;
  focalX: number;
  focalY: number;
};

const position = (item: GalleryItem) => `${item.focalX * 100}% ${item.focalY * 100}%`;

export function ProductGallery({ productName, items }: { productName: string; items: GalleryItem[] }) {
  const photos = useMemo(() => items.filter((i) => i.mediaType === "image"), [items]);
  const videos = useMemo(() => items.filter((i) => i.mediaType === "video"), [items]);
  const [tab, setTab] = useState<"photos" | "videos">(photos.length > 0 ? "photos" : "videos");
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const visible = tab === "photos" ? photos : videos;


  if (items.length === 0) {
    return <ImagePlaceholder label={`${productName} — sin foto`} className="aspect-[4/5] w-full rounded-2xl" />;
  }

  function goTo(index: number) {
    setActive(index);
    const track = trackRef.current;
    if (track) track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  }

  function selectTab(next: "photos" | "videos") {
    setTab(next);
    setActive(0);
    trackRef.current?.scrollTo({ left: 0 });
  }

  // Keep the counter/thumbnails in sync when the user swipes the main image.
  function onScroll() {
    const track = trackRef.current;
    if (!track) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    if (index !== active) setActive(index);
  }

  const current = visible[active] ?? visible[0];

  return (
    <div className="flex flex-col gap-3 md:sticky md:top-24 md:self-start">
      {photos.length > 0 && videos.length > 0 && (
        <div className="flex w-fit rounded-full bg-cream p-1">
          {(["photos", "videos"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => selectTab(t)}
              className="rounded-full px-4 py-1.5 text-[13px] font-medium"
              style={tab === t ? { background: "#fff" } : { color: "rgba(74,63,59,.6)" }}
            >
              {t === "photos" ? `Fotos (${photos.length})` : `Vídeos (${videos.length})`}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 md:flex-row md:items-start">
      {/* Main image: swipeable on touch screens, one slide per item */}
      <div className="group/main relative -mx-5 md:mx-0 md:aspect-[4/5] md:h-[clamp(400px,calc(100svh-260px),720px)] md:max-w-full">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] md:h-full md:rounded-2xl"
        >
          {visible.map((item, i) => (
            <div key={item.url} className="relative aspect-[4/5] w-full shrink-0 snap-center bg-cream md:aspect-auto md:h-full">
              {item.mediaType === "video" ? (
                <LoopVideo src={item.url} poster={item.posterUrl} />
              ) : (
                <button type="button" onClick={() => setZoomed(true)} className="absolute inset-0 cursor-zoom-in" aria-label="Ver foto a pantalla completa">
                  <FadeImage
                    src={item.url}
                    alt={i === 0 ? productName : `${productName} — foto ${i + 1}`}
                    fill
                    sizes="(min-width: 768px) 560px, 100vw"
                    quality={80}
                    priority={i === 0}
                    className="object-cover"
                    style={{ objectPosition: position(item) }}
                  />
                </button>
              )}
            </div>
          ))}
        </div>
        {visible.length > 1 && (
          <>
            <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-ink/60 px-2.5 py-1 text-[12px] font-medium tabular-nums text-white backdrop-blur">
              {active + 1} / {visible.length}
            </span>
            {/* Desktop arrows, shown on hover */}
            {(
              [
                [-1, "left-3", "‹", "Anterior"],
                [1, "right-3", "›", "Siguiente"],
              ] as const
            ).map(([step, side, label, aria]) => (
              <button
                key={side}
                type="button"
                onClick={() => goTo(active + step)}
                disabled={active + step < 0 || active + step >= visible.length}
                aria-label={aria}
                className={`absolute top-1/2 ${side} hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-ink opacity-0 shadow-md transition group-hover/main:opacity-100 disabled:!opacity-0 md:flex`}
              >
                {label}
              </button>
            ))}
          </>
        )}
        {current?.mediaType === "image" && (
          <span className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-1 text-[12px] font-medium text-ink backdrop-blur">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" />
            </svg>
            Ampliar
          </span>
        )}
      </div>

      {visible.length > 1 && (
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 py-1 [scrollbar-width:none] md:order-first md:mx-0 md:max-h-[clamp(400px,calc(100svh-260px),720px)] md:shrink-0 md:flex-col md:overflow-y-auto md:overflow-x-visible md:px-0 md:py-0">
          {visible.map((item, i) => (
            <button
              key={item.url}
              type="button"
              onClick={() => goTo(i)}
              className={`shrink-0 rounded-xl border-2 p-[3px] transition ${active === i ? "border-ink" : "border-transparent opacity-70"}`}
              aria-label={`Ver ${item.mediaType === "video" ? "vídeo" : "foto"} ${i + 1}`}
              aria-current={active === i}
            >
              <span className="relative block aspect-[4/5] w-[64px] overflow-hidden rounded-lg bg-cream md:w-[72px]">
              <Image
                src={item.mediaType === "video" ? item.posterUrl ?? item.url : item.url}
                alt=""
                fill
                sizes="96px"
                className="object-cover"
                style={{ objectPosition: position(item) }}
              />
              {item.mediaType === "video" && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-xs text-white">▶</span>
              )}
              </span>
            </button>
          ))}
        </div>
      )}

      </div>

      {zoomed && current?.mediaType === "image" && (
        <Lightbox
          productName={productName}
          items={visible}
          index={active}
          onClose={(index) => {
            setZoomed(false);
            goTo(index);
          }}
        />
      )}
    </div>
  );
}

/**
 * Locks the page behind an overlay. `overflow: hidden` alone isn't enough on
 * iOS Safari, so the body is pinned in place and the scroll restored on close.
 */
function useScrollLock() {
  useEffect(() => {
    const y = window.scrollY;
    const body = document.body.style;
    const previous = { position: body.position, top: body.top, width: body.width, overflow: body.overflow };
    Object.assign(body, { position: "fixed", top: `-${y}px`, width: "100%", overflow: "hidden" });
    return () => {
      Object.assign(body, previous);
      window.scrollTo({ top: y, behavior: "instant" });
    };
  }, []);
}

/** Full-screen photo viewer: swipe or arrows between photos, whole photo never cropped. */
function Lightbox({
  productName,
  items,
  index: initialIndex,
  onClose,
}: {
  productName: string;
  items: GalleryItem[];
  index: number;
  onClose: (index: number) => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const trackRef = useRef<HTMLDivElement>(null);
  useScrollLock();

  // Open on the photo that was tapped, without animating through the others.
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (track) track.scrollLeft = initialIndex * track.clientWidth;
  }, [initialIndex]);

  function go(next: number) {
    const clamped = Math.max(0, Math.min(items.length - 1, next));
    setIndex(clamped);
    trackRef.current?.scrollTo({ left: clamped * trackRef.current.clientWidth, behavior: "smooth" });
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(index);
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function onScroll() {
    const track = trackRef.current;
    if (!track) return;
    const next = Math.round(track.scrollLeft / track.clientWidth);
    if (next !== index) setIndex(next);
  }

  // Rendered at the end of <body>: the sticky gallery would otherwise trap it under the header.
  return createPortal(<LightboxView {...{ productName, items, index, initialIndex, trackRef, go, onScroll, onClose }} />, document.body);
}

function LightboxView({
  productName,
  items,
  index,
  initialIndex,
  trackRef,
  go,
  onScroll,
  onClose,
}: {
  productName: string;
  items: GalleryItem[];
  index: number;
  initialIndex: number;
  trackRef: React.RefObject<HTMLDivElement | null>;
  go: (i: number) => void;
  onScroll: () => void;
  onClose: (index: number) => void;
}) {
  const arrow = "absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white backdrop-blur transition hover:bg-white/20 disabled:pointer-events-none disabled:opacity-0 md:flex";

  return (
    <div
      className="fixed inset-0 z-[60] flex touch-pan-x flex-col overscroll-none bg-[#171312]/95 backdrop-blur-md [animation:lightbox-in_.2s_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-label={productName}
    >
      <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-[calc(12px+env(safe-area-inset-top))] text-white md:px-6 md:pt-5">
        <span className="rounded-full bg-white/10 px-3 py-1.5 text-[13px] font-medium tabular-nums">
          {index + 1} / {items.length}
        </span>
        <span className="hidden min-w-0 truncate font-serif text-[17px] text-white/85 md:block">{productName}</span>
        <button
          type="button"
          onClick={() => onClose(index)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          aria-label="Cerrar"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>

      <div className="relative min-h-0 flex-1">
        <button type="button" onClick={() => go(index - 1)} disabled={index === 0} className={`${arrow} left-5`} aria-label="Foto anterior">
          ‹
        </button>
        <div ref={trackRef} onScroll={onScroll} className="flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none]">
          {items.map((item, i) => (
            <div
              key={item.url}
              className="relative flex h-full w-full shrink-0 snap-center items-center justify-center px-3 py-2 md:px-24 md:py-4"
              // Tapping the dark area around the photo closes the viewer.
              onClick={(e) => e.target === e.currentTarget && onClose(index)}
            >
              <span className="absolute h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/70" aria-hidden="true" />
              <Image
                src={item.url}
                alt={`${productName} — foto ${i + 1}`}
                width={1600}
                height={2000}
                sizes="100vw"
                quality={80}
                priority={Math.abs(i - initialIndex) <= 1}
                className="relative max-h-full w-auto max-w-full rounded-xl object-contain shadow-[0_20px_60px_rgba(0,0,0,.45)] md:rounded-2xl"
                style={{ height: "auto" }}
              />
            </div>
          ))}
        </div>
        <button type="button" onClick={() => go(index + 1)} disabled={index === items.length - 1} className={`${arrow} right-5`} aria-label="Foto siguiente">
          ›
        </button>
      </div>

      {items.length > 1 && (
        <div className="flex justify-center gap-2 overflow-x-auto px-4 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3 [scrollbar-width:none]">
          {items.map((item, i) => (
            <button
              key={item.url}
              type="button"
              onClick={() => go(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === index}
              className={`relative h-[60px] w-12 shrink-0 overflow-hidden rounded-lg transition ${i === index ? "opacity-100 ring-2 ring-white ring-offset-2 ring-offset-[#171312]" : "opacity-45 hover:opacity-80"}`}
            >
              <Image src={item.url} alt="" fill sizes="48px" className="object-cover" style={{ objectPosition: position(item) }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
