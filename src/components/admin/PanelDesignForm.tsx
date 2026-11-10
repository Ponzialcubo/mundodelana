"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ALL_ITEMS } from "@/components/admin/admin-nav";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { BLOQUES_INICIO, DISENO_BASE, MAX_BARRA, type Diseno } from "@/lib/panel-diseno";

const CAJA = "flex flex-col gap-3 rounded-xl border border-admin-ink/10 bg-white p-5";
const FILA = "flex items-center gap-2 rounded-xl border border-admin-ink/10 px-3 py-1.5";
const MINI = "flex h-9 w-9 items-center justify-center rounded-lg border border-admin-ink/12 text-admin-ink-soft disabled:opacity-35";

/** Bottom-bar tabs (4 around «Nuevo producto»), first screen and Inicio blocks. Saved on the server. */
export function PanelDesignForm({ inicial }: { inicial: Diseno }) {
  const router = useRouter();
  const [d, setD] = useState<Diseno>(inicial);
  const [aviso, setAviso] = useState<{ t: string; mal?: boolean } | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const item = (h: string) => ALL_ITEMS.find((i) => i.href === h);
  const mover = <T,>(l: T[], i: number, dir: number) => { const n = [...l]; [n[i], n[i + dir]] = [n[i + dir], n[i]]; return n; };
  const poner = (h: string, si: boolean) => {
    if (si && d.barra.length >= MAX_BARRA) return setAviso({ t: `La barra admite ${MAX_BARRA} botones. Quita uno antes.`, mal: true });
    if (!si && d.barra.length <= 1) return setAviso({ t: "Deja al menos un botón en la barra.", mal: true });
    setAviso(null); setD({ ...d, barra: si ? [...d.barra, h] : d.barra.filter((x) => x !== h) });
  };
  async function guardar() {
    setOcupado(true);
    try {
      const r = await fetch("/api/admin/diseno", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "No se pudo guardar");
      setAviso({ t: "Diseño guardado" }); router.refresh();
    } catch (e) { setAviso({ t: (e as Error).message, mal: true }); }
    finally { setOcupado(false); }
  }
  const flechas = (i: number, total: number, cambiar: (dir: number) => void) => (
    <span className="flex gap-1">
      <button type="button" className={MINI} disabled={i === 0} onClick={() => cambiar(-1)} aria-label="Subir">↑</button>
      <button type="button" className={MINI} disabled={i === total - 1} onClick={() => cambiar(1)} aria-label="Bajar">↓</button>
    </span>
  );

  return (
    <div className="flex flex-col gap-4">
      <section className={CAJA}>
        <div className="flex items-baseline justify-between gap-3"><h2 className="font-serif text-lg">Barra de abajo del móvil</h2><span className="text-xs text-admin-ink-soft">{d.barra.length} de {MAX_BARRA}</span></div>
        <p className="text-sm text-admin-ink-soft">4 botones alrededor de «Nuevo producto», que siempre va en el centro. Los dos primeros van a la izquierda. Todo lo demás está en el menú.</p>
        <ul className="flex flex-col gap-1.5">
          {d.barra.map((h, i) => (
            <li key={h} className={FILA}>
              {item(h) && <AdminIcon name={item(h)!.icon} className="h-5 w-5 shrink-0" />}
              <b className="min-w-0 flex-1 truncate text-sm font-medium">{item(h)?.label}</b>
              {flechas(i, d.barra.length, (dir) => setD({ ...d, barra: mover(d.barra, i, dir) }))}
              <button type="button" className={MINI} onClick={() => poner(h, false)} aria-label={`Quitar ${item(h)?.label}`}>×</button>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          {ALL_ITEMS.filter((i) => !d.barra.includes(i.href)).map((i) => (
            <button key={i.href} type="button" onClick={() => poner(i.href, true)} className="rounded-full border border-admin-ink/14 px-3 py-1.5 text-sm">+ {i.label}</button>
          ))}
        </div>
      </section>

      <section className={CAJA}>
        <h2 className="font-serif text-lg">Al entrar, ir a</h2>
        <select value={d.inicio} onChange={(e) => setD({ ...d, inicio: e.target.value })} className="rounded-xl border border-admin-ink/14 bg-white px-3 py-2.5 text-[16px] md:text-sm">
          {ALL_ITEMS.map((i) => <option key={i.href} value={i.href}>{i.label}</option>)}
        </select>
      </section>

      <section className={CAJA}>
        <h2 className="font-serif text-lg">Bloques de Inicio</h2>
        <p className="text-sm text-admin-ink-soft">Cuáles se ven y en qué orden.</p>
        <ul className="flex flex-col gap-1.5">
          {d.bloques.map((b, i) => (
            <li key={b.k} className={`${FILA} ${b.ver ? "" : "opacity-60"}`}>
              <label className="flex min-w-0 flex-1 items-center gap-2.5 text-sm">
                <input type="checkbox" className="h-4 w-4" checked={b.ver} onChange={(e) => setD({ ...d, bloques: d.bloques.map((x) => (x.k === b.k ? { ...x, ver: e.target.checked } : x)) })} />
                {BLOQUES_INICIO.find((x) => x.k === b.k)?.t}
              </label>
              {flechas(i, d.bloques.length, (dir) => setD({ ...d, bloques: mover(d.bloques, i, dir) }))}
            </li>
          ))}
        </ul>
      </section>

      {aviso && <p role="status" className={`text-sm ${aviso.mal ? "text-admin-danger" : "text-[#4F6645]"}`}>{aviso.t}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" disabled={ocupado} onClick={guardar} className="rounded-full bg-admin-ink px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50">Guardar diseño</button>
        <button type="button" onClick={() => setD(DISENO_BASE)} className="text-sm text-admin-link">Volver al diseño de siempre</button>
      </div>
    </div>
  );
}
