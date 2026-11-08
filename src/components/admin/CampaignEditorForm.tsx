"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImageSlotEditor, type SlotValue } from "@/components/admin/ImageSlotEditor";
import { FORMATS, formatLabel } from "@/lib/image-formats";
import { FRAMES, frameStyle } from "@/lib/framing";
import { MONTHS, daysUntil, formatMD, isInWindow } from "@/lib/campaign-dates";

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

const TABS = [
  { key: "cuando", label: "1. Cuándo" },
  { key: "banner", label: "2. Banner" },
  { key: "productos", label: "3. Productos" },
] as const;

const INPUT = "rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-2.5 text-[16px] outline-none focus:border-admin-ink/40 md:text-sm";
const CARD = "flex flex-col gap-4 rounded-2xl border border-admin-ink/10 bg-white p-5 md:p-6";
const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** Day + month picker for dates that repeat every year ("MM-DD"). */
function DayMonth({ label, value, onChange, optional }: { label: string; value: string; onChange: (v: string) => void; optional?: boolean }) {
  const [m, d] = value ? value.split("-").map(Number) : [0, 0];
  const update = (month: number, day: number) => {
    if (!month || !day) return onChange("");
    const safeDay = Math.min(day, DAYS_IN_MONTH[month - 1]);
    onChange(`${String(month).padStart(2, "0")}-${String(safeDay).padStart(2, "0")}`);
  };
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium">
        {label} {optional && <span className="font-normal text-admin-ink-soft">(opcional)</span>}
      </span>
      <div className="flex gap-2">
        <select value={d || ""} onChange={(e) => update(m || 1, Number(e.target.value))} className={`${INPUT} w-20`} aria-label={`${label}: día`}>
          {optional && <option value="">—</option>}
          {Array.from({ length: 31 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
        <select value={m || ""} onChange={(e) => update(Number(e.target.value), d || 1)} className={`${INPUT} flex-1`} aria-label={`${label}: mes`}>
          {optional && <option value="">—</option>}
          {MONTHS.map((name, i) => (
            <option key={name} value={i + 1}>
              {name}
            </option>
          ))}
        </select>
      </div>
      {optional && value && (
        <button type="button" onClick={() => onChange("")} className="w-fit text-xs text-admin-ink-soft underline">
          Quitar
        </button>
      )}
    </div>
  );
}

/** How the banner looks on the shop, at a fixed device size, with the real text over it. */
function BannerPreview({ data, device }: { data: CampaignForm; device: "desktop" | "mobile" }) {
  const image = device === "mobile" ? data.bannerMobile ?? data.banner : data.banner;
  const mobile = device === "mobile";
  return (
    <div
      className={`relative flex overflow-hidden rounded-2xl ${mobile ? "aspect-[4/5] w-[210px] items-end" : "aspect-[3/1] w-full items-center"}`}
      style={{ background: `linear-gradient(120deg, #F7F1EA 0%, ${data.accent} 100%)` }}
    >
      {image && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- same object-cover + framing as the shop */}
          <img src={image.url} alt="" className="absolute inset-0 h-full w-full object-cover" style={frameStyle(image)} />
          <span className={`absolute inset-0 ${mobile ? "bg-gradient-to-t from-[#2f2623]/75 via-[#2f2623]/25 to-transparent" : "bg-gradient-to-r from-[#2f2623]/65 via-[#2f2623]/20 to-transparent"}`} />
        </>
      )}
      <span className={`relative flex flex-col ${mobile ? "gap-1 p-3.5" : "max-w-[55%] gap-1.5 p-[4%]"} ${image ? "text-white" : "text-admin-ink"}`}>
        <span className="text-[8px] font-medium uppercase tracking-[.18em] opacity-85">Fecha especial</span>
        <span className={`font-serif leading-[1.08] ${mobile ? "text-[19px]" : "text-[clamp(16px,2.4vw,30px)]"}`}>{data.bannerTitle || "Título del banner"}</span>
        <span className={`font-light opacity-90 ${mobile ? "line-clamp-3 text-[10px]" : "line-clamp-2 text-[clamp(10px,1vw,13px)]"}`}>{data.bannerText}</span>
        <span className={`mt-1 w-fit rounded-full px-2.5 py-1 text-[9px] font-medium ${image ? "bg-white text-admin-ink" : "bg-admin-ink text-white"}`}>Ver regalos</span>
      </span>
    </div>
  );
}

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
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("cuando");
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof CampaignForm>(key: K, value: CampaignForm[K]) {
    setData((d) => ({ ...d, [key]: value }));
    setSaved(false);
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
    const res = await fetch(`/api/admin/fechas/${data.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    setSaving(false);
    if (!res.ok) {
      setError((await res.json()).error ?? "No se ha podido guardar");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  async function remove() {
    if (!window.confirm(`¿Borrar «${data.name}»? Se quita de la web y no se puede deshacer.`)) return;
    await fetch(`/api/admin/fechas/${data.id}`, { method: "DELETE" });
    router.push("/admin/fechas");
    router.refresh();
  }

  const live = data.active && isInWindow(data.startMD, data.endMD);
  const days = daysUntil(data.startMD);
  const summary = !data.active
    ? "Está desactivada: no se mostrará aunque llegue la fecha."
    : live
      ? `Se está viendo ahora en la web, hasta el ${formatMD(data.endMD)}.`
      : `Aparecerá sola el ${formatMD(data.startMD)} (${days === 1 ? "mañana" : `en ${days} días`}) y se quitará el ${formatMD(data.endMD)}.`;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 p-5 pb-28 md:p-8">
      <div className="flex flex-col gap-3">
        <Link href="/admin/fechas" className="text-xs text-admin-ink-soft">‹ Fechas especiales</Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <input
            value={data.name}
            onChange={(e) => set("name", e.target.value)}
            className="min-w-0 flex-1 bg-transparent font-serif text-2xl outline-none"
            aria-label="Nombre de la fecha"
          />
          <label className="flex items-center gap-2.5 rounded-full border border-admin-ink/14 bg-white px-4 py-2 text-sm font-medium">
            <input type="checkbox" checked={data.active} onChange={(e) => set("active", e.target.checked)} className="h-4 w-4 accent-pink" />
            Activada
          </label>
        </div>
        <p className="rounded-xl px-4 py-3 text-sm" style={{ background: live ? "#E3EADB" : data.active ? "#F6E7D3" : "#EDEBE8" }}>
          {summary}
        </p>
      </div>

      <nav className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${tab === t.key ? "bg-admin-ink text-white" : "border border-admin-ink/14 bg-white"}`}
          >
            {t.label}
            {t.key === "productos" && ` (${data.productIds.length})`}
          </button>
        ))}
      </nav>

      {error && <p className="rounded-lg bg-admin-accent-soft px-4 py-3 text-sm text-admin-danger">{error}</p>}

      {tab === "cuando" && (
        <div className={CARD}>
          <div className="flex flex-col gap-0.5">
            <span className="font-serif text-lg">Cuándo se muestra</span>
            <span className="text-xs text-admin-ink-soft">El año no importa: se repite cada año. Revisa las que cambian de día (Día de la Madre, Día del Padre).</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <DayMonth label="Aparece el" value={data.startMD} onChange={(v) => set("startMD", v)} />
            <DayMonth label="Último día para encargar" value={data.deadlineMD} onChange={(v) => set("deadlineMD", v)} optional />
            <DayMonth label="Se quita después del" value={data.endMD} onChange={(v) => set("endMD", v)} />
          </div>
          <div className="flex flex-col gap-1 rounded-xl bg-admin-bg p-4 text-sm">
            <span>
              📅 Del <strong>{formatMD(data.startMD)}</strong> al <strong>{formatMD(data.endMD)}</strong>
            </span>
            <span className="text-admin-ink-soft">
              {data.deadlineMD
                ? `Arriba de la web saldrá: «${data.name}: encarga antes del ${formatMD(data.deadlineMD)}».`
                : "Sin último día, el aviso de arriba solo dirá el nombre de la fecha."}
            </span>
          </div>
        </div>
      )}

      {tab === "banner" && (
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className={CARD}>
            <span className="font-serif text-lg">Texto y color</span>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium">Título</span>
              <input value={data.bannerTitle} onChange={(e) => set("bannerTitle", e.target.value)} className={INPUT} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium">Texto</span>
              <textarea value={data.bannerText} onChange={(e) => set("bannerText", e.target.value)} rows={3} className={INPUT} />
            </label>
            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium">Color (se usa en el aviso de arriba y si no hay imagen)</span>
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

            <div className="flex flex-col gap-1.5 border-t border-admin-ink/8 pt-4">
              <span className="text-[13px] font-medium">
                Imagen · ordenador <span className="font-normal text-admin-ink-soft">{formatLabel(FORMATS.wideDesktop)}</span>
              </span>
              <ImageSlotEditor
                value={data.banner}
                onChange={(v) => set("banner", v)}
                prompt={prompts.desktop}
                title={`Banner de ${data.name} · ordenador`}
                aspectClass={FORMATS.wideDesktop.aspectClass}
                textZone={FORMATS.wideDesktop.textZone}
                frames={FRAMES.campaignDesktop}
                emptyText="Sin imagen: se muestra con el color."
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium">
                Imagen · móvil <span className="font-normal text-admin-ink-soft">{formatLabel(FORMATS.wideMobile)} · opcional</span>
              </span>
              <ImageSlotEditor
                value={data.bannerMobile}
                onChange={(v) => set("bannerMobile", v)}
                prompt={prompts.mobile}
                title={`Banner de ${data.name} · móvil`}
                aspectClass={FORMATS.wideMobile.aspectClass}
                textZone={FORMATS.wideMobile.textZone}
                frames={FRAMES.campaignMobile}
                previewClass="max-w-[200px]"
                emptyText="Sin imagen: en móvil se recorta la de ordenador."
              />
            </div>
          </div>

          <div className={`${CARD} lg:sticky lg:top-6`}>
            <div className="flex flex-col gap-0.5">
              <span className="font-serif text-lg">Así se verá</span>
              <span className="text-xs text-admin-ink-soft">Inicio y página de la fecha. Se actualiza mientras escribes.</span>
            </div>
            <span className="text-[11px] font-medium uppercase tracking-[.14em] text-admin-faint">Ordenador</span>
            <BannerPreview data={data} device="desktop" />
            <span className="text-[11px] font-medium uppercase tracking-[.14em] text-admin-faint">Móvil</span>
            <BannerPreview data={data} device="mobile" />
          </div>
        </div>
      )}

      {tab === "productos" && (
        <div className={CARD}>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="font-serif text-lg">Productos para esta fecha</span>
              <span className="text-xs text-admin-ink-soft">Salen bajo el banner en inicio y en la página de la fecha.</span>
            </div>
            <span className="text-xs text-admin-ink-soft">{data.productIds.length} elegidos</span>
          </div>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar producto…" className={INPUT} />
          <div className="grid max-h-[520px] grid-cols-1 gap-1.5 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
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
      )}

      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={remove} className="text-sm font-medium text-admin-danger">
          Borrar esta fecha
        </button>
      </div>

      <div className="fixed inset-x-0 bottom-[calc(57px+env(safe-area-inset-bottom))] z-20 flex items-center justify-end gap-3 border-t border-admin-ink/10 bg-white/95 px-4 py-3 backdrop-blur md:bottom-0 md:left-[232px]">
        {saved && <span className="text-sm font-medium text-admin-link">✓ Guardado</span>}
        <button type="button" onClick={save} disabled={saving} className="w-full rounded-full bg-pink px-8 py-3 text-sm font-medium disabled:opacity-60 md:w-auto">
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
