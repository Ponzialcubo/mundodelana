"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { frameStyle, type Framing } from "@/lib/framing";

type ProductOption = { id: string; name: string; image: ({ url: string } & Framing) | null; onInstagram: boolean };

/** Creates (or reopens) the draft post for a product and goes to the editor. */
function useStartPost() {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  async function start(productId: string) {
    setBusy(productId);
    const res = await fetch("/api/admin/redes/publicaciones", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId }) });
    const json = await res.json();
    if (res.ok) router.push(`/admin/redes/${json.id}`);
    else setBusy(null);
  }
  return { busy, start };
}

function Thumb({ image }: { image: ProductOption["image"] }) {
  return (
    <span className="relative aspect-[4/5] w-12 shrink-0 overflow-hidden rounded-md bg-admin-bg">
      {image && (
        // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail with the shop's crop
        <img src={image.url} alt="" className="absolute inset-0 h-full w-full object-cover" style={frameStyle(image)} />
      )}
    </span>
  );
}

export function NewPostRow({ product }: { product: ProductOption }) {
  const { busy, start } = useStartPost();
  return (
    <button
      type="button"
      onClick={() => start(product.id)}
      disabled={busy !== null}
      className="flex items-center gap-3 rounded-2xl border border-admin-ink/10 bg-white p-3 text-left transition hover:shadow-[0_8px_24px_rgba(31,27,26,.07)] disabled:opacity-60"
    >
      <Thumb image={product.image} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium">{product.name}</span>
        <span className="text-xs text-admin-link">{busy ? "Preparando…" : "Preparar publicación →"}</span>
      </span>
    </button>
  );
}

/** "+ Nueva publicación": pick the product it's about. */
export function NewPostPicker({ products }: { products: ProductOption[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { busy, start } = useStartPost();
  const q = query.trim().toLowerCase();
  const list = products.filter((p) => !q || p.name.toLowerCase().includes(q));

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="rounded-full bg-pink px-5 py-2.5 text-sm font-medium">
        + Nueva publicación
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-admin-ink/50 md:items-center" role="dialog" aria-label="Elegir producto">
          <div className="flex max-h-[85vh] w-full max-w-lg flex-col gap-3 rounded-t-2xl bg-white p-5 md:rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="font-serif text-lg">¿De qué producto es la publicación?</span>
              <button type="button" onClick={() => setOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-admin-bg text-lg" aria-label="Cerrar">
                ×
              </button>
            </div>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar producto…"
              className="rounded-lg border border-admin-ink/14 bg-admin-bg px-3.5 py-2.5 text-[16px] outline-none md:text-sm"
            />
            <div className="flex flex-col divide-y divide-admin-ink/8 overflow-y-auto">
              {list.map((p) => (
                <button key={p.id} type="button" onClick={() => start(p.id)} disabled={busy !== null} className="flex items-center gap-3 py-2.5 text-left disabled:opacity-60">
                  <Thumb image={p.image} />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">{p.name}</span>
                    <span className="text-xs text-admin-ink-soft">{busy === p.id ? "Preparando…" : p.onInstagram ? "Ya está en Instagram" : "Aún no está en Instagram"}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
