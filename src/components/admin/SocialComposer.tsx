"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CONTENT_IDEAS } from "@/lib/social-ideas";
import { PIECE_STATUS_LABEL } from "@/lib/admin-status";
import type { PieceStatus } from "@/generated/prisma";

type Product = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  materials: string | null;
  categories: string[];
  price: string;
  priceType: string;
  pieceStatus: string;
};

type SavedPost = {
  id: string;
  productName: string;
  scheduledFor: string | null;
  instagramText: string | null;
  tiktokText: string | null;
  mediaUrl: string | null;
};

const inputClass =
  "rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-2.5 text-sm outline-none";

export function SocialComposer({ products, posts }: { products: Product[]; posts: SavedPost[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [angle, setAngle] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [uploading, setUploading] = useState(false);

  const [instagramText, setInstagramText] = useState("");
  const [tiktokText, setTiktokText] = useState("");
  const [generating, setGenerating] = useState(false);

  const [scheduledFor, setScheduledFor] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const selected = useMemo(
    () => products.find((p) => p.id === selectedId) ?? null,
    [products, selectedId]
  );

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return products.slice(0, 6);
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.categories.some((c) => c.toLowerCase().includes(term))
      )
      .slice(0, 8);
  }, [products, query]);

  function resetDraft() {
    setInstagramText("");
    setTiktokText("");
    setMediaUrl(null);
    setMediaType(null);
    setScheduledFor("");
    setAngle(null);
    setNotes("");
    setError(null);
    setNotice(null);
  }

  async function uploadMedia(file: File) {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/redes/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se ha podido subir el archivo.");
      setMediaUrl(data.url);
      setMediaType(data.mediaType);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se ha podido subir el archivo.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function generate() {
    if (!selected) return;
    setGenerating(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/redes/generar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selected.id, angle, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se ha podido generar el texto.");
      setInstagramText(data.instagram);
      setTiktokText(data.tiktok);
      setNotice("Textos generados. Revísalos y edítalos antes de publicar.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se ha podido generar el texto.");
    } finally {
      setGenerating(false);
    }
  }

  async function savePost() {
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/redes/publicaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selected.id,
          mediaUrl,
          mediaType,
          instagramText,
          tiktokText,
          scheduledFor: scheduledFor || null,
          notes: notes || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "No se ha podido guardar.");
      }
      setNotice("Publicación guardada en la lista de abajo.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se ha podido guardar.");
    } finally {
      setSaving(false);
    }
  }

  async function removePost(id: string) {
    await fetch(`/api/admin/redes/publicaciones/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-9">
      <div>
        <h1 className="font-serif text-2xl font-normal">Preparar publicación</h1>
        <p className="text-sm text-admin-ink-soft">
          Genera el texto para Instagram y TikTok a partir de una pieza del catálogo. Nada se publica
          automáticamente: copia o descarga el texto y súbelo tú.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-admin-danger/30 bg-admin-danger/5 px-4 py-3 text-sm text-admin-danger">
          {error}
        </div>
      )}
      {notice && (
        <div className="rounded-lg border border-admin-ink/12 bg-admin-surface-soft px-4 py-3 text-sm text-admin-ink-soft">
          {notice}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-6">
          {/* ---------- 1. Producto ---------- */}
          <section className="flex flex-col gap-4 rounded-xl border border-admin-ink/10 bg-white p-6">
            <span className="font-serif text-lg font-medium">1 · Elige la pieza</span>

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o categoría…"
              className={inputClass}
            />

            <div className="flex flex-wrap gap-2">
              {results.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedId(p.id);
                    resetDraft();
                  }}
                  className="rounded-full border px-3 py-1.5 text-xs font-medium"
                  style={
                    selectedId === p.id
                      ? { background: "#F1E4E5", borderColor: "transparent" }
                      : { borderColor: "rgba(0,0,0,0.14)" }
                  }
                >
                  {p.name}
                </button>
              ))}
              {results.length === 0 && (
                <span className="text-sm text-admin-faint">Ningún producto con esa búsqueda.</span>
              )}
            </div>

            {selected && (
              <div className="flex flex-col gap-2 rounded-lg bg-admin-surface-soft p-4 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium">{selected.name}</span>
                  <span className="text-admin-ink-soft">
                    {selected.priceType === "PERSONALIZADO" ? "desde " : ""}
                    {selected.price} €
                  </span>
                </div>
                {selected.shortDescription && (
                  <p className="text-admin-ink-soft">{selected.shortDescription}</p>
                )}
                {selected.description && (
                  <p className="whitespace-pre-line text-xs text-admin-ink-soft">
                    {selected.description}
                  </p>
                )}
                {selected.materials && (
                  <div className="text-xs text-admin-ink-soft">
                    <span className="font-medium text-admin-ink/85">Materiales</span>
                    <p className="whitespace-pre-line">{selected.materials}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-admin-faint">
                  <span>
                    Categoría: {selected.categories.length ? selected.categories.join(", ") : "—"}
                  </span>
                  <span>
                    Estado: {PIECE_STATUS_LABEL[selected.pieceStatus as PieceStatus]}
                  </span>
                </div>
              </div>
            )}
          </section>

          {/* ---------- 2. Media ---------- */}
          <section className="flex flex-col gap-4 rounded-xl border border-admin-ink/10 bg-white p-6">
            <div className="flex flex-col gap-1">
              <span className="font-serif text-lg font-medium">2 · Foto o vídeo</span>
              <span className="text-xs text-admin-faint">
                Puede ser distinto de las fotos de la ficha. JPG, PNG, WebP, GIF, MP4, WebM o MOV,
                hasta 50 MB.
              </span>
            </div>

            {mediaUrl ? (
              <div className="flex flex-col items-start gap-3">
                {mediaType === "video" ? (
                  <video src={mediaUrl} controls className="max-h-64 rounded-lg" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrl} alt="Media de la publicación" className="max-h-64 rounded-lg" />
                )}
                <button
                  onClick={() => {
                    setMediaUrl(null);
                    setMediaType(null);
                  }}
                  className="text-xs text-admin-danger"
                >
                  Quitar
                </button>
              </div>
            ) : (
              <div
                className="flex h-32 items-center justify-center rounded-lg border border-dashed border-admin-ink/20"
                style={{ background: "repeating-linear-gradient(45deg,#EDEBE8 0 9px,#F7F6F4 9px 18px)" }}
              >
                <span className="text-xs text-admin-faint">Sin archivo</span>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadMedia(file);
              }}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-fit rounded-full border border-admin-ink/16 bg-white px-3 py-1.5 text-xs font-medium disabled:opacity-60"
            >
              {uploading ? "Subiendo…" : mediaUrl ? "Cambiar archivo" : "Subir archivo"}
            </button>
          </section>

          {/* ---------- 3. Generación ---------- */}
          <section className="flex flex-col gap-4 rounded-xl border border-admin-ink/10 bg-white p-6">
            <span className="font-serif text-lg font-medium">3 · Generar el texto</span>

            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-admin-ink/85">
                Indicaciones para la IA (opcional)
              </span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Ej. mencionar que es un encargo de bautizo, o que quedan pocas unidades"
                className={inputClass}
              />
            </label>

            {angle && (
              <span className="text-xs text-admin-faint">
                Enfoque elegido del banco de ideas: <strong>{angle}</strong>{" "}
                <button onClick={() => setAngle(null)} className="text-admin-link">
                  quitar
                </button>
              </span>
            )}

            <button
              onClick={generate}
              disabled={!selected || generating}
              className="w-fit rounded-full bg-pink px-4 py-2.5 text-sm font-medium disabled:opacity-60"
            >
              {generating ? "Generando…" : "Generar texto con IA"}
            </button>
            {!selected && (
              <span className="text-xs text-admin-faint">Elige antes una pieza del catálogo.</span>
            )}
          </section>

          {/* ---------- 4. Textos ---------- */}
          {(instagramText || tiktokText) && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <TextBlock
                title="Instagram"
                hint="Más cuidado y descriptivo"
                value={instagramText}
                onChange={setInstagramText}
                filename={`instagram-${selected?.slug ?? "publicacion"}.txt`}
              />
              <TextBlock
                title="TikTok"
                hint="Más informal, con tendencias"
                value={tiktokText}
                onChange={setTiktokText}
                filename={`tiktok-${selected?.slug ?? "publicacion"}.txt`}
              />
            </div>
          )}

          {/* ---------- 5. Recordatorio ---------- */}
          <section className="flex flex-col gap-4 rounded-xl border border-admin-ink/10 bg-white p-6">
            <div className="flex flex-col gap-1">
              <span className="font-serif text-lg font-medium">4 · Fecha prevista</span>
              <span className="text-xs text-admin-faint">
                Solo es un recordatorio interno. La web no publica nada en Instagram ni en TikTok.
              </span>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-admin-ink/85">Cuándo la vas a subir</span>
              <input
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                className={`${inputClass} w-fit`}
              />
            </label>

            <button
              onClick={savePost}
              disabled={!selected || saving}
              className="w-fit rounded-full bg-pink px-4 py-2.5 text-sm font-medium disabled:opacity-60"
            >
              {saving ? "Guardando…" : "Guardar publicación"}
            </button>
          </section>

          {/* ---------- Guardadas ---------- */}
          {posts.length > 0 && (
            <section className="flex flex-col gap-4 rounded-xl border border-admin-ink/10 bg-white p-6">
              <span className="font-serif text-lg font-medium">Publicaciones preparadas</span>
              <div className="flex flex-col divide-y divide-admin-ink/8">
                {posts.map((post) => (
                  <div key={post.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                    <span className="font-medium">{post.productName}</span>
                    <span className="text-xs text-admin-faint">
                      {post.scheduledFor
                        ? new Date(post.scheduledFor).toLocaleString("es-ES", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Sin fecha"}
                    </span>
                    <div className="flex gap-1.5">
                      {post.instagramText && (
                        <span className="rounded-full bg-admin-surface-soft px-2 py-0.5 text-[10px]">
                          IG
                        </span>
                      )}
                      {post.tiktokText && (
                        <span className="rounded-full bg-admin-surface-soft px-2 py-0.5 text-[10px]">
                          TikTok
                        </span>
                      )}
                      {post.mediaUrl && (
                        <span className="rounded-full bg-admin-surface-soft px-2 py-0.5 text-[10px]">
                          Media
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removePost(post.id)}
                      className="ml-auto text-xs text-admin-danger"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ---------- Banco de ideas ---------- */}
        <aside className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
          <div className="flex flex-col gap-3 rounded-xl border border-admin-ink/10 bg-white p-5">
            <div className="flex flex-col gap-1">
              <span className="font-serif text-base font-medium">Banco de ideas</span>
              <span className="text-xs text-admin-faint">
                Tipos de contenido que funcionan. Pulsa uno para orientar el texto.
              </span>
            </div>
            <div className="flex flex-col gap-1">
              {CONTENT_IDEAS.map((idea) => (
                <button
                  key={idea.id}
                  onClick={() => setAngle(`${idea.label} — ${idea.description}`)}
                  className="flex flex-col gap-0.5 rounded-lg px-2.5 py-2 text-left"
                  style={
                    angle?.startsWith(idea.label) ? { background: "#F1E4E5" } : undefined
                  }
                >
                  <span className="text-[13px] font-medium text-admin-ink">{idea.label}</span>
                  <span className="text-xs leading-snug text-admin-ink-soft">
                    {idea.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function TextBlock({
  title,
  hint,
  value,
  onChange,
  filename,
}: {
  title: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  filename: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function download() {
    const blob = new Blob([value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-admin-ink/10 bg-white p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-serif text-lg font-medium">{title}</span>
        <span className="text-xs text-admin-faint">{hint}</span>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={14}
        className="rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-2.5 text-sm leading-relaxed outline-none"
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={copy}
          className="rounded-full border border-admin-ink/16 bg-white px-3 py-1.5 text-xs font-medium"
        >
          {copied ? "Copiado ✓" : "Copiar"}
        </button>
        <button
          onClick={download}
          className="rounded-full border border-admin-ink/16 bg-white px-3 py-1.5 text-xs font-medium"
        >
          Descargar .txt
        </button>
        <span className="ml-auto text-xs text-admin-faint">{value.length} caracteres</span>
      </div>
    </section>
  );
}
