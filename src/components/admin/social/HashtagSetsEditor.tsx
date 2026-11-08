"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const INPUT = "w-full rounded-lg border border-admin-ink/14 bg-admin-bg px-3.5 py-2.5 text-[16px] outline-none focus:border-admin-ink/40 md:text-sm";

/** Hashtag groups: the AI picks from them and the composer can add a whole group with one tap. */
export function HashtagSetsEditor({ initial }: { initial: { name: string; tags: string }[] }) {
  const router = useRouter();
  const [sets, setSets] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (i: number, patch: Partial<{ name: string; tags: string }>) => {
    setSets((all) => all.map((s, j) => (j === i ? { ...s, ...patch } : s)));
    setSaved(false);
  };

  async function save() {
    setSaving(true);
    await fetch("/api/admin/redes/hashtags", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sets }) });
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-admin-ink/10 bg-white p-5 md:p-6">
      <p className="text-sm text-admin-ink-soft">
        Grupos de hashtags que usas a menudo. La IA los tiene en cuenta al escribir y, al preparar una publicación, puedes
        añadir un grupo entero con un toque. Instagram admite hasta 30 por publicación; lo ideal son 15-20.
      </p>
      {sets.map((s, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-xl border border-admin-ink/10 p-3.5 sm:flex-row sm:items-start">
          <input value={s.name} onChange={(e) => update(i, { name: e.target.value })} placeholder="Nombre del grupo" className={`${INPUT} sm:w-44`} />
          <textarea value={s.tags} onChange={(e) => update(i, { tags: e.target.value })} rows={2} placeholder="#crochet #ganchillo" className={INPUT} />
          <button type="button" onClick={() => setSets((all) => all.filter((_, j) => j !== i))} className="self-end text-xs font-medium text-admin-danger sm:self-center">
            Quitar
          </button>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setSets((all) => [...all, { name: "", tags: "" }])} className="rounded-full border border-admin-ink/16 px-4 py-2 text-sm font-medium">
          + Nuevo grupo
        </button>
        <button type="button" onClick={save} disabled={saving} className="rounded-full bg-admin-ink px-5 py-2 text-sm font-medium text-white disabled:opacity-60">
          {saving ? "Guardando…" : "Guardar grupos"}
        </button>
        {saved && <span className="text-sm font-medium text-admin-link">✓ Guardado</span>}
      </div>
    </div>
  );
}
