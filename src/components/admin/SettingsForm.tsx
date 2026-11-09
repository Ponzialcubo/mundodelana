"use client";

import { SETTINGS_TABS, type SettingsTab } from "@/lib/settings-tabs";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Settings = {
  phone: string;
  publicEmail: string;
  hoursWeekday: string;
  hoursSaturday: string;
  hoursSunday: string;
  instagramUrl: string;
  tiktokUrl: string;
  defaultMetaTitle: string;
  defaultMetaDescription: string;
};

type Faq = { id: string; question: string; answer: string };
type Testimonial = { id: string; text: string; author: string; origin: string | null; visible: boolean };


const INPUT = "w-full rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-2.5 text-[16px] outline-none focus:border-admin-ink/40 md:text-sm";
const CARD = "flex flex-col gap-4 rounded-2xl border border-admin-ink/10 bg-white p-5 md:p-6";

export function SettingsForm({
  initialSettings,
  initialFaqs,
  initialTestimonials,
  initialTab,
}: {
  initialSettings: Settings;
  initialFaqs: Faq[];
  initialTestimonials: Testimonial[];
  initialTab: SettingsTab;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<SettingsTab>(initialTab);
  const [settings, setSettings] = useState(initialSettings);
  const [faqs, setFaqs] = useState(initialFaqs);
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
    setSaved(false);
  }

  async function saveSettings() {
    setSaving(true);
    await fetch("/api/admin/ajustes", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  function switchTab(key: SettingsTab) {
    setTab(key);
    window.history.replaceState(null, "", `?seccion=${key}`);
  }

  // ---- FAQs: text saves when leaving the field, order with arrows
  const patchFaq = (id: string, patch: Partial<Faq> & { order?: number }) =>
    fetch(`/api/admin/faqs/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });

  async function addFaq() {
    const res = await fetch("/api/admin/faqs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: "Nueva pregunta", answer: "" }) });
    const data = await res.json();
    setFaqs((f) => [...f, { id: data.id, question: "Nueva pregunta", answer: "" }]);
  }

  async function moveFaq(index: number, target: number) {
    if (target < 0 || target >= faqs.length) return;
    const next = [...faqs];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    setFaqs(next);
    await Promise.all(next.map((f, i) => patchFaq(f.id, { order: i + 1 })));
  }

  async function removeFaq(id: string) {
    if (!window.confirm("¿Borrar esta pregunta?")) return;
    setFaqs((f) => f.filter((x) => x.id !== id));
    await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
  }

  // ---- Testimonials
  const patchTestimonial = (id: string, patch: Partial<Testimonial>) =>
    fetch(`/api/admin/testimonios/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });

  async function addTestimonial() {
    const res = await fetch("/api/admin/testimonios", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: "", author: "" }) });
    const data = await res.json();
    setTestimonials((t) => [...t, { id: data.id, text: "", author: "", origin: null, visible: true }]);
  }

  async function removeTestimonial(id: string) {
    if (!window.confirm("¿Borrar esta opinión?")) return;
    setTestimonials((t) => t.filter((x) => x.id !== id));
    await fetch(`/api/admin/testimonios/${id}`, { method: "DELETE" });
  }

  const current = SETTINGS_TABS.find((t) => t.key === tab)!;
  const saveBar = (
    <div className="flex items-center gap-3">
      <button onClick={saveSettings} disabled={saving} className="rounded-full bg-pink px-6 py-2.5 text-sm font-medium disabled:opacity-60">
        {saving ? "Guardando…" : "Guardar cambios"}
      </button>
      {saved && <span className="text-sm font-medium text-admin-link">✓ Guardado</span>}
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 p-5 md:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-2xl font-normal">Configuración</h1>
        <p className="text-sm text-admin-ink-soft">Datos generales de la web.</p>
      </div>

      <nav className="-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] md:mx-0 md:px-0">
        {SETTINGS_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => switchTab(t.key)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${tab === t.key ? "bg-admin-ink text-white" : "border border-admin-ink/14 bg-white"}`}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <p className="-mt-1 text-xs text-admin-ink-soft">📍 {current.hint}</p>

      {tab === "contacto" && (
        <div className={CARD}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium">Teléfono y WhatsApp</span>
              <input value={settings.phone} onChange={(e) => set("phone", e.target.value)} className={INPUT} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium">Email público</span>
              <input value={settings.publicEmail} onChange={(e) => set("publicEmail", e.target.value)} className={INPUT} />
            </label>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium">Horario</span>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {(
                [
                  ["hoursWeekday", "Lunes a viernes"],
                  ["hoursSaturday", "Sábado"],
                  ["hoursSunday", "Domingo"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex flex-col gap-1">
                  <span className="text-xs text-admin-ink-soft">{label}</span>
                  <input value={settings[key]} onChange={(e) => set(key, e.target.value)} className={INPUT} />
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium">Instagram</span>
              <input value={settings.instagramUrl} onChange={(e) => set("instagramUrl", e.target.value)} placeholder="instagram.com/tu_usuario" className={INPUT} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium">TikTok</span>
              <input value={settings.tiktokUrl} onChange={(e) => set("tiktokUrl", e.target.value)} placeholder="tiktok.com/@tu_usuario" className={INPUT} />
            </label>
          </div>
          {saveBar}
        </div>
      )}

      {tab === "preguntas" && (
        <div className={CARD}>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-admin-ink-soft">{faqs.length} preguntas · se guardan solas al salir de cada campo.</span>
            <button onClick={addFaq} className="shrink-0 rounded-full bg-admin-ink px-4 py-2 text-sm font-medium text-white">
              + Nueva pregunta
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {faqs.map((f, i) => (
              <div key={f.id} className="flex gap-3 rounded-xl border border-admin-ink/10 p-3.5">
                <div className="flex flex-col gap-1">
                  <button type="button" onClick={() => moveFaq(i, i - 1)} disabled={i === 0} className="flex h-7 w-7 items-center justify-center rounded-md border border-admin-ink/14 text-xs disabled:opacity-30" aria-label="Subir">
                    ▲
                  </button>
                  <button type="button" onClick={() => moveFaq(i, i + 1)} disabled={i === faqs.length - 1} className="flex h-7 w-7 items-center justify-center rounded-md border border-admin-ink/14 text-xs disabled:opacity-30" aria-label="Bajar">
                    ▼
                  </button>
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <input
                    value={f.question}
                    onChange={(e) => setFaqs((all) => all.map((x) => (x.id === f.id ? { ...x, question: e.target.value } : x)))}
                    onBlur={(e) => patchFaq(f.id, { question: e.target.value })}
                    className={`${INPUT} font-medium`}
                  />
                  <textarea
                    value={f.answer}
                    onChange={(e) => setFaqs((all) => all.map((x) => (x.id === f.id ? { ...x, answer: e.target.value } : x)))}
                    onBlur={(e) => patchFaq(f.id, { answer: e.target.value })}
                    rows={2}
                    placeholder="Respuesta"
                    className={INPUT}
                  />
                </div>
                <button type="button" onClick={() => removeFaq(f.id)} className="self-start text-xs font-medium text-admin-danger">
                  Borrar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "opiniones" && (
        <div className={CARD}>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-admin-ink-soft">
              {testimonials.length === 0 ? "Todavía no hay opiniones. Añade las que te hayan mandado por WhatsApp o Instagram." : "Se guardan solas al salir de cada campo."}
            </span>
            <button onClick={addTestimonial} className="shrink-0 rounded-full bg-admin-ink px-4 py-2 text-sm font-medium text-white">
              + Nueva opinión
            </button>
          </div>
          {testimonials.map((t) => (
            <div key={t.id} className="flex flex-col gap-2 rounded-xl border border-admin-ink/10 p-3.5">
              <textarea
                value={t.text}
                onChange={(e) => setTestimonials((all) => all.map((x) => (x.id === t.id ? { ...x, text: e.target.value } : x)))}
                onBlur={(e) => patchTestimonial(t.id, { text: e.target.value })}
                rows={2}
                placeholder="Lo que dijo la clienta"
                className={INPUT}
              />
              <div className="flex flex-wrap items-center gap-3">
                <input
                  value={t.author}
                  onChange={(e) => setTestimonials((all) => all.map((x) => (x.id === t.id ? { ...x, author: e.target.value } : x)))}
                  onBlur={(e) => patchTestimonial(t.id, { author: e.target.value })}
                  placeholder="Nombre (ej.: Laura, Madrid)"
                  className={`${INPUT} sm:w-64`}
                />
                <label className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={t.visible}
                    onChange={(e) => {
                      setTestimonials((all) => all.map((x) => (x.id === t.id ? { ...x, visible: e.target.checked } : x)));
                      patchTestimonial(t.id, { visible: e.target.checked });
                    }}
                    className="h-4 w-4 accent-pink"
                  />
                  Mostrar en la web
                </label>
                <button type="button" onClick={() => removeTestimonial(t.id)} className="ml-auto text-xs font-medium text-admin-danger">
                  Borrar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "google" && (
        <div className={CARD}>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium">Título en Google</span>
            <input value={settings.defaultMetaTitle} onChange={(e) => set("defaultMetaTitle", e.target.value)} className={INPUT} />
            <span className="text-xs text-admin-faint">{settings.defaultMetaTitle.length} de 60 caracteres</span>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium">Descripción en Google</span>
            <textarea value={settings.defaultMetaDescription} onChange={(e) => set("defaultMetaDescription", e.target.value)} rows={3} className={INPUT} />
            <span className="text-xs text-admin-faint">{settings.defaultMetaDescription.length} de 155 caracteres</span>
          </label>
          <div className="flex flex-col gap-0.5 rounded-xl bg-admin-bg p-4">
            <span className="text-xs text-admin-ink-soft">Vista previa</span>
            <span className="text-[17px] text-[#1a0dab]">{settings.defaultMetaTitle}</span>
            <span className="text-xs text-[#006621]">mundolana.es</span>
            <span className="text-[13px] text-admin-ink-soft">{settings.defaultMetaDescription}</span>
          </div>
          {saveBar}
        </div>
      )}
    </div>
  );
}
