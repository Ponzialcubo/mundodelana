"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FramingEditor } from "@/components/admin/FramingEditor";
import { InstagramPreview } from "@/components/admin/social/InstagramPreview";
import { frameStyle } from "@/lib/framing";
import { ANGLES } from "@/lib/social-prompt";
import type { PostMedia } from "@/lib/social/publish";
import type { SocialPostStatus } from "@/generated/prisma";

type Post = {
  id: string;
  status: SocialPostStatus;
  media: PostMedia[];
  instagramText: string;
  hashtags: string;
  tiktokText: string;
  scheduledFor: string | null;
  permalink: string | null;
  publishedAt: string | null;
  error: string | null;
};

const CAPTION_MAX = 2200;
const HASHTAGS_MAX = 30;
const FRAMES = [{ label: "Instagram · 1080 × 1350", aspect: 4 / 5 }];
const INPUT = "w-full rounded-lg border border-admin-ink/14 bg-admin-bg px-3.5 py-2.5 text-[16px] outline-none focus:border-admin-ink/40 md:text-sm";
const CARD = "flex flex-col gap-4 rounded-2xl border border-admin-ink/10 bg-white p-5 md:p-6";

const countTags = (text: string) => (text.match(/#[\p{L}\p{N}_]+/gu) ?? []).length;
const mergeTags = (current: string, extra: string) => [...new Set([...current.split(/\s+/), ...extra.split(/\s+/)].filter((t) => t.startsWith("#")))].join(" ");
/** "YYYY-MM-DDTHH:mm" in the browser's time for the datetime input. */
const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const when = (iso: string) => new Date(iso).toLocaleString("es-ES", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

export function PostComposer({
  post,
  product,
  library,
  hashtagSets,
}: {
  post: Post;
  product: { id: string; name: string; slug: string } | null;
  library: PostMedia[];
  hashtagSets: { name: string; tags: string }[];
}) {
  const router = useRouter();
  const locked = post.status === "PUBLICADA" || post.status === "PUBLICANDO";
  const [media, setMedia] = useState(post.media);
  const [caption, setCaption] = useState(post.instagramText);
  const [hashtags, setHashtags] = useState(post.hashtags);
  const [tiktok, setTiktok] = useState(post.tiktokText);
  const [angle, setAngle] = useState<string>("presentar");
  const [idea, setIdea] = useState("");
  const [writing, setWriting] = useState(false);
  const [framing, setFraming] = useState<string | null>(null);
  const [busy, setBusy] = useState<"publish" | "schedule" | null>(null);
  const [error, setError] = useState(post.status === "ERROR" ? post.error : null);
  const [scheduleAt, setScheduleAt] = useState(post.scheduledFor ? toLocalInput(post.scheduledFor) : "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  // Autosave a moment after each change, so nothing is lost.
  const payload = JSON.stringify({ media, instagramText: caption, hashtags, tiktokText: tiktok });
  const [savedPayload, setSavedPayload] = useState(payload);
  const [saving, setSaving] = useState(false);
  const saveState = saving ? "saving" : payload === savedPayload ? "saved" : "dirty";

  useEffect(() => {
    if (locked || payload === savedPayload) return;
    const t = setTimeout(async () => {
      setSaving(true);
      await fetch(`/api/admin/redes/publicaciones/${post.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: payload });
      setSavedPayload(payload);
      setSaving(false);
    }, 900);
    return () => clearTimeout(t);
  }, [payload, savedPayload, locked, post.id]);

  const unused = library.filter((l) => !media.some((m) => m.url === l.url));
  const fullLength = [caption.trim(), hashtags.trim()].filter(Boolean).join("\n\n").length;
  const tagCount = countTags(`${caption} ${hashtags}`);

  function move(i: number, to: number) {
    if (to < 0 || to >= media.length) return;
    const next = [...media];
    const [item] = next.splice(i, 1);
    next.splice(to, 0, item);
    setMedia(next);
  }

  async function upload(file: File) {
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/imagenes/subir", { method: "POST", body: form });
    const json = await res.json();
    setUploading(false);
    if (res.ok) setMedia((m) => [...m, { url: json.url, kind: "image" as const, focalX: 0.5, focalY: 0.5, zoom: 1 }].slice(0, 10));
    else setError(json.error ?? "No se ha podido subir la foto");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function write() {
    if (!product) return;
    setWriting(true);
    setError(null);
    const res = await fetch("/api/admin/redes/generar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product.id, angle, idea }) });
    const json = await res.json();
    setWriting(false);
    if (!res.ok) return setError(json.error);
    setCaption(json.caption);
    setHashtags(json.hashtags);
    setTiktok(json.tiktok);
  }

  async function flush() {
    await fetch(`/api/admin/redes/publicaciones/${post.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: payload });
    setSavedPayload(payload);
  }

  async function publish() {
    if (!window.confirm("¿Publicar ahora en Instagram? Una vez publicada, las fotos no se pueden cambiar desde aquí.")) return;
    setBusy("publish");
    setError(null);
    await flush();
    const res = await fetch(`/api/admin/redes/publicaciones/${post.id}/publicar`, { method: "POST" });
    const json = await res.json();
    setBusy(null);
    if (!res.ok) setError(json.error);
    router.refresh();
  }

  async function schedule(at: string | null) {
    setBusy("schedule");
    setError(null);
    await flush();
    const res = await fetch(`/api/admin/redes/publicaciones/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schedule: at ? new Date(at).toISOString() : null }),
    });
    const json = await res.json();
    setBusy(null);
    if (!res.ok) setError(json.error);
    router.refresh();
  }

  async function duplicate() {
    const res = await fetch("/api/admin/redes/publicaciones", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fromId: post.id }) });
    const json = await res.json();
    if (res.ok) router.push(`/admin/redes/${json.id}`);
  }

  async function remove() {
    const message = post.status === "PUBLICADA" ? "¿Quitarla de esta lista? En Instagram seguirá publicada." : "¿Borrar esta publicación?";
    if (!window.confirm(message)) return;
    await fetch(`/api/admin/redes/publicaciones/${post.id}`, { method: "DELETE" });
    router.push("/admin/redes");
    router.refresh();
  }

  const framingItem = media.find((m) => m.url === framing);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-5 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Link href="/admin/redes" className="text-xs text-admin-ink-soft">
            ‹ Redes sociales
          </Link>
          <h1 className="font-serif text-2xl font-normal">{product ? `Instagram · ${product.name}` : "Publicación de Instagram"}</h1>
          {product && (
            <Link href={`/admin/productos/${product.id}`} className="text-xs text-admin-link underline">
              Ver la ficha del producto
            </Link>
          )}
        </div>
        {!locked && <span className="text-xs text-admin-ink-soft">{saveState === "saved" ? "✓ Guardado" : saveState === "saving" ? "Guardando…" : "Cambios sin guardar…"}</span>}
      </div>

      {post.status === "PUBLICADA" && (
        <div className="flex flex-col gap-2 rounded-2xl bg-[#E3EADB] p-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm">
            ✓ Publicada en Instagram{post.publishedAt ? ` el ${when(post.publishedAt)}` : ""}. Instagram no deja cambiar las fotos de una
            publicación ya hecha; el texto se puede editar desde la app.
          </span>
          <div className="flex shrink-0 gap-2">
            {post.permalink && (
              <a href={post.permalink} target="_blank" rel="noreferrer" className="rounded-full bg-white px-4 py-2 text-sm font-medium">
                Ver en Instagram ↗
              </a>
            )}
            <button type="button" onClick={duplicate} className="rounded-full bg-admin-ink px-4 py-2 text-sm font-medium text-white">
              Crear versión nueva
            </button>
          </div>
        </div>
      )}
      {post.status === "PROGRAMADA" && post.scheduledFor && (
        <div className="flex flex-col gap-2 rounded-2xl bg-[#F6E7D3] p-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm">⏰ Programada para el {when(post.scheduledFor)}. Se publicará sola; puedes seguir editándola hasta entonces.</span>
          <button type="button" onClick={() => schedule(null)} disabled={busy !== null} className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-medium">
            Cancelar programación
          </button>
        </div>
      )}
      {error && <p className="rounded-2xl bg-admin-accent-soft px-4 py-3 text-sm text-admin-danger">{error}</p>}

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-5">
          {/* 1. Photos */}
          <section className={CARD}>
            <div className="flex flex-col gap-0.5">
              <span className="font-serif text-lg">1. Fotos</span>
              <span className="text-xs text-admin-ink-soft">
                Hasta 10. Se publican recortadas a 1080 × 1350 (4:5), con el mismo encuadre que en la web. Toca una para ajustarla.
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 xl:grid-cols-5">
              {media.map((m, i) => (
                <div key={m.url} className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => !locked && m.kind === "image" && setFraming(m.url)}
                    className="relative aspect-[4/5] overflow-hidden rounded-lg bg-admin-bg"
                    aria-label="Encuadrar"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- crop preview identical to the published JPEG */}
                    <img src={m.kind === "video" ? m.posterUrl ?? m.url : m.url} alt="" className="absolute inset-0 h-full w-full object-cover" style={frameStyle(m)} />
                    <span className="absolute left-1 top-1 rounded-full bg-white/90 px-1.5 text-[10px] font-medium">{i + 1}</span>
                    {m.kind === "video" && <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 text-[10px] text-white">Vídeo</span>}
                  </button>
                  {!locked && (
                    <div className="flex items-center justify-between">
                      <span className="flex gap-1">
                        <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="flex h-7 w-7 items-center justify-center rounded-md border border-admin-ink/14 text-xs disabled:opacity-30" aria-label="Antes">
                          ‹
                        </button>
                        <button type="button" onClick={() => move(i, i + 1)} disabled={i === media.length - 1} className="flex h-7 w-7 items-center justify-center rounded-md border border-admin-ink/14 text-xs disabled:opacity-30" aria-label="Después">
                          ›
                        </button>
                      </span>
                      <button type="button" onClick={() => setMedia(media.filter((x) => x.url !== m.url))} className="text-[11px] font-medium text-admin-danger">
                        Quitar
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {!locked && media.length < 10 && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex aspect-[4/5] flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-admin-ink/25 text-xs text-admin-ink-soft"
                >
                  <span className="text-xl leading-none">+</span>
                  {uploading ? "Subiendo…" : "Subir foto"}
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            {!locked && unused.length > 0 && (
              <div className="flex flex-col gap-2 rounded-xl bg-admin-bg p-3">
                <span className="text-xs text-admin-ink-soft">Otras fotos de la ficha (toca para añadir):</span>
                <div className="flex flex-wrap gap-2">
                  {unused.map((m) => (
                    <button
                      key={m.url}
                      type="button"
                      onClick={() => media.length < 10 && setMedia([...media, m])}
                      className="relative aspect-[4/5] w-14 overflow-hidden rounded-md opacity-80 hover:opacity-100"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
                      <img src={m.kind === "video" ? m.posterUrl ?? m.url : m.url} alt="" className="absolute inset-0 h-full w-full object-cover" style={frameStyle(m)} />
                      <span className="absolute inset-x-0 bottom-0 bg-black/45 text-center text-[10px] text-white">+</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* 2. Text */}
          <section className={CARD}>
            <span className="font-serif text-lg">2. Texto y hashtags</span>
            {!locked && product && (
              <div className="flex flex-col gap-3 rounded-xl bg-[#FBF3E4] p-4">
                <span className="text-[13px] font-medium">✨ Que la IA lo escriba (con los datos de la ficha)</span>
                <div className="flex flex-wrap gap-2">
                  {ANGLES.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setAngle(a.id)}
                      title={a.hint}
                      className={`rounded-full px-3 py-1.5 text-[13px] ${angle === a.id ? "bg-admin-ink text-white" : "border border-admin-ink/14 bg-white"}`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
                <input value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="Algo que quieras que diga (opcional): «es para un bautizo», «quedan 2»…" className={`${INPUT} bg-white`} />
                <button type="button" onClick={write} disabled={writing} className="w-fit rounded-full bg-admin-ink px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60">
                  {writing ? "Escribiendo…" : caption ? "Volver a escribir" : "Escribir texto y hashtags"}
                </button>
              </div>
            )}

            <label className="flex flex-col gap-1.5">
              <span className="flex items-center justify-between text-[13px] font-medium">
                Texto
                <span className={`text-xs font-normal ${fullLength > CAPTION_MAX ? "text-admin-danger" : "text-admin-faint"}`}>
                  {fullLength} / {CAPTION_MAX}
                </span>
              </span>
              <textarea value={caption} onChange={(e) => setCaption(e.target.value)} readOnly={locked} rows={8} placeholder="La primera línea es la que se ve sin pulsar «más»." className={INPUT} />
            </label>

            <div className="flex flex-col gap-1.5">
              <span className="flex items-center justify-between text-[13px] font-medium">
                Hashtags
                <span className={`text-xs font-normal ${tagCount > HASHTAGS_MAX ? "text-admin-danger" : "text-admin-faint"}`}>
                  {tagCount} / {HASHTAGS_MAX}
                </span>
              </span>
              <textarea value={hashtags} onChange={(e) => setHashtags(e.target.value)} readOnly={locked} rows={3} placeholder="#mundolana #crochet …" className={INPUT} />
              {!locked && hashtagSets.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-admin-ink-soft">Añadir grupo:</span>
                  {hashtagSets.map((s) => (
                    <button key={s.name} type="button" onClick={() => setHashtags(mergeTags(hashtags, s.tags))} title={s.tags} className="rounded-full border border-admin-ink/14 bg-white px-2.5 py-1 text-xs">
                      + {s.name}
                    </button>
                  ))}
                  <Link href="/admin/redes?ver=hashtags" className="text-xs text-admin-link underline">
                    Editar grupos
                  </Link>
                </div>
              )}
            </div>

            <details className="group rounded-xl border border-admin-ink/10">
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-[13px] font-medium">
                Versión para TikTok <span className="text-admin-faint transition group-open:rotate-90">›</span>
              </summary>
              <div className="flex flex-col gap-2 border-t border-admin-ink/8 p-4">
                <span className="text-xs text-admin-ink-soft">TikTok no permite publicar desde webs sin una aprobación especial: descarga el kit y súbelo desde la app.</span>
                <textarea value={tiktok} onChange={(e) => setTiktok(e.target.value)} readOnly={locked} rows={3} className={INPUT} />
              </div>
            </details>
          </section>

          {/* 3. Publish */}
          {!locked && (
            <section className={CARD}>
              <span className="font-serif text-lg">3. Publicar</span>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="flex flex-col gap-2 rounded-xl border border-admin-ink/10 p-4">
                  <span className="text-sm font-medium">Ahora</span>
                  <span className="text-xs text-admin-ink-soft">Sale en tu Instagram en menos de un minuto.</span>
                  <button type="button" onClick={publish} disabled={busy !== null || media.length === 0} className="mt-auto rounded-full bg-pink px-5 py-3 text-sm font-medium disabled:opacity-50">
                    {busy === "publish" ? "Publicando… no cierres la página" : "Publicar en Instagram"}
                  </button>
                </div>
                <div className="flex flex-col gap-2 rounded-xl border border-admin-ink/10 p-4">
                  <span className="text-sm font-medium">Programar</span>
                  <span className="text-xs text-admin-ink-soft">Elige día y hora y se publica sola (los mejores momentos suelen ser 13-14 h y 20-22 h).</span>
                  <input type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} className={INPUT} />
                  <button type="button" onClick={() => schedule(scheduleAt)} disabled={busy !== null || !scheduleAt || media.length === 0} className="rounded-full bg-admin-ink px-5 py-3 text-sm font-medium text-white disabled:opacity-50">
                    {busy === "schedule" ? "Programando…" : post.status === "PROGRAMADA" ? "Cambiar la hora" : "Programar"}
                  </button>
                </div>
              </div>
            </section>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <a href={`/api/admin/redes/publicaciones/${post.id}/kit`} className="font-medium text-admin-link underline">
              Descargar fotos y textos (para subir a mano o a TikTok)
            </a>
            <button type="button" onClick={remove} className="ml-auto font-medium text-admin-danger">
              {post.status === "PUBLICADA" ? "Quitar de la lista" : "Borrar publicación"}
            </button>
          </div>
        </div>

        <aside className="flex flex-col gap-3 lg:sticky lg:top-6">
          <span className="text-center text-[11px] font-medium uppercase tracking-[.14em] text-admin-faint">Así se verá en Instagram</span>
          <InstagramPreview media={media} caption={caption} hashtags={hashtags} />
        </aside>
      </div>

      {framingItem && (
        <FramingEditor
          src={framingItem.url}
          value={framingItem}
          frames={FRAMES}
          onChange={(v) => setMedia(media.map((m) => (m.url === framingItem.url ? { ...m, ...v } : m)))}
          onClose={() => setFraming(null)}
        />
      )}
    </div>
  );
}
