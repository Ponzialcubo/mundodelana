"use client";

import { useState } from "react";
import { SearchOverlay } from "@/components/public/SearchOverlay";

/** Looks like a search field; opens the instant search overlay. */
export function SearchLauncher({ placeholder = "Buscar piezas, categorías o personajes…" }: { placeholder?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-full border border-ink/14 bg-white px-5 py-3.5 text-left text-[15px] text-ink/50 shadow-[0_4px_14px_rgba(74,63,59,.05)] md:max-w-md"
      >
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        {placeholder}
      </button>
      {open && <SearchOverlay onClose={() => setOpen(false)} />}
    </>
  );
}
