"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type LibraryItem = { id: string; url: string; mediaType: "IMAGE" | "VIDEO"; posterUrl: string | null };
export type LibraryGroup = {
  key: string;
  caption: string | null;
  permalink: string | null;
  takenAt: string | null;
  items: LibraryItem[];
};

export function MediaLibrary({ groups, status }: { groups: LibraryGroup[]; status: "NUEVA" | "USADA" | "DESCARTADA" }) {
  const router = useRouter();
  // Ordered: the first selected photo becomes the product cover.
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  function toggleGroup(group: LibraryGroup) {
    const ids = group.items.map((i) => i.id);
    const allOn = ids.every((id) => selected.includes(id));
    setSelected((s) => (allOn ? s.filter((id) => !ids.includes(id)) : [...s, ...ids.filter((id) => !s.includes(id))]));
  }

  async function importInstagram() {
    setBusy(true);
    setError("");
    let total = 0;
    try {
      // The server imports in batches; keep asking while there is progress.
      for (;;) {
        setMessage(total ? `Importadas ${total}…` : "Conectando con Instagram…");
        const res = await fetch("/api/admin/biblioteca/instagram", { method: "POST" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        total += json.imported;
        if (json.remaining === 0 || json.imported === 0) {
          setMessage(
            total
              ? `Listo: ${total} fotos o vídeos nuevos.${json.failed ? ` ${json.failed} no se pudieron traer.` : ""}`
              : "No hay publicaciones nuevas en Instagram."
          );
          break;
        }
      }
      router.refresh();
    } catch (err) {
      setMessage("");
      setError(err instanceof Error ? err.message : "Error al importar");
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(newStatus: "NUEVA" | "DESCARTADA") {
    setBusy(true);
    await fetch("/api/admin/biblioteca/estado", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selected, status: newStatus }),
    });
    setSelected([]);
    setBusy(false);
    router.refresh();
  }

  async function createProduct() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/biblioteca/crear-producto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selected }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "No se ha podido crear el producto");
      setBusy(false);
      return;
    }
    router.push(`/admin/productos/${json.id}`);
  }

  return (
    <div className="flex flex-col gap-4">
      {status === "NUEVA" && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-admin-ink/10 bg-white p-4">
          <button
            onClick={importInstagram}
            disabled={busy}
            className="rounded-full bg-pink px-4 py-2.5 text-sm font-medium disabled:opacity-60"
          >
            Traer de Instagram
          </button>
          <span className="text-xs text-admin-ink-soft">
            {message || "Solo se traen las publicaciones nuevas; puedes pulsarlo cuando quieras."}
          </span>
        </div>
      )}

      {error && <p className="rounded-lg bg-admin-accent-soft px-4 py-3 text-sm text-admin-danger">{error}</p>}

      {groups.length === 0 && (
        <div className="rounded-xl border border-admin-ink/10 bg-white p-10 text-center text-sm text-admin-ink-soft">
          {status === "NUEVA" ? "No hay fotos por revisar." : "Aquí no hay nada todavía."}
        </div>
      )}

      {groups.map((group) => {
        const allOn = group.items.every((i) => selected.includes(i.id));
        return (
          <div key={group.key} className="flex flex-col gap-3 rounded-xl border border-admin-ink/10 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-xs text-admin-faint">
                  {group.takenAt
                    ? new Date(group.takenAt).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
                    : "Subida a mano"}
                  {group.permalink && (
                    <>
                      {" · "}
                      <a href={group.permalink} target="_blank" rel="noreferrer" className="text-admin-link">
                        ver en Instagram
                      </a>
                    </>
                  )}
                </span>
                {group.caption && <span className="line-clamp-2 text-sm text-admin-ink-soft">{group.caption}</span>}
              </div>
              {group.items.length > 1 && (
                <button onClick={() => toggleGroup(group)} className="shrink-0 text-xs font-medium text-admin-link">
                  {allOn ? "Quitar" : "Elegir todas"}
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {group.items.map((item) => {
                const position = selected.indexOf(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggle(item.id)}
                    className="relative aspect-[4/5] overflow-hidden rounded-lg bg-admin-bg"
                    style={position >= 0 ? { outline: "3px solid #E8B4B8", outlineOffset: -3 } : {}}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- thumbnails of arbitrary aspect, no optimisation needed in the admin */}
                    <img
                      src={item.mediaType === "VIDEO" ? item.posterUrl ?? "" : item.url}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                    {item.mediaType === "VIDEO" && (
                      <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium uppercase text-white">
                        Vídeo
                      </span>
                    )}
                    {position >= 0 && (
                      <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-pink text-xs font-medium text-admin-ink">
                        {position + 1}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {selected.length > 0 && (
        <div className="fixed inset-x-0 bottom-[calc(57px+env(safe-area-inset-bottom))] z-20 flex flex-wrap items-center gap-2.5 border-t border-admin-ink/10 bg-white/95 px-4 py-3 backdrop-blur md:bottom-0 md:left-[220px]">
          <span className="text-sm font-medium">{selected.length} elegidas</span>
          <button onClick={() => setSelected([])} className="text-xs text-admin-ink-soft underline">
            quitar
          </button>
          <div className="ml-auto flex gap-2">
            {status === "DESCARTADA" ? (
              <button
                onClick={() => setStatus("NUEVA")}
                disabled={busy}
                className="rounded-full border border-admin-ink/16 bg-white px-4 py-2.5 text-sm font-medium disabled:opacity-60"
              >
                Recuperar
              </button>
            ) : (
              <button
                onClick={() => setStatus("DESCARTADA")}
                disabled={busy}
                className="rounded-full border border-admin-ink/16 bg-white px-4 py-2.5 text-sm font-medium disabled:opacity-60"
              >
                Descartar
              </button>
            )}
            <button
              onClick={createProduct}
              disabled={busy}
              className="rounded-full bg-pink px-4 py-2.5 text-sm font-medium disabled:opacity-60"
            >
              Crear producto
            </button>
          </div>
        </div>
      )}
      {selected.length > 0 && <div className="h-20" />}
    </div>
  );
}
