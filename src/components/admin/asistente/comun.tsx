"use client";

import { Fragment, useCallback, useEffect, useRef, useState, type ReactNode } from "react";

export type Estado = "abierta" | "enviada" | "hecha" | "fallida" | "archivada";
export type Conv = {
  id: number; numero: number; ref_numero: number | null; titulo: string; estado: Estado; valoracion: string | null;
  actualizada: string; ultimo: string | null; ultimo_rol?: string | null; ref_titulo: string | null; viene_de_numero?: number | null;
};
export type Msg = {
  id: number; rol: "dueno" | "asistente" | "sistema"; tipo: "texto" | "propuesta" | "encargo" | "resultado"; texto: string; creado: string;
  opciones?: string[]; listo?: boolean; aparte?: { titulo: string; idea: string; conv: { id: number; numero: number } | null } | null; estado?: string; viable?: boolean; ok?: boolean; fase?: string; detalle?: string | null; en_cola_delante?: number;
};
export type Detalle = {
  id: number; numero: number; titulo: string; estado: Estado; valoracion: string | null; ref: { id: number; numero: number; titulo: string } | null;
  viene_de?: { id: number; numero: number; titulo: string } | null;
  pensando: boolean; preparando_propuesta: boolean; mensajes: Msg[]; actualizados: Msg[];
};

/** Calls the agent through the panel's own API (the key stays on the server). */
export async function api<T = unknown>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const conCuerpo = opts.body !== undefined;
  let r: Response;
  try {
    r = await fetch(`/api/admin/asistente${path}`, {
      method: opts.method || (conCuerpo ? "POST" : "GET"),
      headers: conCuerpo ? { "Content-Type": "application/json" } : undefined,
      body: conCuerpo ? JSON.stringify(opts.body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new Error("Sin conexión. Revisa internet y prueba otra vez.");
  }
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((d as { error?: string }).error || "No se pudo completar. Prueba otra vez.");
  return d as T;
}

export const ESTADO: Record<Estado, { label: string; cls: string }> = {
  abierta: { label: "Abierto", cls: "bg-[#F1E4E5] text-[#7A4E52]" },
  enviada: { label: "En marcha", cls: "bg-[#F6E7D3] text-[#7A5A2E]" },
  hecha: { label: "Terminado", cls: "bg-[#E3EADB] text-[#4F6645]" },
  fallida: { label: "No se pudo hacer", cls: "bg-[#F3DEDC] text-[#8A3F3A]" },
  archivada: { label: "Archivado", cls: "bg-[#EDEBE8] text-[#8B837F]" },
};

/** Agent dates come in UTC as "YYYY-MM-DD HH:MM:SS". Today shows the time; other days, the date. */
export function fecha(s: string) {
  const d = new Date(s.replace(" ", "T") + "Z");
  if (isNaN(+d)) return "";
  const hoy = new Date();
  return d.toDateString() === hoy.toDateString()
    ? d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export const limpiarTitulo = (t: string) => t.replace(/^Corrección: /, "");

export const INICIOS: { icono: IconoNombre; label: string; texto: string }[] = [
  { icono: "texto", label: "Cambiar textos de la web", texto: "Quiero cambiar textos de la web: la portada, «Sobre mí», «Cómo funciona» o el pie." },
  { icono: "estrella", label: "Destacar una novedad o temporada", texto: "Quiero destacar una novedad, una colección o una temporada en la portada." },
  { icono: "paleta", label: "Cambiar colores o estilo", texto: "Quiero cambiar los colores o el estilo de la web." },
  { icono: "ficha", label: "Mejorar las fichas de producto", texto: "Quiero mejorar cómo se ven las fichas de los productos." },
  { icono: "mas", label: "Añadir algo nuevo", texto: "Quiero añadir una sección o una función nueva a la web o a este panel." },
  { icono: "aviso", label: "Algo no funciona bien", texto: "Algo de la web o del panel no funciona como debería." },
];

const P: Record<string, ReactNode> = {
  texto: <path d="M5 6h14M5 12h10M5 18h7" />,
  estrella: <path d="m12 4 2.3 4.8 5.2.7-3.8 3.6.9 5.2L12 15.8l-4.6 2.5.9-5.2-3.8-3.6 5.2-.7z" />,
  paleta: <path d="M12 4a8 8 0 1 0 0 16c1.1 0 1.6-.8 1.2-1.7-.5-1 .2-2.3 1.4-2.3H17a3 3 0 0 0 3-3c0-5-3.6-9-8-9ZM8 11h.01M11 8h.01M15 8.5h.01" />,
  ficha: <path d="M6 4h12v16H6zM9 8h6M9 12h6M9 16h3" />,
  mas: <path d="M12 5v14M5 12h14" />,
  aviso: <path d="M12 4 3 20h18L12 4ZM12 10v4M12 17h.01" />,
  enviar: <path d="M4 12 20 4l-6 16-3-7z" />,
  atras: <path d="M15 5 8 12l7 7" />,
  puntos: <path d="M6 12h.01M12 12h.01M18 12h.01" />,
  ok: <path d="m5 12 4.5 4.5L19 7" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  reloj: <path d="M12 7v5l3 2M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Z" />,
  llave: <path d="M14.5 6.5a4 4 0 0 0-5.3 5.3L4 17v3h3l5.2-5.2a4 4 0 0 0 5.3-5.3l-2.5 2.5-2.5-2.5z" />,
  cohete: <path d="M12 15l-3-3c1.5-4.5 4.5-7.5 10-8-.5 5.5-3.5 8.5-8 10ZM9 12l-3.5.5L4 16l3.5-.5M12 15l-.5 3.5L15 20l-.5-3.5" />,
  archivar: <path d="M4 7h16v3H4zM6 10v9h12v-9M10 14h4" />,
  papelera: <path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12" />,
  abrir: <path d="M4 7h6l2 2h8v9H4z" />,
  corregir: <path d="M7 5v6a3 3 0 0 0 3 3h9M15 10l4 4-4 4" />,
};
export type IconoNombre = keyof typeof P;
export function Icono({ n, className = "h-[18px] w-[18px]" }: { n: IconoNombre; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {P[n]}
    </svg>
  );
}

/** Safe minimal formatting: paragraphs, bullet lists and **bold**. */
export function Texto({ t }: { t: string }) {
  const negrita = (l: string) =>
    l.split(/(\*\*[^*]+\*\*)/g).map((p, i) => (p.startsWith("**") && p.endsWith("**") ? <b key={i}>{p.slice(2, -2)}</b> : <Fragment key={i}>{p}</Fragment>));
  const out: ReactNode[] = [];
  let lista: string[] = [];
  const cerrar = () => {
    if (lista.length) {
      out.push(<ul key={out.length} className="ml-4 list-disc space-y-0.5">{lista.map((l, i) => <li key={i}>{negrita(l)}</li>)}</ul>);
      lista = [];
    }
  };
  for (const linea of t.split("\n")) {
    const m = linea.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/);
    if (m) { lista.push(m[1]); continue; }
    cerrar();
    if (linea.trim()) out.push(<p key={out.length}>{negrita(linea.replace(/^#+\s*/, ""))}</p>);
  }
  cerrar();
  return <div className="flex flex-col gap-1.5 break-words">{out}</div>;
}

type Aviso = { texto: string; tipo: "ok" | "error"; accion?: { label: string; run: () => void } };
/** Small notice at the bottom of the screen, with an optional «Deshacer». */
export function useAviso() {
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  const mostrar = useCallback((texto: string, tipo: "ok" | "error" = "ok", accion?: Aviso["accion"]) => {
    clearTimeout(t.current);
    setAviso({ texto, tipo, accion });
    t.current = setTimeout(() => setAviso(null), accion ? 7000 : 4000);
  }, []);
  useEffect(() => () => clearTimeout(t.current), []);
  const nodo = aviso && (
    <div role="status" className="fixed inset-x-3 bottom-[calc(76px+env(safe-area-inset-bottom))] z-50 mx-auto flex max-w-md items-center gap-3 rounded-xl bg-admin-ink px-4 py-3 text-sm text-white shadow-lg md:bottom-6">
      <span className="flex-1">{aviso.texto}</span>
      {aviso.accion && (
        <button className="font-medium text-pink" onClick={() => { aviso.accion!.run(); setAviso(null); }}>{aviso.accion.label}</button>
      )}
    </div>
  );
  return { mostrar, nodo };
}

export type Accion = { label: string; icono: IconoNombre; run: () => Promise<void> | void; peligro?: boolean; confirmar?: string; deshabilitada?: string };

/** Bottom sheet on phones, centred card on desktop. */
export function Hoja({ titulo, sub, acciones, onClose, onError }: { titulo: string; sub?: string; acciones: Accion[]; onClose: () => void; onError: (m: string) => void }) {
  const [confirmando, setConfirmando] = useState<Accion | null>(null);
  const [ocupado, setOcupado] = useState(false);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);
  const ejecutar = async (a: Accion) => {
    if (a.confirmar && confirmando !== a) return setConfirmando(a);
    setOcupado(true);
    try { await a.run(); onClose(); } catch (e) { onError((e as Error).message); setOcupado(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 md:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={titulo} onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-2xl bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-xl md:rounded-2xl md:pb-4">
        <div className="mb-2 px-1">
          <b className="block text-[15px]">{titulo}</b>
          {sub && <span className="block truncate text-[13px] text-admin-ink-soft">{sub}</span>}
        </div>
        {confirmando ? (
          <div className="flex flex-col gap-3 px-1 pt-1">
            <p className="text-sm text-admin-ink-soft">{confirmando.confirmar}</p>
            <div className="flex gap-2">
              <button disabled={ocupado} onClick={() => ejecutar(confirmando)} className="rounded-full bg-admin-danger px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50">{confirmando.label}</button>
              <button onClick={() => setConfirmando(null)} className="rounded-full border border-admin-ink/14 px-5 py-2.5 text-sm">Cancelar</button>
            </div>
          </div>
        ) : (
          <ul className="flex flex-col">
            {acciones.map((a) => (
              <li key={a.label}>
                <button disabled={!!a.deshabilitada || ocupado} onClick={() => ejecutar(a)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] hover:bg-admin-bg disabled:opacity-45 ${a.peligro ? "text-admin-danger" : ""}`}>
                  <Icono n={a.icono} />
                  <span className="flex flex-col">
                    {a.label}
                    {a.deshabilitada && <small className="text-xs text-admin-muted">{a.deshabilitada}</small>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** Actions on a ticket, the same from the list and from inside the chat. Deleting can be undone. */
export function accionesTicket(
  t: { id: number; numero: number; estado: Estado },
  hecho: () => void,
  aviso: ReturnType<typeof useAviso>["mostrar"],
  abrir?: () => void,
): Accion[] {
  const enMarcha = t.estado === "enviada";
  return [
    ...(abrir ? [{ label: "Abrir el ticket", icono: "abrir" as const, run: abrir }] : []),
    {
      label: t.estado === "archivada" ? "Recuperar de archivados" : "Archivar",
      icono: "archivar",
      deshabilitada: enMarcha ? "No se puede mientras está en marcha" : undefined,
      run: async () => {
        await api(`/conversaciones/${t.id}`, { method: "PATCH", body: { estado: t.estado === "archivada" ? "abierta" : "archivada" } });
        aviso(t.estado === "archivada" ? `Ticket #${t.numero} recuperado` : `Ticket #${t.numero} archivado`);
        hecho();
      },
    },
    {
      label: "Borrar el ticket",
      icono: "papelera",
      peligro: true,
      confirmar: enMarcha
        ? `El ticket #${t.numero} está en cola. Si lo borras, se cancela y no se aplicará el cambio.`
        : `Se quitará el ticket #${t.numero} de tu lista. Podrás deshacerlo justo después.`,
      run: async () => {
        await api(`/conversaciones/${t.id}`, { method: "DELETE" });
        hecho();
        aviso(`Ticket #${t.numero} borrado`, "ok", {
          label: "Deshacer",
          run: () => { api(`/conversaciones/${t.id}/restaurar`, { method: "POST" }).then(hecho).catch((e) => aviso((e as Error).message, "error")); },
        });
      },
    },
  ];
}

/** Long press on touch screens opens the actions, like in the phone's own apps. */
export function usePulsacionLarga(fn: () => void) {
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lanzado = useRef(false);
  const parar = () => clearTimeout(t.current);
  return {
    onTouchStart: () => { lanzado.current = false; t.current = setTimeout(() => { lanzado.current = true; navigator.vibrate?.(15); fn(); }, 500); },
    onTouchEnd: parar,
    onTouchMove: parar,
    onContextMenu: (e: React.MouseEvent) => { e.preventDefault(); fn(); },
    onClickCapture: (e: React.MouseEvent) => { if (lanzado.current) { e.preventDefault(); e.stopPropagation(); lanzado.current = false; } },
  };
}
