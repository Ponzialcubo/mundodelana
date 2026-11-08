"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImageSlotEditor, type SlotValue } from "@/components/admin/ImageSlotEditor";
import { formatLabel } from "@/lib/image-formats";
import { isLive, todayMadrid, type SiteImageSlot, type SitePage } from "@/lib/site-pages";
import type { TextDef } from "@/lib/site-texts";

type ImageMeta = { url: string; focalX: number; focalY: number; zoom: number; hidden: boolean; startsOn: string | null; endsOn: string | null };

const INPUT = "w-full rounded-lg border border-admin-ink/14 bg-admin-bg px-3.5 py-2.5 text-[16px] outline-none focus:border-admin-ink/40 md:text-sm";

/** Saved tick shown for two seconds next to whatever was just saved. */
function useFlash() {
  const [key, setKey] = useState<string | null>(null);
  return [key, (k: string) => {
    setKey(k);
    setTimeout(() => setKey((current) => (current === k ? null : current)), 2200);
  }] as const;
}

const Saved = () => <span className="text-xs font-medium text-admin-link">✓ Guardado</span>;

/**
 * One public page as the owner edits it: its sections numbered in on-screen
 * order, each with its texts and photos. Everything saves on its own button or
 * right away (photos), so nothing gets lost.
 */
export function SitePageEditor({
  page,
  slots,
  images: initialImages,
  textDefs,
  texts,
  phrases,
}: {
  page: SitePage;
  slots: SiteImageSlot[];
  images: Record<string, ImageMeta | undefined>;
  textDefs: TextDef[];
  texts: Record<string, string>;
  phrases: string[];
}) {
  const router = useRouter();
  const [images, setImages] = useState(initialImages);
  const [saved, flash] = useFlash();

  async function saveImage(key: string, value: SlotValue) {
    setImages((all) => ({ ...all, [key]: value ? { hidden: false, startsOn: null, endsOn: null, ...all[key], ...value, zoom: value.zoom ?? 1 } : undefined }));
    await fetch("/api/admin/imagenes-web", {
      method: value ? "PUT" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value ? { key, ...value } : { key }),
    });
    flash(key);
    router.refresh();
  }

  async function saveVisibility(key: string, meta: Pick<ImageMeta, "hidden" | "startsOn" | "endsOn">) {
    setImages((all) => ({ ...all, [key]: all[key] && { ...all[key]!, ...meta } }));
    const res = await fetch("/api/admin/imagenes-web", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, ...meta }) });
    if (res.ok) flash(`${key}:visibility`);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      {page.sections.map((section, i) => (
        <section key={section.id} id={section.id} className="scroll-mt-6 rounded-2xl border border-admin-ink/10 bg-white">
          <header className="flex items-start gap-3.5 border-b border-admin-ink/8 p-5 md:px-6">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink/50 font-serif text-[15px]">{i + 1}</span>
            <div className="flex flex-col gap-0.5">
              <h2 className="font-serif text-lg font-normal leading-tight">{section.title}</h2>
              <span className="text-xs text-admin-ink-soft">📍 {section.where}</span>
            </div>
          </header>

          <div className="flex flex-col gap-6 p-5 md:p-6">
            {section.elsewhere && (
              <div className="flex flex-col gap-2 rounded-xl bg-admin-bg p-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-admin-ink-soft">{section.elsewhere.text}</span>
                <Link href={section.elsewhere.href} className="w-fit shrink-0 rounded-full bg-white px-4 py-2 text-sm font-medium shadow-sm">
                  {section.elsewhere.label} →
                </Link>
              </div>
            )}

            {section.phrases && <PhrasesEditor initial={phrases} saved={saved === "phrases"} onSaved={() => flash("phrases")} />}

            {section.texts && section.texts.length > 0 && (
              <TextsForm
                defs={textDefs.filter((d) => section.texts!.includes(d.key))}
                values={texts}
                saved={saved === `texts:${section.id}`}
                onSaved={() => {
                  flash(`texts:${section.id}`);
                  router.refresh();
                }}
              />
            )}

            {section.slots?.map((key) => {
              const slot = slots.find((s) => s.key === key);
              if (!slot) return null;
              return (
                <SlotCard
                  key={key}
                  slot={slot}
                  desktop={images[key]}
                  mobile={images[`${key}-m`]}
                  savedKey={saved}
                  onImage={saveImage}
                  onVisibility={saveVisibility}
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function TextsForm({ defs, values, saved, onSaved }: { defs: TextDef[]; values: Record<string, string>; saved: boolean; onSaved: () => void }) {
  const [draft, setDraft] = useState(() => Object.fromEntries(defs.map((d) => [d.key, values[d.key] === d.default ? "" : values[d.key]])));
  const [saving, setSaving] = useState(false);
  const dirty = defs.some((d) => (draft[d.key] ?? "") !== (values[d.key] === d.default ? "" : values[d.key]));

  async function save() {
    setSaving(true);
    await fetch("/api/admin/textos", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ values: draft }) });
    setSaving(false);
    onSaved();
  }

  return (
    <div className="flex flex-col gap-3.5">
      <span className="text-[11px] font-medium uppercase tracking-[.14em] text-admin-faint">Textos</span>
      {defs.map((d) => (
        <label key={d.key} className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium">{d.label}</span>
          {d.multiline ? (
            <textarea value={draft[d.key]} onChange={(e) => setDraft({ ...draft, [d.key]: e.target.value })} placeholder={d.default} rows={3} className={INPUT} />
          ) : (
            <input value={draft[d.key]} onChange={(e) => setDraft({ ...draft, [d.key]: e.target.value })} placeholder={d.default} className={INPUT} />
          )}
        </label>
      ))}
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={save} disabled={saving || !dirty} className="rounded-full bg-admin-ink px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40">
          {saving ? "Guardando…" : "Guardar textos"}
        </button>
        {saved && <Saved />}
        <span className="text-xs text-admin-faint">El texto en gris es el que se ve ahora. Déjalo vacío para mantenerlo.</span>
      </div>
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
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-medium uppercase tracking-[.14em] text-admin-faint">Título</span>
      <span className="text-[13px] font-medium">
        «Tejido a mano, <em className="text-pink-deep">…</em>» — frases que van cambiando
      </span>
      <span className="text-xs text-admin-ink-soft">Una por línea, cortas (2 a 4 palabras).</span>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className={INPUT} />
      <div className="flex items-center gap-3">
        <button type="button" onClick={save} disabled={saving} className="rounded-full bg-admin-ink px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60">
          {saving ? "Guardando…" : "Guardar frases"}
        </button>
        {saved && <Saved />}
      </div>
    </div>
  );
}

/** Status of a prepared banner, in words. */
function visibilityLabel(meta: ImageMeta) {
  if (meta.hidden) return { text: "Oculto", tone: "#EFE7DE" };
  const today = todayMadrid();
  if (meta.startsOn && today < meta.startsOn) return { text: `Programado · desde el ${fmt(meta.startsOn)}`, tone: "#F6E7D3" };
  if (meta.endsOn && today > meta.endsOn) return { text: `Terminado el ${fmt(meta.endsOn)}`, tone: "#EFE7DE" };
  return { text: meta.endsOn ? `Visible hasta el ${fmt(meta.endsOn)}` : "Visible en la web", tone: "#E3EADB" };
}

const fmt = (day: string) => new Date(`${day}T12:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "long" });

function SlotCard({
  slot,
  desktop,
  mobile,
  savedKey,
  onImage,
  onVisibility,
}: {
  slot: SiteImageSlot;
  desktop?: ImageMeta;
  mobile?: ImageMeta;
  savedKey: string | null;
  onImage: (key: string, value: SlotValue) => void;
  onVisibility: (key: string, meta: Pick<ImageMeta, "hidden" | "startsOn" | "endsOn">) => void;
}) {
  const status = desktop && slot.schedulable ? visibilityLabel(desktop) : null;
  const justSaved = savedKey === slot.key || savedKey === `${slot.key}-m`;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-admin-ink/10 p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-[15px] font-medium">{slot.label}</span>
          <span className="max-w-xl text-xs leading-relaxed text-admin-ink-soft">{slot.tips}</span>
        </div>
        <div className="flex items-center gap-2">
          {justSaved && <Saved />}
          {status && (
            <span className="rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ background: status.tone }}>
              {status.text}
            </span>
          )}
        </div>
      </div>

      <div className={`grid grid-cols-1 gap-5 ${slot.mobile ? "md:grid-cols-[minmax(0,1fr)_190px]" : ""}`}>
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium">
            {slot.mobile ? "Ordenador" : "Imagen"} · <span className="font-normal text-admin-ink-soft">{formatLabel(slot.desktop.format)}</span>
          </span>
          <ImageSlotEditor
            value={desktop ?? null}
            onChange={(v) => onImage(slot.key, v)}
            prompt={slot.desktop.prompt}
            title={`${slot.label}${slot.mobile ? " · ordenador" : ""}`}
            aspectClass={slot.desktop.format.aspectClass}
            textZone={slot.desktop.format.textZone}
            frames={slot.desktop.frames}
            previewClass={slot.desktop.format.width > slot.desktop.format.height ? "max-w-md" : "max-w-[240px]"}
          />
        </div>
        {slot.mobile && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium">
              Móvil · <span className="font-normal text-admin-ink-soft">opcional</span>
            </span>
            <ImageSlotEditor
              value={mobile ?? null}
              onChange={(v) => onImage(`${slot.key}-m`, v)}
              prompt={slot.mobile.prompt}
              title={`${slot.label} · móvil`}
              aspectClass={slot.mobile.format.aspectClass}
              textZone={slot.mobile.format.textZone}
              frames={slot.mobile.frames}
              previewClass="max-w-[190px]"
              emptyText="Sin imagen: en móvil se recorta la de ordenador."
            />
          </div>
        )}
      </div>

      {slot.schedulable && desktop && (
        <VisibilityControls meta={desktop} saved={savedKey === `${slot.key}:visibility`} onChange={(meta) => onVisibility(slot.key, meta)} />
      )}
    </div>
  );
}

/** Switch a banner on/off, or prepare it to show only between two dates. */
function VisibilityControls({ meta, saved, onChange }: { meta: ImageMeta; saved: boolean; onChange: (meta: Pick<ImageMeta, "hidden" | "startsOn" | "endsOn">) => void }) {
  const [startsOn, setStartsOn] = useState(meta.startsOn ?? "");
  const [endsOn, setEndsOn] = useState(meta.endsOn ?? "");
  const live = isLive(meta);

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-admin-bg p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2.5 text-sm font-medium">
          <input type="checkbox" checked={!meta.hidden} onChange={(e) => onChange({ hidden: !e.target.checked, startsOn: startsOn || null, endsOn: endsOn || null })} className="h-4 w-4 accent-pink" />
          Mostrar en la web
        </label>
        <span className="text-xs text-admin-ink-soft">{live ? "Se está viendo ahora." : "Ahora no se ve."}</span>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs text-admin-ink-soft">Programar (opcional): se mostrará solo entre estas fechas, de forma automática.</span>
        <div className="flex flex-wrap items-end gap-2.5">
          <label className="flex flex-col gap-1 text-xs font-medium">
            Desde
            <input type="date" value={startsOn} onChange={(e) => setStartsOn(e.target.value)} className="rounded-lg border border-admin-ink/14 bg-white px-3 py-2 text-[16px] md:text-sm" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium">
            Hasta
            <input type="date" value={endsOn} onChange={(e) => setEndsOn(e.target.value)} className="rounded-lg border border-admin-ink/14 bg-white px-3 py-2 text-[16px] md:text-sm" />
          </label>
          <button
            type="button"
            onClick={() => onChange({ hidden: meta.hidden, startsOn: startsOn || null, endsOn: endsOn || null })}
            className="rounded-full bg-white px-4 py-2 text-sm font-medium shadow-sm"
          >
            Guardar fechas
          </button>
          {(startsOn || endsOn) && (
            <button
              type="button"
              onClick={() => {
                setStartsOn("");
                setEndsOn("");
                onChange({ hidden: meta.hidden, startsOn: null, endsOn: null });
              }}
              className="px-2 py-2 text-xs font-medium text-admin-ink-soft underline"
            >
              Quitar fechas
            </button>
          )}
          {saved && <Saved />}
        </div>
      </div>
    </div>
  );
}
