"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageSlotEditor, type SlotValue } from "@/components/admin/ImageSlotEditor";
import type { SiteImageSlot, SiteImages } from "@/lib/site-images";

/** Each change is saved right away: there's no "Save" button to forget. */
export function SiteImagesManager({ slots, initial }: { slots: SiteImageSlot[]; initial: SiteImages }) {
  const router = useRouter();
  const [values, setValues] = useState<SiteImages>(initial);
  const [saved, setSaved] = useState<string | null>(null);

  async function save(key: SiteImageSlot["key"], value: SlotValue) {
    setValues((v) => ({ ...v, [key]: value ?? undefined }));
    await fetch("/api/admin/imagenes-web", {
      method: value ? "PUT" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value ? { key, ...value } : { key }),
    });
    setSaved(key);
    setTimeout(() => setSaved(null), 2000);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {slots.map((slot) => (
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
    </div>
  );
}
