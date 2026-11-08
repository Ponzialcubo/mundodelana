"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Asks for a name and opens the new special date to fill in. */
export function NewCampaignButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/fechas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) return setError(json.error ?? "No se ha podido crear");
    router.push(`/admin/fechas/${json.id}`);
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="rounded-full bg-pink px-5 py-2.5 text-sm font-medium">
        + Nueva fecha especial
      </button>
    );
  }
  return (
    <form onSubmit={create} className="flex w-full flex-col gap-2 rounded-2xl border border-admin-ink/10 bg-white p-4 sm:w-auto sm:flex-row sm:items-center">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ej.: Reyes, Comuniones, Black Friday"
        className="rounded-lg border border-admin-ink/14 bg-admin-bg px-3.5 py-2.5 text-[16px] outline-none sm:w-72 md:text-sm"
      />
      <div className="flex gap-2">
        <button type="submit" disabled={saving || !name.trim()} className="flex-1 rounded-full bg-admin-ink px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50">
          {saving ? "Creando…" : "Crear"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-full px-3 py-2.5 text-sm text-admin-ink-soft">
          Cancelar
        </button>
      </div>
      {error && <span className="text-xs text-admin-danger">{error}</span>}
    </form>
  );
}
