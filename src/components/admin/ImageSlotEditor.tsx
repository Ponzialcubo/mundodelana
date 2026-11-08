"use client";

import { useRef, useState } from "react";
import { FocalPointEditor } from "@/components/admin/FocalPointEditor";
import { ImproveImageDialog } from "@/components/admin/ImproveImageDialog";

export type SlotValue = { url: string; focalX: number; focalY: number } | null;

/**
 * One image spot (site image, campaign banner): preview with the real crop,
 * create it with AI from a ready-made prompt, upload directly, adjust the
 * framing or remove it. Every change is reported through onChange.
 */
export function ImageSlotEditor({
  value,
  onChange,
  prompt,
  title,
  aspectClass,
  emptyText = "Sin imagen: se usa el diseño por defecto.",
}: {
  value: SlotValue;
  onChange: (value: SlotValue) => void;
  prompt: string;
  title: string;
  aspectClass: string;
  emptyText?: string;
}) {
  const [dialog, setDialog] = useState(false);
  const [framing, setFraming] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setUploading(true);
    setError("");
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/admin/imagenes/subir", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      onChange({ url: json.url, focalX: 0.5, focalY: 0.5 });
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "No se ha podido subir la imagen");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className={`relative w-full max-w-sm overflow-hidden rounded-xl bg-admin-bg ${aspectClass}`}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin preview with the shop's exact crop
          <img src={value.url} alt="" className="h-full w-full object-cover" style={{ objectPosition: `${value.focalX * 100}% ${value.focalY * 100}%` }} />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-admin-ink-soft">{emptyText}</span>
        )}
      </div>

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
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setDialog(true)} className="rounded-full bg-pink px-4 py-2 text-sm font-medium">
          ✨ {value ? "Mejorar con IA" : "Crear con IA"}
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="rounded-full border border-admin-ink/16 bg-white px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          {uploading ? "Subiendo…" : "Subir imagen"}
        </button>
        {value && (
          <>
            <button type="button" onClick={() => setFraming(true)} className="rounded-full border border-admin-ink/16 bg-white px-4 py-2 text-sm font-medium">
              Encuadre
            </button>
            <button type="button" onClick={() => onChange(null)} className="px-2 py-2 text-sm font-medium text-admin-danger">
              Quitar
            </button>
          </>
        )}
      </div>
      {error && <span className="text-xs text-admin-danger">{error}</span>}

      {dialog && (
        <ImproveImageDialog
          title={title}
          prompt={prompt}
          originalUrl={value?.url}
          onUploaded={(url) => onChange({ url, focalX: 0.5, focalY: 0.5 })}
          onClose={() => setDialog(false)}
        />
      )}
      {framing && value && (
        <FocalPointEditor
          src={value.url}
          focalX={value.focalX}
          focalY={value.focalY}
          onChange={(focalX, focalY) => onChange({ ...value, focalX, focalY })}
          onClose={() => setFraming(false)}
        />
      )}
    </div>
  );
}
