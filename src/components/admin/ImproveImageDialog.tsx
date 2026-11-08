"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Three-step helper to improve or create an image with an external AI
 * (ChatGPT / Gemini): copy the ready-made prompt, attach the original photo
 * there, then upload the result here (optimized to WebP, not cropped).
 */
export function ImproveImageDialog({
  title,
  prompt,
  originalUrl,
  onUploaded,
  onClose,
}: {
  title: string;
  prompt: string;
  /** Photo to attach in the AI tool; omitted when the image is created from scratch. */
  originalUrl?: string | null;
  onUploaded: (url: string) => void;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      // Older mobile browsers: fall back to selecting the text so it can be copied by hand.
      const area = document.getElementById("improve-prompt") as HTMLTextAreaElement | null;
      area?.select();
      document.execCommand("copy");
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  async function upload(file: File) {
    setUploading(true);
    setError("");
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/admin/imagenes/subir", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      onUploaded(json.url);
      onClose();
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "No se ha podido subir la imagen");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-admin-ink/50 md:items-center" role="dialog" aria-label={title}>
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-t-2xl bg-white p-5 md:rounded-2xl md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <span className="font-serif text-lg font-medium">✨ {title}</span>
            <span className="text-xs text-admin-ink-soft">Con ChatGPT o Gemini, en tres pasos.</span>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-admin-bg text-lg" aria-label="Cerrar">
            ×
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">1. Copia el prompt</span>
          <textarea
            id="improve-prompt"
            readOnly
            value={prompt}
            rows={6}
            className="rounded-lg border border-admin-ink/14 bg-admin-bg px-3 py-2.5 text-[13px] leading-relaxed outline-none"
          />
          <button type="button" onClick={copy} className="rounded-full bg-admin-ink px-4 py-2.5 text-sm font-medium text-white">
            {copied ? "✓ Copiado" : "Copiar prompt"}
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">2. Pégalo en ChatGPT o Gemini{originalUrl ? " junto con la foto" : ""}</span>
          <div className="flex flex-wrap gap-2">
            {originalUrl && (
              <a href={originalUrl} download className="rounded-full border border-admin-ink/16 px-4 py-2 text-sm font-medium">
                Descargar foto original
              </a>
            )}
            <a href="https://chatgpt.com/" target="_blank" rel="noreferrer" className="rounded-full border border-admin-ink/16 px-4 py-2 text-sm font-medium">
              Abrir ChatGPT
            </a>
            <a href="https://gemini.google.com/app" target="_blank" rel="noreferrer" className="rounded-full border border-admin-ink/16 px-4 py-2 text-sm font-medium">
              Abrir Gemini
            </a>
          </div>
          <span className="text-xs text-admin-ink-soft">
            Revisa que la pieza no haya cambiado (colores, ojos, detalles). Si algo sale raro, pídele que lo corrija.
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">3. Sube la imagen nueva</span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload(file);
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="rounded-full bg-pink px-4 py-3 text-sm font-medium disabled:opacity-60"
          >
            {uploading ? "Subiendo y optimizando…" : "Elegir imagen y subir"}
          </button>
          {error && <span className="text-xs text-admin-danger">{error}</span>}
        </div>
      </div>
    </div>
  );
}
