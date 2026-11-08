"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type LegalPageData = {
  slug: string;
  title: string;
  content: string;
  updatedAt: string;
};

export function LegalEditorForm({ pages }: { pages: LegalPageData[] }) {
  const router = useRouter();
  const [active, setActive] = useState(pages[0]?.slug ?? "");
  const [drafts, setDrafts] = useState<Record<string, { title: string; content: string }>>(
    Object.fromEntries(pages.map((p) => [p.slug, { title: p.title, content: p.content }]))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const current = drafts[active];

  function setField(field: "title" | "content", value: string) {
    setDrafts((d) => ({ ...d, [active]: { ...d[active], [field]: value } }));
    setSaved(false);
  }

  async function save() {
    setLoading(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/legal/${active}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(current),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      router.refresh();
    } catch {
      setError("No se ha podido guardar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-9">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-normal">Legal</h1>
          <p className="text-sm text-admin-ink-soft">Aviso legal, política de privacidad y política de cookies visibles en /legal.</p>
        </div>
        <button onClick={save} disabled={loading} className="rounded-full bg-pink px-4 py-2.5 text-sm font-medium disabled:opacity-60">
          {loading ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>

      {error && <p className="text-sm text-admin-danger">{error}</p>}
      {saved && <p className="text-sm text-admin-ink-soft">Guardado.</p>}

      <div className="flex gap-2 rounded-full bg-admin-bg p-1 self-start">
        {pages.map((p) => (
          <button
            key={p.slug}
            onClick={() => setActive(p.slug)}
            className="rounded-full px-4 py-2 text-sm font-medium"
            style={active === p.slug ? { background: "#fff" } : {}}
          >
            {p.title}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-admin-ink/10 bg-white p-6">
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-admin-ink/85">Título</span>
          <input
            value={current?.title ?? ""}
            onChange={(e) => setField("title", e.target.value)}
            className="rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-2.5 text-sm outline-none"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-admin-ink/85">Contenido</span>
          <textarea
            value={current?.content ?? ""}
            onChange={(e) => setField("content", e.target.value)}
            rows={22}
            className="rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-3 font-mono text-[13px] leading-relaxed outline-none"
          />
          <span className="text-xs text-admin-faint">
            Deja una línea en blanco entre párrafos. Usa <code>## Título</code> para un apartado y líneas que empiecen por <code>- </code> para una lista.
          </span>
        </label>
      </div>
    </div>
  );
}
