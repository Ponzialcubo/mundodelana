"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";

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

  // Close the full-screen viewer with Escape and lock page scroll behind it.
  useEffect(() => {
    if (!zoomed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomed(false);
      if (e.key === "ArrowRight") setActive((i) => Math.min(i + 1, visible.length - 1));
      if (e.key === "ArrowLeft") setActive((i) => Math.max(i - 1, 0));
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [zoomed, visible.length]);

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

      {/* Main image: swipeable on touch screens, one slide per item */}
      <div className="relative -mx-5 md:mx-0">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] md:rounded-2xl"
        >
          {visible.map((item, i) => (
            <div key={item.url} className="relative aspect-[4/5] w-full shrink-0 snap-center bg-cream">
              {item.mediaType === "video" ? (
                <video
                  src={item.url}
                  poster={item.posterUrl ?? undefined}
                  controls
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-contain"
                />
              ) : (
                <button type="button" onClick={() => setZoomed(true)} className="absolute inset-0 cursor-zoom-in" aria-label="Ver foto a pantalla completa">
                  <Image
                    src={item.url}
                    alt={i === 0 ? productName : `${productName} — foto ${i + 1}`}
                    fill
                    sizes="(min-width: 768px) 45vw, 100vw"
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
          <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-ink/60 px-2.5 py-1 text-[12px] font-medium text-white">
            {active + 1} / {visible.length}
          </span>
        )}
      </div>

      {visible.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {visible.map((item, i) => (
            <button
              key={item.url}
              type="button"
              onClick={() => goTo(i)}
              className="relative aspect-[4/5] w-[68px] shrink-0 overflow-hidden rounded-lg md:w-[84px]"
              style={{ outline: active === i ? "2px solid #4A3F3B" : "none", outlineOffset: 2, opacity: active === i ? 1 : 0.75 }}
              aria-label={`Ver foto ${i + 1}`}
            >
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
            </button>
          ))}
        </div>
      )}

      {/* Full-screen viewer: whole photo, never cropped */}
      {zoomed && current?.mediaType === "image" && (
        <div className="fixed inset-0 z-50 flex flex-col bg-ink/95" role="dialog" aria-label={productName}>
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <span className="text-sm">
              {active + 1} / {visible.length}
            </span>
            <button type="button" onClick={() => { setZoomed(false); goTo(active); }} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-xl" aria-label="Cerrar">
              ×
            </button>
          </div>
          <div className="relative flex-1">
            <Image src={current.url} alt={productName} fill sizes="100vw" quality={80} className="object-contain" />
          </div>
          {visible.length > 1 && (
            <div className="flex justify-center gap-4 py-4">
              <button type="button" disabled={active === 0} onClick={() => setActive(active - 1)} className="h-11 w-11 rounded-full bg-white/15 text-white disabled:opacity-30" aria-label="Anterior">
                ‹
              </button>
              <button type="button" disabled={active === visible.length - 1} onClick={() => setActive(active + 1)} className="h-11 w-11 rounded-full bg-white/15 text-white disabled:opacity-30" aria-label="Siguiente">
                ›
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
