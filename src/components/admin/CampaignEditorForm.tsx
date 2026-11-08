"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageSlotEditor, type SlotValue } from "@/components/admin/ImageSlotEditor";
import { FORMATS, formatLabel } from "@/lib/image-formats";

type CampaignForm = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  startMD: string;
  endMD: string;
  deadlineMD: string;
  bannerTitle: string;
  bannerText: string;
  banner: SlotValue;
  bannerMobile: SlotValue;
  accent: string;
  productIds: string[];
};

const ACCENTS = [
  { value: "#E8B4B8", label: "Rosa" },
  { value: "#D98A8A", label: "Rojo suave" },
  { value: "#C9A7D8", label: "Lila" },
  { value: "#8FA3B0", label: "Azul" },
  { value: "#9CAF88", label: "Verde" },
  { value: "#D9A566", label: "Naranja" },
];

const INPUT = "rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-2.5 text-[16px] outline-none md:text-sm";
const CARD = "flex flex-col gap-4 rounded-xl border border-admin-ink/10 bg-white p-5 md:p-6";

/** "MM-DD" <-> "YYYY-MM-DD" for the native date picker (the year is irrelevant: dates repeat yearly). */
const toDateInput = (md: string) => (md ? `${new Date().getFullYear()}-${md}` : "");
const fromDateInput = (value: string) => value.slice(5);

export function CampaignEditorForm({
  initial,
  products,
  prompts,
}: {
  initial: CampaignForm;
  products: { id: string; name: string; mainImage: string | null }[];
  prompts: { desktop: string; mobile: string };
}) {
  const router = useRouter();
  const [data, setData] = useState(initial);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof CampaignForm>(key: K, value: CampaignForm[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products;
    // Selected first, so they're easy to review.
    return [...list].sort((a, b) => Number(data.productIds.includes(b.id)) - Number(data.productIds.includes(a.id)));
  }, [products, query, data.productIds]);

  async function save() {
    setSaving(true);
    setError("");
    const res = await fetch(`/api/admin/fechas/${data.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    if (!res.ok) {
      setError((await res.json()).error ?? "No se ha podido guardar");
      return;
    }
    router.push("/admin/fechas");
    router.refresh();
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 p-5 pb-28 md:p-9">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-serif text-2xl font-normal">{data.name}</h1>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={data.active} onChange={(e) => set("active", e.target.checked)} className="h-5 w-5 accent-pink" />
          Activa
        </label>
      </div>
      {error && <p className="rounded-lg bg-admin-accent-soft px-4 py-3 text-sm text-admin-danger">{error}</p>}

      <div className={CARD}>
        <span className="font-serif text-base font-medium">Cuándo se muestra</span>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium">Desde</span>
            <input type="date" value={toDateInput(data.startMD)} onChange={(e) => set("startMD", fromDateInput(e.target.value))} className={INPUT} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium">Último día para encargar</span>
            <input type="date" value={toDateInput(data.deadlineMD)} onChange={(e) => set("deadlineMD", fromDateInput(e.target.value))} className={INPUT} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium">Hasta</span>
            <input type="date" value={toDateInput(data.endMD)} onChange={(e) => set("endMD", fromDateInput(e.target.value))} className={INPUT} />
          </label>
        </div>
        <span className="text-xs text-admin-faint">
          El año no importa: se repite cada año. Revisa cada año las fechas que cambian (Día de la Madre).
        </span>
      </div>

      <div className={CARD}>
        <span className="font-serif text-base font-medium">Banner</span>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium">Título</span>
          <input value={data.bannerTitle} onChange={(e) => set("bannerTitle", e.target.value)} className={INPUT} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium">Texto</span>
          <textarea value={data.bannerText} onChange={(e) => set("bannerText", e.target.value)} rows={3} className={INPUT} />
        </label>
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium">Color</span>
          <div className="flex flex-wrap gap-2">
            {ACCENTS.map((a) => (
              <button
                key={a.value}
                type="button"
                onClick={() => set("accent", a.value)}
                className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px]"
                style={{ borderColor: data.accent === a.value ? "#1F1B1A" : "rgba(31,27,26,.14)" }}
              >
                <span className="h-4 w-4 rounded-full" style={{ background: a.value }} />
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={CARD}>
        <div className="flex flex-col gap-1">
          <span className="font-serif text-base font-medium">Imagen del banner</span>
          <span className="text-xs text-admin-ink-soft">
            Se ve en: Inicio (bloque de la fecha), Tienda (arriba) y la página de la fecha. El título y el texto de arriba se
            escriben encima, así que la imagen debe tener esa zona despejada. Crea una escena de ambiente (sin fotos de
            productos recortadas): el prompt ya lo pide así.
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium">Ordenador · {formatLabel(FORMATS.wideDesktop)}</span>
          <ImageSlotEditor
            value={data.banner}
            onChange={(v) => set("banner", v)}
            prompt={prompts.desktop}
            title={`Banner de ${data.name} · ordenador`}
            aspectClass={FORMATS.wideDesktop.aspectClass}
            textZone={FORMATS.wideDesktop.textZone}
            emptyText="Sin imagen: el banner se muestra con el color elegido."
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium">Móvil · {formatLabel(FORMATS.wideMobile)} <span className="font-normal text-admin-ink-soft">(opcional)</span></span>
          <ImageSlotEditor
            value={data.bannerMobile}
            onChange={(v) => set("bannerMobile", v)}
            prompt={prompts.mobile}
            title={`Banner de ${data.name} · móvil`}
            aspectClass={FORMATS.wideMobile.aspectClass}
            textZone={FORMATS.wideMobile.textZone}
            previewClass="max-w-[220px]"
            emptyText="Sin imagen: en móvil se recorta la de ordenador."
          />
        </div>
      </div>

      <div className={CARD}>
        <div className="flex items-center justify-between">
          <span className="font-serif text-base font-medium">Productos para esta fecha</span>
          <span className="text-xs text-admin-ink-soft">{data.productIds.length} elegidos</span>
        </div>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar producto…" className={INPUT} />
        <div className="grid max-h-[420px] grid-cols-1 gap-1.5 overflow-y-auto sm:grid-cols-2">
          {filtered.map((p) => {
            const on = data.productIds.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => set("productIds", on ? data.productIds.filter((x) => x !== p.id) : [...data.productIds, p.id])}
                className="flex items-center gap-3 rounded-lg border px-2 py-2 text-left text-[13px]"
                style={on ? { borderColor: "#1F1B1A", background: "#F1E4E5" } : { borderColor: "rgba(31,27,26,.1)" }}
              >
                {p.mainImage ? (
                  // eslint-disable-next-line @next/next/no-img-element -- tiny admin thumbnail
                  <img src={p.mainImage} alt="" className="h-10 w-8 shrink-0 rounded object-cover" />
                ) : (
                  <span className="h-10 w-8 shrink-0 rounded bg-admin-bg" />
                )}
                <span className="flex-1">{p.name}</span>
                {on && <span className="text-admin-link">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-[calc(57px+env(safe-area-inset-bottom))] z-20 flex justify-end gap-2.5 border-t border-admin-ink/10 bg-white/95 px-4 py-3 backdrop-blur md:static md:border-0 md:bg-transparent md:p-0">
        <button type="button" onClick={save} disabled={saving} className="w-full rounded-full bg-pink px-6 py-3 text-sm font-medium disabled:opacity-60 md:w-auto">
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </div>
  );
}
