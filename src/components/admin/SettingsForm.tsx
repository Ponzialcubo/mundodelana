"use client";

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
  aboutHeadline: string;
  aboutText: string;
  defaultMetaTitle: string;
  defaultMetaDescription: string;
};

type Faq = { id: string; question: string; answer: string };
type Testimonial = { id: string; text: string; author: string; origin: string | null; visible: boolean };

export function SettingsForm({
  initialSettings,
  initialFaqs,
  initialTestimonials,
}: {
  initialSettings: Settings;
  initialFaqs: Faq[];
  initialTestimonials: Testimonial[];
}) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [faqs, setFaqs] = useState(initialFaqs);
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  async function saveSettings() {
    setSaving(true);
    await fetch("/api/admin/ajustes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSavedAt(new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }));
    router.refresh();
  }

  async function addFaq() {
    const res = await fetch("/api/admin/faqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "Nueva pregunta", answer: "" }),
    });
    const data = await res.json();
    setFaqs((f) => [...f, { id: data.id, question: "Nueva pregunta", answer: "" }]);
  }

  async function updateFaq(id: string, patch: Partial<Faq>) {
    setFaqs((f) => f.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    await fetch(`/api/admin/faqs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
  }

  async function removeFaq(id: string) {
    setFaqs((f) => f.filter((x) => x.id !== id));
    await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
  }

  async function updateTestimonial(id: string, patch: Partial<Testimonial>) {
    setTestimonials((t) => t.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    await fetch(`/api/admin/testimonios/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
  }

  async function removeTestimonial(id: string) {
    setTestimonials((t) => t.filter((x) => x.id !== id));
    await fetch(`/api/admin/testimonios/${id}`, { method: "DELETE" });
  }

  const SECTIONS = [
    { id: "set-contacto", label: "Contacto" },
    { id: "set-sobre", label: "Sobre mí" },
    { id: "set-faq", label: "Preguntas frecuentes" },
    { id: "set-testimonios", label: "Testimonios" },
    { id: "set-seo", label: "SEO de la home" },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 md:p-9">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-normal">Configuración</h1>
          {savedAt && <p className="text-sm text-admin-ink-soft">Cambios guardados a las {savedAt}</p>}
        </div>
        <button onClick={saveSettings} disabled={saving} className="rounded-full bg-pink px-4 py-2.5 text-sm font-medium disabled:opacity-60">
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_200px]">
        <div className="flex flex-col gap-6">
          <section id="set-contacto" className="flex flex-col gap-4 rounded-xl border border-admin-ink/10 bg-white p-6">
            <span className="font-serif text-lg font-medium">Contacto</span>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-admin-ink/85">Teléfono / WhatsApp</span>
              <input value={settings.phone} onChange={(e) => set("phone", e.target.value)} className="rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-2.5 text-sm outline-none" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-admin-ink/85">Email público</span>
              <input value={settings.publicEmail} onChange={(e) => set("publicEmail", e.target.value)} className="rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-2.5 text-sm outline-none" />
            </label>
            <div className="grid grid-cols-3 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-admin-ink/85">Lunes a viernes</span>
                <input value={settings.hoursWeekday} onChange={(e) => set("hoursWeekday", e.target.value)} className="rounded-lg border border-admin-ink/14 bg-admin-bg px-3 py-2.5 text-sm outline-none" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-admin-ink/85">Sábado</span>
                <input value={settings.hoursSaturday} onChange={(e) => set("hoursSaturday", e.target.value)} className="rounded-lg border border-admin-ink/14 bg-admin-bg px-3 py-2.5 text-sm outline-none" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-admin-ink/85">Domingo</span>
                <input value={settings.hoursSunday} onChange={(e) => set("hoursSunday", e.target.value)} className="rounded-lg border border-admin-ink/14 bg-admin-bg px-3 py-2.5 text-sm outline-none" />
              </label>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-admin-ink/85">Instagram</span>
              <input value={settings.instagramUrl} onChange={(e) => set("instagramUrl", e.target.value)} className="rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-2.5 text-sm outline-none" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-admin-ink/85">TikTok</span>
              <input value={settings.tiktokUrl} onChange={(e) => set("tiktokUrl", e.target.value)} className="rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-2.5 text-sm outline-none" />
            </label>
          </section>

          <section id="set-sobre" className="flex flex-col gap-4 rounded-xl border border-admin-ink/10 bg-white p-6">
            <span className="font-serif text-lg font-medium">Sobre mí</span>
            <div className="h-28 w-28 rounded-lg" style={{ background: "repeating-linear-gradient(45deg,#EDEBE8 0 9px,#F7F6F4 9px 18px)" }} />
            <button className="w-fit rounded-full border border-admin-ink/16 bg-white px-3 py-1.5 text-xs font-medium">Cambiar foto</button>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-admin-ink/85">Titular</span>
              <input value={settings.aboutHeadline} onChange={(e) => set("aboutHeadline", e.target.value)} className="rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-2.5 text-sm outline-none" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-admin-ink/85">Texto</span>
              <textarea value={settings.aboutText} onChange={(e) => set("aboutText", e.target.value)} rows={7} className="rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-2.5 text-sm outline-none" />
            </label>
          </section>

          <section id="set-faq" className="flex flex-col gap-4 rounded-xl border border-admin-ink/10 bg-white p-6">
            <div className="flex items-center justify-between">
              <span className="font-serif text-lg font-medium">Preguntas frecuentes</span>
              <button onClick={addFaq} className="rounded-full border border-admin-ink/16 bg-white px-3 py-1.5 text-xs font-medium">+ Nueva pregunta</button>
            </div>
            <div className="flex flex-col divide-y divide-admin-ink/8">
              {faqs.map((f) => (
                <div key={f.id} className="flex flex-col gap-2 py-3">
                  <div className="flex items-center gap-2">
                    <span className="cursor-grab text-admin-faint">⠿</span>
                    <input
                      value={f.question}
                      onChange={(e) => updateFaq(f.id, { question: e.target.value })}
                      className="flex-1 rounded-lg border border-admin-ink/14 bg-admin-bg px-3 py-2 text-sm outline-none"
                    />
                    <button onClick={() => removeFaq(f.id)} className="text-xs text-admin-danger">Eliminar</button>
                  </div>
                  <textarea
                    value={f.answer}
                    onChange={(e) => updateFaq(f.id, { answer: e.target.value })}
                    rows={2}
                    placeholder="Respuesta"
                    className="ml-6 rounded-lg border border-admin-ink/14 bg-admin-bg px-3 py-2 text-xs outline-none"
                  />
                </div>
              ))}
            </div>
            <span className="text-xs text-admin-faint">Arrastra para cambiar el orden en la página de FAQ.</span>
          </section>

          <section id="set-testimonios" className="flex flex-col gap-4 rounded-xl border border-admin-ink/10 bg-white p-6">
            <span className="font-serif text-lg font-medium">Testimonios</span>
            <div className="flex flex-col divide-y divide-admin-ink/8">
              {testimonials.map((t) => (
                <div key={t.id} className="flex flex-col gap-2 py-3">
                  <div className="flex items-start gap-2">
                    <span className="cursor-grab text-admin-faint">⠿</span>
                    <textarea
                      value={t.text}
                      onChange={(e) => updateTestimonial(t.id, { text: e.target.value })}
                      rows={2}
                      className="flex-1 rounded-lg border border-admin-ink/14 bg-admin-bg px-3 py-2 text-xs outline-none"
                    />
                  </div>
                  <div className="ml-6 flex flex-wrap items-center gap-3">
                    <input
                      value={t.author}
                      onChange={(e) => updateTestimonial(t.id, { author: e.target.value })}
                      className="rounded-lg border border-admin-ink/14 bg-admin-bg px-3 py-1.5 text-xs outline-none"
                    />
                    <label className="flex items-center gap-1.5 text-xs">
                      <input type="checkbox" checked={t.visible} onChange={(e) => updateTestimonial(t.id, { visible: e.target.checked })} className="accent-pink" />
                      Visible
                    </label>
                    <button onClick={() => removeTestimonial(t.id)} className="text-xs text-admin-danger">Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
            <span className="text-xs text-admin-faint">En la home se muestran los tres primeros visibles.</span>
          </section>

          <section id="set-seo" className="flex flex-col gap-4 rounded-xl border border-admin-ink/10 bg-white p-6">
            <span className="font-serif text-lg font-medium">SEO de la home</span>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-admin-ink/85">Meta título por defecto</span>
              <input value={settings.defaultMetaTitle} onChange={(e) => set("defaultMetaTitle", e.target.value)} className="rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-2.5 text-sm outline-none" />
              <span className="text-xs text-admin-faint">{settings.defaultMetaTitle.length} de 60 caracteres</span>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-admin-ink/85">Meta descripción por defecto</span>
              <textarea value={settings.defaultMetaDescription} onChange={(e) => set("defaultMetaDescription", e.target.value)} rows={3} className="rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-2.5 text-sm outline-none" />
              <span className="text-xs text-admin-faint">{settings.defaultMetaDescription.length} de 155 caracteres</span>
            </label>
          </section>
        </div>

        <aside className="hidden flex-col gap-1 lg:flex lg:sticky lg:top-6 lg:self-start">
          <span className="mb-1 font-mono text-[10px] tracking-wider text-admin-faint">EN ESTA PÁGINA</span>
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="rounded-lg px-2 py-1.5 text-sm text-admin-ink-soft">
              {s.label}
            </a>
          ))}
        </aside>
      </div>
    </div>
  );
}
