"use client";

import { useRef, useState } from "react";
import { FramingEditor } from "@/components/admin/FramingEditor";
import { frameStyle, type Frame } from "@/lib/framing";
import { ImproveImageDialog } from "@/components/admin/ImproveImageDialog";
import type { TextZone } from "@/lib/image-formats";

/** Dashed box showing where the shop writes its title over the image. */
const ZONE_CLASS: Record<Exclude<TextZone, "none">, string> = {
  left: "inset-y-[12%] left-[5%] w-[42%]",
  bottom: "inset-x-[7%] bottom-[6%] h-[38%]",
};

export type SlotValue = { url: string; focalX: number; focalY: number; zoom?: number } | null;

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
  textZone = "none",
  frames,
  previewClass = "max-w-md",
  emptyText = "Sin imagen: se usa el diseño por defecto.",
}: {
  value: SlotValue;
  onChange: (value: SlotValue) => void;
  prompt: string;
  title: string;
  aspectClass: string;
  textZone?: TextZone;
  /** Boxes this image is cropped into on the shop, for the framing editor. */
  frames: Frame[];
  previewClass?: string;
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
      onChange({ url: json.url, focalX: 0.5, focalY: 0.5, zoom: 1 });
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "No se ha podido subir la imagen");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className={`relative w-full overflow-hidden rounded-xl bg-admin-bg ${previewClass} ${aspectClass}`}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin preview with the shop's exact crop
          <img src={value.url} alt="" className="h-full w-full object-cover" style={frameStyle(value)} />
        ) : (
          <span
            className={`absolute flex items-center justify-center p-4 text-center text-xs text-admin-ink-soft md:text-sm ${
              textZone === "left" ? "inset-y-0 left-[48%] right-0" : textZone === "bottom" ? "inset-x-0 bottom-[46%] top-0" : "inset-0"
            }`}
          >
            {emptyText}
          </span>
        )}
        {textZone !== "none" && (
          <span
            className={`pointer-events-none absolute flex items-center justify-center rounded-lg border-2 border-dashed border-white/90 bg-black/20 px-2 text-center text-[11px] font-medium text-white shadow-sm ${ZONE_CLASS[textZone]}`}
          >
            Aquí va el texto
          </span>
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
          onUploaded={(url) => onChange({ url, focalX: 0.5, focalY: 0.5, zoom: 1 })}
          onClose={() => setDialog(false)}
        />
      )}
      {framing && value && (
        <FramingEditor src={value.url} value={value} frames={frames} onChange={(v) => onChange({ ...value, ...v })} onClose={() => setFraming(false)} />
      )}
    </div>
  );
}
