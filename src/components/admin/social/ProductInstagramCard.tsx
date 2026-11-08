"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type PostSummary = { id: string; status: string; scheduledFor: string | null };

/** Instagram status of a product in its editor, with a shortcut to prepare a post from it. */
export function ProductInstagramCard({ productId, instagramUrl, posts }: { productId: string; instagramUrl: string | null; posts: PostSummary[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const scheduled = posts.find((p) => p.status === "PROGRAMADA");
  const draft = posts.find((p) => p.status === "BORRADOR" || p.status === "ERROR");

  async function prepare() {
    setBusy(true);
    const res = await fetch("/api/admin/redes/publicaciones", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId }) });
    const json = await res.json();
    if (res.ok) router.push(`/admin/redes/${json.id}`);
    else setBusy(false);
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-admin-ink/10 bg-white p-5 md:p-6">
      <span className="font-serif text-base font-medium">Instagram</span>
      {instagramUrl ? (
        <span className="text-xs text-admin-ink-soft">
          Ya está en Instagram.{" "}
          <a href={instagramUrl} target="_blank" rel="noreferrer" className="font-medium text-admin-link underline">
            Ver publicación ↗
          </a>
        </span>
      ) : (
        <span className="text-xs text-admin-ink-soft">Todavía no está en Instagram.</span>
      )}
      {scheduled?.scheduledFor && (
        <Link href={`/admin/redes/${scheduled.id}`} className="rounded-lg bg-[#F6E7D3] px-3 py-2 text-xs">
          ⏰ Programada para el {new Date(scheduled.scheduledFor).toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
        </Link>
      )}
      <button type="button" onClick={prepare} disabled={busy} className="rounded-full bg-admin-ink px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60">
        {busy ? "Preparando…" : draft ? "Seguir con el borrador" : instagramUrl ? "Publicar una versión nueva" : "📸 Preparar publicación"}
      </button>
      <span className="text-[11px] leading-snug text-admin-faint">Con estas fotos (mismo encuadre), texto y hashtags escritos por la IA. Guarda antes los cambios de la ficha.</span>
    </div>
  );
}
