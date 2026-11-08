"use client";

import { useState } from "react";
import { frameStyle } from "@/lib/framing";
import type { PostMedia } from "@/lib/social/publish";

/** Splits a caption so hashtags show in Instagram's blue. */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(#[\p{L}\p{N}_]+)/u).map((part, i) =>
        part.startsWith("#") ? (
          <span key={i} className="text-[#00376b]">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

/**
 * Phone-sized mock of the post as it will look in the Instagram feed: 4:5
 * photos with the same crop that gets published, carousel dots, and the
 * caption cut after the first lines like the app does.
 */
export function InstagramPreview({ media, caption, hashtags }: { media: PostMedia[]; caption: string; hashtags: string }) {
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const current = media[Math.min(index, media.length - 1)];
  const text = [caption.trim(), hashtags.trim()].filter(Boolean).join("\n\n");
  const short = text.length > 125 && !expanded;

  return (
    <div className="mx-auto w-full max-w-[340px] overflow-hidden rounded-[28px] border-[6px] border-admin-ink bg-white shadow-[0_20px_50px_rgba(31,27,26,.18)]">
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element -- tiny static logo */}
        <img src="/logo-mundolana.png" alt="" className="h-8 w-8 rounded-full border border-admin-ink/10" />
        <span className="flex flex-col leading-tight">
          <span className="text-[13px] font-semibold">mundolana16</span>
          <span className="text-[11px] text-admin-ink-soft">Galicia</span>
        </span>
        <span className="ml-auto text-lg leading-none text-admin-ink-soft">···</span>
      </div>

      <div className="relative aspect-[4/5] overflow-hidden bg-admin-bg">
        {current ? (
          current.kind === "video" ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption -- silent preview of the reel
            <video src={current.url} poster={current.posterUrl ?? undefined} muted loop autoPlay playsInline className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- same crop as the JPEG sent to Instagram
            <img src={current.url} alt="" className="absolute inset-0 h-full w-full object-cover" style={frameStyle(current)} />
          )
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-sm text-admin-ink-soft">Elige fotos</span>
        )}
        {media.length > 1 && (
          <>
            <span className="absolute right-2.5 top-2.5 rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-white">
              {index + 1}/{media.length}
            </span>
            {index > 0 && (
              <button type="button" onClick={() => setIndex(index - 1)} className="absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-sm" aria-label="Anterior">
                ‹
              </button>
            )}
            {index < media.length - 1 && (
              <button type="button" onClick={() => setIndex(index + 1)} className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-sm" aria-label="Siguiente">
                ›
              </button>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-3.5 px-3 pt-2.5 text-[20px] leading-none">
        <span>♡</span>
        <span>💬</span>
        <span>➤</span>
        {media.length > 1 && (
          <span className="mx-auto flex gap-1 pr-10">
            {media.map((m, i) => (
              <span key={m.url} className={`h-1.5 w-1.5 rounded-full ${i === index ? "bg-[#0095f6]" : "bg-admin-ink/20"}`} />
            ))}
          </span>
        )}
        <span className="ml-auto">🔖</span>
      </div>

      <div className="max-h-[260px] overflow-y-auto px-3 pb-4 pt-2 text-[13px] leading-snug">
        {text ? (
          <p className="whitespace-pre-line">
            <span className="mr-1 font-semibold">mundolana16</span>
            <Rich text={short ? `${text.slice(0, 125).trimEnd()}… ` : text} />
            {short && (
              <button type="button" onClick={() => setExpanded(true)} className="text-admin-ink-soft">
                más
              </button>
            )}
          </p>
        ) : (
          <p className="text-admin-ink-soft">El texto aparecerá aquí.</p>
        )}
      </div>
    </div>
  );
}
