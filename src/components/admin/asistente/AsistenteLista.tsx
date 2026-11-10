"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ESTADO, Hoja, INICIOS, Icono, accionesTicket, api, fecha, limpiarTitulo, useAviso, usePulsacionLarga, type Conv } from "./comun";

type Vista = "activas" | "terminadas" | "archivadas";
const VISTAS: [Vista, string][] = [["activas", "Abiertos"], ["terminadas", "Terminados"], ["archivadas", "Archivados"]];

const teToca = (c: Conv) => (c.estado === "abierta" && c.ultimo_rol === "asistente") || ((c.estado === "hecha" || c.estado === "fallida") && !c.valoracion);

function FilaTicket({ c, onMenu }: { c: Conv; onMenu: (c: Conv) => void }) {
  const lp = usePulsacionLarga(() => onMenu(c));
  const toca = teToca(c);
  return (
    <li className="flex items-stretch border-b border-admin-ink/8 last:border-0">
      <Link href={`/admin/asistente/${c.id}`} {...lp} className="flex min-w-0 flex-1 items-start gap-3 px-4 py-3.5 hover:bg-admin-surface-soft">
        <span className="mt-0.5 rounded-md bg-admin-bg px-1.5 py-0.5 font-mono text-xs text-admin-ink-soft" aria-label={`Ticket ${c.numero}`}>#{c.numero}</span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <b className="truncate text-[15px] font-medium">{limpiarTitulo(c.titulo)}</b>
          <small className="line-clamp-2 text-[13px] text-admin-ink-soft">
            {c.ref_numero ? `Corrige el ticket #${c.ref_numero}` : c.viene_de_numero ? `Sale del ticket #${c.viene_de_numero}` : c.ultimo ? c.ultimo.replace(/\s+/g, " ").slice(0, 120) : "Sin mensajes todavía"}
          </small>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-1">
          <time className="text-xs text-admin-muted">{fecha(c.actualizada)}</time>
          {toca
            ? <i className="rounded-full bg-pink px-2 py-0.5 text-[11px] font-medium not-italic text-admin-ink">Te toca</i>
            : <i className={`rounded-full px-2 py-0.5 text-[11px] font-medium not-italic ${ESTADO[c.estado]?.cls}`}>{ESTADO[c.estado]?.label}</i>}
        </span>
      </Link>
      <button className="px-3 text-admin-muted hover:text-admin-ink" aria-label={`Acciones del ticket ${c.numero}`} onClick={() => onMenu(c)}>
        <Icono n="puntos" />
      </button>
    </li>
  );
}

export function AsistenteLista({ activo, vistaInicial = "activas" }: { activo: boolean; vistaInicial?: string }) {
  const router = useRouter();
  const [vista, setVista] = useState<Vista>(VISTAS.some(([k]) => k === vistaInicial) ? (vistaInicial as Vista) : "activas");
  const [filas, setFilas] = useState<Conv[] | null>(null);
  const [error, setError] = useState("");
  const [menu, setMenu] = useState<Conv | null>(null);
  const [vuelta, setVuelta] = useState(0);
  const [creando, setCreando] = useState(false);
  const aviso = useAviso();

  useEffect(() => {
    if (!activo) return;
    history.replaceState(null, "", vista === "activas" ? "/admin/asistente" : `/admin/asistente?vista=${vista}`);
    let vivo = true;
    const cargar = () =>
      api<Conv[]>(`/conversaciones?vista=${vista}`)
        .then((r) => { if (vivo) { setFilas(r); setError(""); } })
        .catch((e) => { if (vivo) { setFilas([]); setError((e as Error).message); } });
    cargar();
    const t = setInterval(() => !document.hidden && cargar(), 15_000);
    return () => { vivo = false; clearInterval(t); };
  }, [vista, vuelta, activo]);

  async function nuevo(texto?: string) {
    setCreando(true);
    try {
      const c = await api<{ id: number }>("/conversaciones", { body: {} });
      if (texto) await api(`/conversaciones/${c.id}/mensajes`, { body: { texto } });
      router.push(`/admin/asistente/${c.id}`);
    } catch (e) {
      aviso.mostrar((e as Error).message, "error");
      setCreando(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 p-5 md:p-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex max-w-xl flex-col gap-1">
          <h1 className="font-serif text-2xl font-normal">Asistente</h1>
          <p className="text-sm text-admin-ink-soft">
            Cada cambio que quieras en la web o en este panel es un ticket: me lo cuentas, te propongo cómo hacerlo, lo publico y el ticket se cierra.
          </p>
        </div>
        {activo && (
          <button onClick={() => nuevo()} disabled={creando} className="flex items-center gap-1.5 rounded-full bg-admin-ink px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50">
            <Icono n="mas" className="h-4 w-4" /> Nuevo ticket
          </button>
        )}
      </header>

      {!activo ? (
        <p className="rounded-2xl border border-dashed border-admin-ink/20 bg-white p-8 text-center text-sm text-admin-ink-soft">El asistente todavía no está activado en esta tienda.</p>
      ) : error ? (
        <div className="rounded-2xl border border-admin-ink/10 bg-white p-6 text-sm">
          <b className="block">El asistente no está disponible ahora mismo</b>
          <span className="text-admin-ink-soft">{error}</span>
        </div>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Tickets">
            {VISTAS.map(([k, label]) => (
              <button key={k} role="tab" aria-selected={vista === k} onClick={() => { setFilas(null); setVista(k); }}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ${vista === k ? "bg-admin-ink text-white" : "border border-admin-ink/14 bg-white"}`}>
                {label}
              </button>
            ))}
          </div>
          {!filas ? (
            <div className="h-40 animate-pulse rounded-2xl bg-white" />
          ) : filas.length ? (
            <>
              <ul className="overflow-hidden rounded-2xl border border-admin-ink/10 bg-white">
                {filas.map((c) => <FilaTicket key={c.id} c={c} onMenu={setMenu} />)}
              </ul>
              <p className="text-center text-xs text-admin-muted">Mantén pulsado un ticket (o toca «⋯») para archivarlo o borrarlo.</p>
            </>
          ) : vista === "activas" ? (
            <section className="flex flex-col gap-4 rounded-2xl border border-admin-ink/10 bg-white p-5 md:p-6">
              <div>
                <h2 className="font-serif text-lg">Abre tu primer ticket</h2>
                <p className="text-sm text-admin-ink-soft">Elige qué quieres cambiar. No hace falta saber cómo se hace: te haré una o dos preguntas y te diré lo que recomiendo.</p>
              </div>
              <Inicios onElegir={nuevo} deshabilitado={creando} />
            </section>
          ) : (
            <p className="rounded-2xl border border-dashed border-admin-ink/20 bg-white p-8 text-center text-sm text-admin-ink-soft">
              {vista === "terminadas" ? "Todavía no hay tickets terminados. Cuando uno se publique aparecerá aquí." : "No hay tickets archivados."}
            </p>
          )}
        </>
      )}
      {menu && (
        <Hoja titulo={`Ticket #${menu.numero}`} sub={limpiarTitulo(menu.titulo)} onClose={() => setMenu(null)} onError={(m) => aviso.mostrar(m, "error")}
          acciones={accionesTicket(menu, () => setVuelta((x) => x + 1), aviso.mostrar, () => router.push(`/admin/asistente/${menu.id}`))} />
      )}
      {aviso.nodo}
    </div>
  );
}

export function Inicios({ onElegir, deshabilitado }: { onElegir: (texto: string) => void; deshabilitado?: boolean }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {INICIOS.map((i) => (
        <button key={i.label} disabled={deshabilitado} onClick={() => onElegir(i.texto)}
          className="flex items-center gap-3 rounded-xl border border-admin-ink/12 bg-admin-surface-soft px-3.5 py-3 text-left text-sm hover:border-admin-ink/30 disabled:opacity-50">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FBF3E4] text-admin-ink"><Icono n={i.icono} className="h-4 w-4" /></span>
          {i.label}
        </button>
      ))}
    </div>
  );
}
