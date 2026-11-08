"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Product clip as a silent loop: no sound (phone videos often have background
 * noise), starts by itself when on screen, pauses when scrolled away, and shows
 * a spinner until it can play.
 */
export function LoopVideo({ src, poster }: { src: string; poster?: string | null }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.5 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <video
        ref={ref}
        src={src}
        poster={poster ?? undefined}
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
        onCanPlay={() => setReady(true)}
        className="h-full w-full object-cover"
      />
      {!ready && (
        <span className="absolute inset-0 flex items-center justify-center" aria-label="Cargando vídeo">
          <span className="h-10 w-10 animate-spin rounded-full border-[3px] border-white/50 border-t-white" />
        </span>
      )}
    </>
  );
}
