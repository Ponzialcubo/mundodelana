"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Status = "NUEVA" | "EN_REVISION" | "HECHA" | "DESCARTADA";
type Idea = { id: string; title: string; description: string; area: string; status: Status; reply: string | null; createdAt: string };

const AREAS = [
  { value: "web", label: "La web" },
  { value: "tienda", label: "Productos y tienda" },
  { value: "panel", label: "Este panel" },
  { value: "otra", label: "Otra cosa" },
];

const STATUS: Record<Status, { label: string; style: React.CSSProperties }> = {
  NUEVA: { label: "Nueva", style: { background: "#F1E4E5", color: "#7A4E52" } },
  EN_REVISION: { label: "En revisión", style: { background: "#F6E7D3", color: "#7A5A2E" } },
  HECHA: { label: "Hecha", style: { background: "#E3EADB", color: "#4F6645" } },
  DESCARTADA: { label: "Descartada", style: { background: "#EDEBE8", color: "#8B837F" } },
};

const FILTERS = [
  { key: "open", label: "Abiertas", match: (s: Status) => s === "NUEVA" || s === "EN_REVISION" },
  { key: "done", label: "Hechas", match: (s: Status) => s === "HECHA" },
  { key: "all", label: "Todas", match: () => true },
] as const;

const INPUT = "w-full rounded-lg border border-admin-ink/14 bg-admin-bg px-3.5 py-2.5 text-[16px] outline-none focus:border-admin-ink/40 md:text-sm";
const areaLabel = (v: string) => AREAS.find((a) => a.value === v)?.label ?? v;
const when = (iso: string) => new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });

function AreaPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {AREAS.map((a) => (
        <button
          key={a.value}
          type="button"
          onClick={() => onChange(a.value)}
          className={`rounded-full px-3 py-1.5 text-[13px] ${value === a.value ? "bg-admin-ink text-white" : "border border-admin-ink/14 bg-white"}`}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}

export function IdeasBoard({ ideas }: { ideas: Idea[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("open");
  const [draft, setDraft] = useState({ title: "", description: "", area: "web" });
  const [saving, setSaving] = useState(false);
  const shown = ideas.filter((i) => FILTERS.find((f) => f.key === filter)!.match(i.status));

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/ideas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
    setSaving(false);
    if (res.ok) {
      setDraft({ title: "", description: "", area: draft.area });
      setFilter("open");
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={create} className="flex flex-col gap-3.5 rounded-2xl border border-admin-ink/10 bg-white p-5 md:p-6">
        <span className="font-serif text-lg">Nueva idea</span>
        <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="En pocas palabras: ¿qué te gustaría?" className={INPUT} />
        <textarea
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          placeholder="Explícalo con detalle si quieres: dónde, cómo lo imaginas, un ejemplo que hayas visto…"
          rows={3}
          className={INPUT}
        />
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium">¿Sobre qué es?</span>
          <AreaPicker value={draft.area} onChange={(area) => setDraft({ ...draft, area })} />
        </div>
        <button type="submit" disabled={saving || !draft.title.trim()} className="w-fit rounded-full bg-pink px-6 py-2.5 text-sm font-medium disabled:opacity-50">
          {saving ? "Guardando…" : "Apuntar idea"}
        </button>
      </form>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${filter === f.key ? "bg-admin-ink text-white" : "border border-admin-ink/14 bg-white"}`}
          >
            {f.label} ({ideas.filter((i) => f.match(i.status)).length})
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-admin-ink/20 bg-white p-8 text-center text-sm text-admin-ink-soft">
          {filter === "open" ? "No hay ideas abiertas. ¡Apunta la primera arriba!" : "Nada por aquí todavía."}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {shown.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}
    </div>
  );
}

function IdeaCard({ idea }: { idea: Idea }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ title: idea.title, description: idea.description, area: idea.area });

  async function patch(body: object) {
    await fetch(`/api/admin/ideas/${idea.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    router.refresh();
  }

  async function remove() {
    if (!window.confirm("¿Borrar esta idea?")) return;
    await fetch(`/api/admin/ideas/${idea.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-admin-ink/10 bg-white p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full px-2.5 py-1 text-[11px] font-medium" style={STATUS[idea.status].style}>
          {STATUS[idea.status].label}
        </span>
        <span className="rounded-full bg-admin-bg px-2.5 py-1 text-[11px] font-medium text-admin-ink-soft">{areaLabel(idea.area)}</span>
        <span className="ml-auto text-xs text-admin-faint">{when(idea.createdAt)}</span>
      </div>

      {editing ? (
        <div className="flex flex-col gap-3">
          <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className={INPUT} />
          <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={3} className={INPUT} />
          <AreaPicker value={draft.area} onChange={(area) => setDraft({ ...draft, area })} />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={async () => {
                await patch(draft);
                setEditing(false);
              }}
              disabled={!draft.title.trim()}
              className="rounded-full bg-admin-ink px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Guardar
            </button>
            <button type="button" onClick={() => setEditing(false)} className="rounded-full px-4 py-2 text-sm text-admin-ink-soft">
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          <h3 className="text-[15.5px] font-medium">{idea.title}</h3>
          {idea.description && <p className="whitespace-pre-line text-sm leading-relaxed text-admin-ink-soft">{idea.description}</p>}
        </>
      )}

      {idea.reply && (
        <div className="flex flex-col gap-1 rounded-xl bg-[#FBF3E4] p-4">
          <span className="text-[11px] font-medium uppercase tracking-[.14em] text-admin-ink-soft">Respuesta</span>
          <p className="whitespace-pre-line text-sm leading-relaxed">{idea.reply}</p>
        </div>
      )}

      {!editing && (
        <div className="flex flex-wrap items-center gap-3 border-t border-admin-ink/8 pt-3 text-sm">
          <button type="button" onClick={() => setEditing(true)} className="font-medium text-admin-link">
            Editar
          </button>
          {idea.status !== "HECHA" && (
            <button type="button" onClick={() => patch({ status: "HECHA" })} className="font-medium text-admin-ink-soft">
              Marcar como hecha
            </button>
          )}
          {idea.status === "HECHA" && (
            <button type="button" onClick={() => patch({ status: "NUEVA" })} className="font-medium text-admin-ink-soft">
              Volver a abrir
            </button>
          )}
          <button type="button" onClick={remove} className="ml-auto font-medium text-admin-danger">
            Borrar
          </button>
        </div>
      )}
    </article>
  );
}
