"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_ZOOM, MIN_ZOOM, frameStyle, type Frame, type Framing } from "@/lib/framing";

type Value = { focalX: number; focalY: number; zoom: number };

const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));
const round = (n: number) => Math.round(n * 1000) / 1000;

/** One framed box, styled exactly like the shop renders it. */
function FramedBox({ src, value, frame, className = "" }: { src: string; value: Framing; frame: Frame; className?: string }) {
  return (
    <span className={`relative block overflow-hidden bg-white/10 ${frame.round ? "rounded-full" : "rounded-lg"} ${className}`} style={{ aspectRatio: frame.aspect }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- same object-cover + framing style as the public next/image */}
      <img src={src} alt="" draggable={false} className="absolute inset-0 h-full w-full select-none object-cover" style={frameStyle(value)} />
    </span>
  );
}

/**
 * Framing editor: the photo is shown inside the real box where the shop
 * displays it. Drag to move it, use the slider (or pinch / mouse wheel) to zoom.
 * The other places the photo appears update live underneath.
 */
export function FramingEditor({
  src,
  value: initial,
  frames,
  onChange,
  onClose,
}: {
  src: string;
  value: Framing;
  frames: Frame[];
  onChange: (value: Value) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState<Value>({ focalX: initial.focalX, focalY: initial.focalY, zoom: initial.zoom ?? 1 });
  const [active, setActive] = useState(0);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const pinch = useRef<{ distance: number; zoom: number } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const frame = frames[active];

  useEffect(() => {
    const img = new Image();
    img.onload = () => setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = src;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [src]);

  /**
   * Moves the photo by a pointer delta (px). With object-cover + a scale around
   * the focal point, a point of the photo under the finger stays under it when
   * the focal moves by -delta / (zoom * overflow - 1) on each axis.
   */
  function pan(dx: number, dy: number) {
    const box = boxRef.current?.getBoundingClientRect();
    if (!box || !natural) return;
    const cover = Math.max(box.width / natural.w, box.height / natural.h);
    const rw = (natural.w * cover) / box.width;
    const rh = (natural.h * cover) / box.height;
    setValue((v) => {
      const sx = v.zoom * rw - 1;
      const sy = v.zoom * rh - 1;
      return {
        ...v,
        focalX: sx > 0.001 ? round(clamp(v.focalX - dx / box.width / sx)) : v.focalX,
        focalY: sy > 0.001 ? round(clamp(v.focalY - dy / box.height / sy)) : v.focalY,
      };
    });
  }

  const setZoom = (zoom: number) => setValue((v) => ({ ...v, zoom: round(clamp(zoom, MIN_ZOOM, MAX_ZOOM)) }));

  function onPointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), zoom: value.zoom };
      drag.current = null;
    } else {
      drag.current = { x: e.clientX, y: e.clientY };
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch.current && pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      setZoom((pinch.current.zoom * Math.hypot(a.x - b.x, a.y - b.y)) / pinch.current.distance);
      return;
    }
    if (drag.current) {
      pan(e.clientX - drag.current.x, e.clientY - drag.current.y);
      drag.current = { x: e.clientX, y: e.clientY };
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) drag.current = null;
  }

  // Width that fits the screen for any proportion: wide banners use the width, tall ones the height.
  const boxWidth = `min(92vw, ${frame.aspect * 52}vh, 760px)`;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[#1d1918] text-white" role="dialog" aria-label="Ajustar encuadre">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <span className="flex flex-col">
          <span className="text-[15px] font-medium">Encuadre</span>
          <span className="text-xs text-white/60">Arrastra la foto para moverla · acerca con el control o con dos dedos</span>
        </span>
        <button type="button" onClick={onClose} className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium" aria-label="Cancelar">
          Cancelar
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center gap-5 overflow-y-auto px-4 py-5">
        <div className="flex flex-col items-center gap-2">
          <span className="text-[12px] font-medium uppercase tracking-[.14em] text-white/55">{frame.label} · así se verá</span>
          <div
            ref={boxRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onWheel={(e) => setZoom(value.zoom - e.deltaY * 0.0015)}
            className={`relative cursor-grab touch-none overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,.25),0_20px_50px_rgba(0,0,0,.5)] active:cursor-grabbing ${frame.round ? "rounded-full" : "rounded-xl"}`}
            style={{ width: boxWidth, aspectRatio: frame.aspect }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- same object-cover + framing style as the public next/image */}
            <img src={src} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover" style={frameStyle(value)} />
            {/* Rule-of-thirds guides help to place the piece */}
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,transparent_33.2%,rgba(255,255,255,.28)_33.3%,transparent_33.4%,transparent_66.6%,rgba(255,255,255,.28)_66.7%,transparent_66.8%),linear-gradient(to_bottom,transparent_33.2%,rgba(255,255,255,.28)_33.3%,transparent_33.4%,transparent_66.6%,rgba(255,255,255,.28)_66.7%,transparent_66.8%)]" />
          </div>
        </div>

        <label className="flex w-full max-w-sm items-center gap-3">
          <span className="text-lg text-white/60" aria-hidden="true">−</span>
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            value={value.zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-pink"
            aria-label="Zoom"
          />
          <span className="text-lg text-white/60" aria-hidden="true">+</span>
          <span className="w-12 text-right text-xs tabular-nums text-white/60">{Math.round(value.zoom * 100)} %</span>
        </label>

        {frames.length > 1 && (
          <div className="flex w-full max-w-2xl flex-col gap-2">
            <span className="text-center text-[12px] text-white/55">También se ve así (toca uno para ajustarlo en grande):</span>
            <div className="flex flex-wrap items-end justify-center gap-4">
              {frames.map((f, i) => (
                <button
                  key={f.label}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl p-1.5 transition ${i === active ? "bg-white/15" : "opacity-75 hover:opacity-100"}`}
                >
                  <FramedBox src={src} value={value} frame={f} className={f.aspect >= 1.5 ? "w-[180px]" : "w-[96px]"} />
                  <span className="max-w-[180px] text-[11px] text-white/75">{f.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2.5 border-t border-white/10 px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 md:justify-center">
        <button type="button" onClick={() => setValue({ focalX: 0.5, focalY: 0.5, zoom: 1 })} className="flex-1 rounded-full bg-white/10 px-5 py-3 text-sm font-medium md:flex-none">
          Restablecer
        </button>
        <button
          type="button"
          onClick={() => {
            onChange(value);
            onClose();
          }}
          className="flex-1 rounded-full bg-pink px-6 py-3 text-sm font-medium text-admin-ink md:flex-none"
        >
          Guardar encuadre
        </button>
      </div>
    </div>
  );
}

export { FramedBox };
