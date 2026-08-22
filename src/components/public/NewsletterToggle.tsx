"use client";

import { useState } from "react";

export function NewsletterToggle({ initialActive }: { initialActive: boolean }) {
  const [active, setActive] = useState(initialActive);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const next = !active;
    try {
      const res = await fetch("/api/cuenta/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: next }),
      });
      if (res.ok) setActive(next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-ink/8 bg-white p-5">
      <span className="font-serif text-base font-medium">Newsletter</span>
      <button
        onClick={toggle}
        disabled={loading}
        className="flex h-6 w-11 items-center rounded-full p-0.5 transition-colors disabled:opacity-60"
        style={{ background: active ? "#9CAF88" : "#E2DFDB" }}
      >
        <span
          className="h-5 w-5 rounded-full bg-white transition-transform"
          style={{ transform: active ? "translateX(20px)" : "translateX(0)" }}
        />
      </button>
      <span className="text-xs text-ink/60">{active ? "Activada" : "Desactivada"}</span>
      <span className="text-xs text-ink/55">
        {active
          ? "Te aviso cuando hay piezas nuevas, un correo al mes como mucho."
          : "No recibirás avisos de nuevos productos por email."}
      </span>
    </div>
  );
}
