"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";

export type GalleryItem = {
  url: string;
  mediaType: "image" | "video";
  posterUrl?: string | null;
  focalX: number;
  focalY: number;
};

export function ProductGallery({
  productName,
  items,
}: {
  productName: string;
  items: GalleryItem[];
}) {
  const photos = useMemo(() => items.filter((i) => i.mediaType === "image"), [items]);
  const videos = useMemo(() => items.filter((i) => i.mediaType === "video"), [items]);
  const [tab, setTab] = useState<"photos" | "videos">(photos.length > 0 ? "photos" : "videos");
  const [activeIndex, setActiveIndex] = useState(0);

  if (items.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <ImagePlaceholder label={`${productName} — sin foto`} className="h-[300px] rounded-xl md:h-[520px]" />
      </div>
    );
  }

  const visible = tab === "photos" ? photos : videos;
  const current = visible[activeIndex] ?? visible[0];

  function selectTab(next: "photos" | "videos") {
    setTab(next);
    setActiveIndex(0);
  }

  return (
    <div className="flex flex-col gap-3">
      {photos.length > 0 && videos.length > 0 && (
        <div className="flex w-fit rounded-full bg-cream p-1">
          <button
            type="button"
            onClick={() => selectTab("photos")}
            className="rounded-full px-4 py-1.5 text-[13px] font-medium"
            style={tab === "photos" ? { background: "#fff" } : { color: "rgba(74,63,59,.6)" }}
          >
            Fotos ({photos.length})
          </button>
          <button
            type="button"
            onClick={() => selectTab("videos")}
            className="rounded-full px-4 py-1.5 text-[13px] font-medium"
            style={tab === "videos" ? { background: "#fff" } : { color: "rgba(74,63,59,.6)" }}
          >
            Vídeos ({videos.length})
          </button>
        </div>
      )}

      <div className="relative h-[300px] overflow-hidden rounded-xl bg-cream md:h-[520px]">
        {current.mediaType === "video" ? (
          <video
            key={current.url}
            src={current.url}
            poster={current.posterUrl ?? undefined}
            controls
            playsInline
            className="h-full w-full object-contain"
          />
        ) : (
          // object-contain: the piece must always be fully visible here, never cropped.
          <Image
            src={current.url}
            alt={productName}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-contain"
            priority
          />
        )}
      </div>

      {visible.length > 1 && (
        <div className="grid grid-cols-4 gap-2.5 md:gap-3">
          {visible.map((item, i) => (
            <button
              key={item.url}
              type="button"
              onClick={() => setActiveIndex(i)}
              className="relative h-[66px] overflow-hidden rounded-lg md:h-[96px]"
              style={{ border: `2px solid ${activeIndex === i ? "#4A3F3B" : "transparent"}` }}
            >
              <Image
                src={item.mediaType === "video" ? item.posterUrl ?? item.url : item.url}
                alt={`${productName} — miniatura ${i + 1}`}
                fill
                sizes="120px"
                className="object-cover"
                style={{ objectPosition: `${item.focalX * 100}% ${item.focalY * 100}%` }}
              />
              {item.mediaType === "video" && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-[10px] text-ink">
                    ▶
                  </span>
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
