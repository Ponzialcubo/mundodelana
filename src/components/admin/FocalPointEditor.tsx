"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Full-screen framing editor: the whole photo is shown uncropped, the owner
 * taps what must always stay visible, and live previews show the catalog card
 * (4:5) and the square thumbnail exactly as the shop will crop them.
 */
export function FocalPointEditor({
  src,
  focalX,
  focalY,
  onChange,
  onClose,
}: {
  src: string;
  focalX: number;
  focalY: number;
  onChange: (x: number, y: number) => void;
  onClose: () => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [point, setPoint] = useState({ x: focalX, y: focalY });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function update(e: React.PointerEvent) {
    const rect = imgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    setPoint({ x: Number(x.toFixed(3)), y: Number(y.toFixed(3)) });
  }

  function done() {
    onChange(point.x, point.y);
    onClose();
  }

  const objectPosition = `${point.x * 100}% ${point.y * 100}%`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-admin-ink/95 text-white" role="dialog" aria-label="Ajustar encuadre">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-medium">Toca lo que siempre debe verse</span>
        <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-xl" aria-label="Cancelar">
          ×
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center gap-4 overflow-y-auto px-4 pb-4 md:flex-row md:items-start md:justify-center md:gap-8">
        {/* Whole photo: coordinates map 1:1 onto the image because the wrapper hugs it */}
        <div className="relative w-fit touch-none select-none">
          {/* eslint-disable-next-line @next/next/no-img-element -- needs the natural aspect ratio to map taps to the photo */}
          <img
            ref={imgRef}
            src={src}
            alt=""
            draggable={false}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              update(e);
            }}
            onPointerMove={(e) => e.buttons === 1 && update(e)}
            className="block max-h-[52vh] w-auto max-w-full cursor-crosshair rounded-lg md:max-h-[75vh]"
          />
          <span
            className="pointer-events-none absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-[0_0_0_2px_rgba(0,0,0,.5)]"
            style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%`, background: "rgba(232,180,184,.6)" }}
          />
        </div>

        <div className="flex w-full max-w-[340px] flex-col gap-3 md:w-[260px]">
          <span className="text-xs uppercase tracking-wider text-white/60">Así se verá</span>
          <div className="flex items-end gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element -- live preview of the crop */}
                <img src={src} alt="" className="h-full w-full object-cover" style={{ objectPosition }} />
              </div>
              <span className="text-[11px] text-white/60">Tienda</span>
            </div>
            <div className="flex w-[38%] flex-col gap-1.5">
              <div className="relative aspect-square overflow-hidden rounded-xl bg-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element -- live preview of the crop */}
                <img src={src} alt="" className="h-full w-full object-cover" style={{ objectPosition }} />
              </div>
              <span className="text-[11px] text-white/60">Miniatura</span>
            </div>
          </div>
          <div className="flex gap-2.5 pt-1">
            <button type="button" onClick={() => setPoint({ x: 0.5, y: 0.5 })} className="flex-1 rounded-full bg-white/15 px-4 py-3 text-sm font-medium">
              Centrar
            </button>
            <button type="button" onClick={done} className="flex-1 rounded-full bg-pink px-4 py-3 text-sm font-medium text-admin-ink">
              Listo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
