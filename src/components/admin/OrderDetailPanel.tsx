"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STATES = ["NUEVO", "COTIZADO", "CONFIRMADO", "ENVIADO", "ENTREGADO"] as const;
const STATE_LABEL: Record<(typeof STATES)[number], string> = {
  NUEVO: "Nuevo",
  COTIZADO: "Cotizado",
  CONFIRMADO: "Confirmado",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
};

export function OrderStateChips({ id, current }: { id: string; current: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function setState(state: string) {
    setLoading(true);
    await fetch(`/api/admin/pedidos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {STATES.map((s) => (
        <button
          key={s}
          onClick={() => setState(s)}
          disabled={loading}
          className="rounded-full px-3 py-1.5 text-[13px] disabled:opacity-60"
          style={
            current === s
              ? { background: "#1F1B1A", color: "#F7F6F4", fontWeight: 500 }
              : { background: "#fff", border: "1px solid rgba(31,27,26,.14)" }
          }
        >
          {STATE_LABEL[s]}
        </button>
      ))}
    </div>
  );
}

export function OrderNotes({ id, initialNotes }: { id: string; initialNotes: string }) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    await fetch(`/api/admin/pedidos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ internalNotes: notes }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={4}
        placeholder="Presupuesto enviado, pendiente de confirmación…"
        className="rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-2.5 text-sm outline-none"
      />
      <button
        onClick={save}
        disabled={loading}
        className="w-fit rounded-full border border-admin-ink/16 bg-white px-4 py-2 text-sm font-medium disabled:opacity-60"
      >
        {loading ? "Guardando…" : "Guardar nota"}
      </button>
    </div>
  );
}
