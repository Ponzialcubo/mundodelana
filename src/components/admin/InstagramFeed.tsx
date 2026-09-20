"use client";

import { useEffect, useState } from "react";

type InstagramMedia = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
};

/**
 * Read-only view of what's already live on @mundolana16, fetched live from
 * the Graph API. Lets Elvira check what's been posted without leaving the
 * backoffice or opening Instagram — no local copy is kept in the database.
 */
export function InstagramFeed() {
  const [media, setMedia] = useState<InstagramMedia[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/redes/instagram")
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error ?? "No se ha podido leer Instagram.");
        setMedia(data.media);
      })
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "No se ha podido leer Instagram."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-admin-ink/10 bg-white p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-serif text-lg font-medium">Publicado en @mundolana16</span>
        {media && <span className="text-xs text-admin-faint">Últimas {media.length} publicaciones</span>}
      </div>

      {loading && <span className="text-sm text-admin-faint">Cargando…</span>}
      {error && <span className="text-sm text-admin-danger">{error}</span>}

      {media && media.length === 0 && (
        <span className="text-sm text-admin-faint">Todavía no hay publicaciones.</span>
      )}

      {media && media.length > 0 && (
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6">
          {media.map((item) => (
            <a
              key={item.id}
              href={item.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-lg bg-admin-surface-soft"
              title={item.caption ?? undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.media_type === "VIDEO" ? item.thumbnail_url ?? item.media_url : item.media_url}
                alt={item.caption?.slice(0, 80) ?? "Publicación de Instagram"}
                className="h-full w-full object-cover"
              />
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/55 px-1.5 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                <span>♥ {item.like_count ?? 0}</span>
                <span>💬 {item.comments_count ?? 0}</span>
              </span>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
