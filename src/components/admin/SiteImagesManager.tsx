"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageSlotEditor, type SlotValue } from "@/components/admin/ImageSlotEditor";
import type { SITE_IMAGE_GROUPS, SiteImageSlot, SiteImages } from "@/lib/site-images";

/** Each change is saved right away: there's no "Save" button to forget. */
export function SiteImagesManager({
  groups,
  slots,
  initial,
  phrases,
}: {
  groups: typeof SITE_IMAGE_GROUPS;
  slots: SiteImageSlot[];
  initial: SiteImages;
  phrases: string[];
}) {
  const router = useRouter();
  const [values, setValues] = useState<SiteImages>(initial);
  const [saved, setSaved] = useState<string | null>(null);

  function flash(key: string) {
    setSaved(key);
    setTimeout(() => setSaved(null), 2000);
  }

  async function save(key: string, value: SlotValue) {
    setValues((v) => ({ ...v, [key]: value ?? undefined }));
    await fetch("/api/admin/imagenes-web", {
      method: value ? "PUT" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value ? { key, ...value } : { key }),
    });
    flash(key);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-8">
      {groups.map((group) => (
        <section key={group.key} className="flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <h2 className="font-serif text-xl font-normal">{group.title}</h2>
            <p className="text-sm text-admin-ink-soft">{group.text}</p>
          </div>

          {group.key === "portada" && <PhrasesEditor initial={phrases} onSaved={() => flash("phrases")} saved={saved === "phrases"} />}

          {slots
            .filter((slot) => slot.group === group.key)
            .map((slot) => (
              <div key={slot.key} className="flex flex-col gap-3 rounded-xl border border-admin-ink/10 bg-white p-5 md:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-serif text-base font-medium">{slot.label}</span>
                    <span className="text-xs text-admin-ink-soft">{slot.where}</span>
                    <span className="text-xs text-admin-faint">Formato recomendado: {slot.ratio}</span>
                  </div>
                  {saved === slot.key && <span className="shrink-0 text-xs font-medium text-admin-link">✓ Guardado</span>}
                </div>
                <ImageSlotEditor
                  value={values[slot.key] ?? null}
                  onChange={(v) => save(slot.key, v)}
                  prompt={slot.prompt}
                  title={`Imagen: ${slot.label}`}
                  aspectClass={slot.aspectClass}
                />
              </div>
            ))}
        </section>
      ))}
    </div>
  );
}

/** The words that rotate after "Tejido a mano," in the home banner, one per line. */
function PhrasesEditor({ initial, onSaved, saved }: { initial: string[]; onSaved: () => void; saved: boolean }) {
  const [text, setText] = useState(initial.join("\n"));
  const [saving, setSaving] = useState(false);

  async function save() {
    const heroPhrases = text.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 8);
    setSaving(true);
    await fetch("/api/admin/ajustes", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ heroPhrases }) });
    setSaving(false);
    onSaved();
  }

  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-admin-ink/10 bg-white p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-serif text-base font-medium">Frases que van cambiando</span>
          <span className="text-xs text-admin-ink-soft">
            Se leen detrás de «Tejido a mano,». Una por línea, cortas (2 a 4 palabras).
          </span>
        </div>
        {saved && <span className="shrink-0 text-xs font-medium text-admin-link">✓ Guardado</span>}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        className="rounded-lg border border-admin-ink/14 px-3 py-2.5 text-sm leading-relaxed outline-none"
      />
      <button type="button" onClick={save} disabled={saving} className="w-fit rounded-full bg-admin-ink px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60">
        {saving ? "Guardando…" : "Guardar frases"}
      </button>
    </div>
  );
}
