"use client";

import { useState } from "react";
import type { ContentField } from "@/lib/content-prompt";

export function AiGenerateButton({
  field,
  context,
  onGenerated,
}: {
  field: ContentField;
  context: Record<string, unknown>;
  onGenerated: (text: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/contenido/generar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, context }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "No se ha podido generar el texto.");
      onGenerated(json.text as string);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se ha podido generar el texto.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <button
        type="button"
        onClick={generate}
        disabled={loading}
        className="rounded-full border border-admin-ink/16 bg-white px-2.5 py-1 text-xs font-medium text-admin-ink-soft disabled:opacity-60"
        title="Genera este campo con IA a partir del resto del formulario. Podrás revisar y editar el resultado."
      >
        {loading ? "Generando…" : "✨ Generar con IA"}
      </button>
      {error && <span className="text-xs text-admin-danger">{error}</span>}
    </span>
  );
}
