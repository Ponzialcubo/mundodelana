"use client";

import { useRef } from "react";

export function FocalPointPicker({
  src,
  focalX,
  focalY,
  onChange,
  className = "",
  hint = true,
}: {
  src: string;
  focalX: number;
  focalY: number;
  onChange: (x: number, y: number) => void;
  className?: string;
  hint?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function updateFromEvent(e: { clientX: number; clientY: number }) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    onChange(Number(x.toFixed(3)), Number(y.toFixed(3)));
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    updateFromEvent(e);
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.buttons !== 1) return;
    updateFromEvent(e);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div
        ref={ref}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        className={`relative cursor-crosshair select-none overflow-hidden rounded-lg bg-cover bg-no-repeat ${className}`}
        style={{ backgroundImage: `url(${src})`, backgroundPosition: `${focalX * 100}% ${focalY * 100}%` }}
      >
        <div
          className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1.5px_rgba(0,0,0,0.5)]"
          style={{ left: `${focalX * 100}%`, top: `${focalY * 100}%`, background: "#D08F94" }}
        />
      </div>
      {hint && (
        <span className="text-xs text-admin-faint">Haz clic o arrastra sobre la foto para marcar el punto que siempre debe verse en la miniatura.</span>
      )}
    </div>
  );
}
