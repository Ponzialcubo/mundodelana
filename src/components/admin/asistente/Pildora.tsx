"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, type Conv, type Progreso } from "./comun";
const quedan = (s: number) => (s < 60 ? "menos de 1 min" : `~${Math.round(s / 60)} min`);
const FASE: Record<string, string> = { trabajando: "Haciendo el cambio", publicando: "Publicando" };
export const guardado = (k: string) => { try { return sessionStorage.getItem(k); } catch { return null; } };
export const guardar = (k: string, v: string | null) => { try { if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch { /* no storage */ } };

/** Estimated progress of a running change (the agent computes it from how long the last changes took). */
export function BarraProgreso({ p, fase }: { p?: Progreso; fase?: string }) {
  if (!p) return null;
  const enCola = fase === "en_cola" || p.pct === 0;
  return (
    <div className="mt-1.5 flex flex-col gap-1">
      <div className="h-1.5 overflow-hidden rounded-full bg-admin-ink/10" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={p.pct} aria-label="Progreso del ticket">
        <span className="block h-full rounded-full bg-admin-ink transition-[width] duration-700 motion-reduce:transition-none" style={{ width: `${Math.max(p.pct, 3)}%` }} />
      </div>
      <span className="text-xs text-admin-ink-soft">{fase && FASE[fase] ? `${FASE[fase]} · ` : ""}{enCola ? `empieza en ${quedan(p.restante_s - p.total_s)}` : `queda ${quedan(p.restante_s)}`}</span>
    </div>
  );
}

/** Active tickets, polled faster while one is running. */
export function useActivas() {
  const [l, setL] = useState<Conv[]>([]);
  useEffect(() => {
    let vivo = true; let t: ReturnType<typeof setTimeout>;
    const tic = async () => {
      let rapido = false;
      try { const r = await api<Conv[]>("/conversaciones?vista=activas"); if (!vivo) return; setL(r); rapido = r.some((c) => c.estado === "enviada"); }
      catch { /* assistant off or down: nothing to show */ }
      if (vivo) t = setTimeout(tic, document.hidden ? 30_000 : rapido ? 4000 : 20_000);
    };
    tic(); return () => { vivo = false; clearTimeout(t); };
  }, []);
  return l;
}

/** Floating pill outside the assistant: running tickets with their progress and the folded chat to go back to. */
export function Pildora({ activas }: { activas: Conv[] }) {
  const [plegado, setPlegado] = useState<string | null>(null);
  useEffect(() => setPlegado(guardado("chat-plegado")), []);
  const enMarcha = activas.filter((c) => c.estado === "enviada");
  const chat = plegado ? activas.find((c) => String(c.id) === plegado && c.estado !== "enviada") : null;
  if (!enMarcha.length && !chat) return null;
  return (
    <aside aria-label="Tickets del asistente" className="fixed inset-x-2.5 bottom-[calc(76px+env(safe-area-inset-bottom))] z-40 flex flex-col gap-0.5 rounded-2xl border border-admin-ink/10 bg-white p-1.5 shadow-xl md:inset-x-auto md:bottom-4 md:right-4 md:w-[340px]">
      {enMarcha.slice(0, 2).map((c) => (
        <Link key={c.id} href={`/admin/asistente/${c.id}`} className="block rounded-xl px-2.5 py-2 hover:bg-admin-bg">
          <b className="block truncate text-sm font-medium">#{c.numero} {c.titulo}</b>
          <BarraProgreso p={c.progreso} />
        </Link>
      ))}
      {chat && (
        <div className="flex items-center gap-1 rounded-xl px-2.5 py-1.5">
          <Link href={`/admin/asistente/${chat.id}`} className="min-w-0 flex-1 truncate text-sm font-medium">Seguir con #{chat.numero} {chat.titulo}</Link>
          <button aria-label="Quitar" onClick={() => { guardar("chat-plegado", null); setPlegado(null); }} className="flex h-9 w-9 items-center justify-center rounded-full text-admin-ink-soft hover:bg-admin-bg">×</button>
        </div>
      )}
    </aside>
  );
}
