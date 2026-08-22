"use client";

import { useState } from "react";

export function WhatsAppFloat({ phone = "34600000000" }: { phone?: string }) {
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
      <a
        href={`https://wa.me/${phone}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 rounded-full bg-sage px-5 py-3.5 font-medium text-sm text-white shadow-[0_10px_26px_rgba(74,63,59,0.24)]"
      >
        <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-white text-[9.5px] font-semibold text-sage">
          WA
        </span>
        Escríbeme por WhatsApp
      </a>
      <button
        onClick={() => setOpen(false)}
        aria-label="Cerrar"
        className="flex h-7 w-7 items-center justify-center rounded-full border border-ink/15 bg-white text-ink shadow-[0_6px_16px_rgba(74,63,59,0.16)]"
      >
        ×
      </button>
    </div>
  );
}
