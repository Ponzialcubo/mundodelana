"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ESTADO, Hoja, Icono, Texto, accionesTicket, api, fecha, limpiarTitulo, useAviso, type Detalle, type IconoNombre, type Msg } from "./comun";
import { Inicios } from "./AsistenteLista";
import { BarraProgreso, guardado, guardar } from "./Pildora";

const FASES: { k: string; label: string; icono: IconoNombre }[] = [
  { k: "en_cola", label: "En cola", icono: "reloj" },
  { k: "trabajando", label: "Haciendo el cambio", icono: "llave" },
  { k: "publicando", label: "Publicando", icono: "cohete" },
  { k: "hecho", label: "Publicado", icono: "ok" },
];

function Encargo({ m }: { m: Msg }) {
  const fallo = m.fase === "no_hecho";
  const idx = FASES.findIndex((f) => f.k === m.fase);
  return (
    <div className={`flex flex-col gap-2.5 rounded-2xl border p-4 ${fallo ? "border-[#E8C9C6] bg-[#FBF1F0]" : m.fase === "hecho" ? "border-[#CFDCC6] bg-[#F3F7EF]" : "border-admin-ink/10 bg-white"}`}>
      <div className="flex items-center gap-2 text-[15px]"><Icono n="llave" className="h-4 w-4" /><b className="font-medium">{m.texto}</b></div>
      {fallo ? (
        <p className="text-[13px] text-admin-ink-soft">No se completó. El motivo está abajo.</p>
      ) : (
        <ol className="flex flex-col gap-1.5">
          {FASES.map((f, i) => (
            <li key={f.k} className={`flex items-center gap-2 text-[13px] ${i < idx ? "text-[#4F6645]" : i === idx ? "font-medium text-admin-ink" : "text-admin-faint"}`}>
              <Icono n={i < idx ? "ok" : f.icono} className={`h-4 w-4 ${i === idx && f.k !== "hecho" ? "animate-pulse" : ""}`} />
              <span>{f.label}{f.k === "en_cola" && i === idx && m.en_cola_delante ? `, ${m.en_cola_delante} antes que el tuyo` : ""}</span>
            </li>
          ))}
        </ol>
      )}
      {!fallo && m.fase !== "hecho" && <BarraProgreso p={m.progreso} fase={m.fase} />}
      {m.detalle && !fallo && m.fase !== "hecho" && <p className="text-[13px] text-admin-ink-soft">{m.detalle}</p>}
    </div>
  );
}

const PASOS = ["Lo hablamos", "Propuesta", "En marcha", "Terminado"];
/** The four stages every ticket goes through, so the owner always knows where it is and that it ends. */
function Pasos({ paso, fallo }: { paso: number; fallo: boolean }) {
  return (
    <ol className="grid grid-cols-4 gap-1" aria-label="Fases del ticket">
      {PASOS.map((p, i) => {
        const n = i + 1;
        const hecho = n < paso || (n === 4 && paso === 4 && !fallo);
        const ahora = n === paso && !(n === 4 && !fallo);
        const mal = n === 4 && fallo && paso === 4;
        return (
          <li key={p} aria-current={ahora ? "step" : undefined} className="flex flex-col gap-1">
            <span className={`h-1 rounded-full ${mal ? "bg-admin-danger" : hecho ? "bg-[#9CAF88]" : ahora ? "bg-pink" : "bg-admin-ink/10"}`} />
            <span className={`truncate text-[11px] ${ahora || mal ? "font-medium text-admin-ink" : hecho ? "text-admin-ink-soft" : "text-admin-faint"}`}>{mal ? "No se pudo" : p}</span>
          </li>
        );
      })}
    </ol>
  );
}

const BOTON = "flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-medium disabled:opacity-50";
const PRINCIPAL = `${BOTON} bg-admin-ink text-white`;
const SECUNDARIO = `${BOTON} border border-admin-ink/14 bg-white`;

export function AsistenteChat({ id }: { id: number }) {
  const router = useRouter();
  const [d, setD] = useState<Detalle | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [texto, setTexto] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [corrigiendo, setCorrigiendo] = useState(false);
  const [menu, setMenu] = useState(false);
  const [motivo, setMotivo] = useState("");
  const ultimo = useRef(0);
  const caja = useRef<HTMLTextAreaElement>(null);
  const fin = useRef<HTMLDivElement>(null);
  const aviso = useAviso();

  const mezclar = (nuevos: Msg[], actualizados: Msg[] = []) => {
    if (!nuevos.length && !actualizados.length) return;
    setMsgs((cur) => {
      const mapa = new Map(cur.map((m) => [m.id, m]));
      for (const m of [...actualizados, ...nuevos]) mapa.set(m.id, m);
      return [...mapa.values()].sort((a, b) => a.id - b.id);
    });
    if (nuevos.length) {
      ultimo.current = Math.max(ultimo.current, ...nuevos.map((m) => m.id));
      setTimeout(() => fin.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 50);
    }
  };
  const cargar = async () => {
    const r = await api<Detalle>(`/conversaciones/${id}${ultimo.current ? `?desde=${ultimo.current}` : ""}`);
    setD(r);
    mezclar(r.mensajes, r.actualizados);
    return r;
  };

  useEffect(() => {
    let vivo = true, primera = true;
    let t: ReturnType<typeof setTimeout>;
    const ciclo = async () => {
      let rapido = false;
      try {
        const r = await cargar();
        rapido = r.pensando || r.estado === "enviada";
        primera = false;
      } catch (e) {
        if (primera) { aviso.mostrar((e as Error).message, "error"); router.replace("/admin/asistente"); return; }
      }
      if (vivo) t = setTimeout(ciclo, document.hidden ? 20_000 : rapido ? 2000 : 10_000);
    };
    ciclo();
    return () => { vivo = false; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the page remounts this component per ticket (key)
  }, [id]);
  useEffect(() => {
    const el = caja.current;
    if (el) { el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 160) + "px"; }
  }, [texto]);

  if (!d) return <div className="mx-auto w-full max-w-3xl p-5 md:p-8"><div className="h-60 animate-pulse rounded-2xl bg-white" /></div>;

  const fallar = (e: unknown) => aviso.mostrar((e as Error).message, "error");
  const nuevo = async (refId?: number) => {
    try { const c = await api<{ id: number }>("/conversaciones", { body: refId ? { ref_id: refId } : {} }); router.push(`/admin/asistente/${c.id}`); }
    catch (e) { fallar(e); }
  };
  const enviar = async (t = texto) => {
    if (!t.trim() || ocupado) return;
    setOcupado(true);
    try {
      // In a ticket that is already running, a new message opens a new ticket that keeps this one's context.
      const r = await api<{ conv?: number }>(`/conversaciones/${id}/mensajes`, { body: { texto: t } });
      if (t === texto) setTexto("");
      if (r.conv) { aviso.mostrar("Te he abierto un ticket nuevo con esa idea"); router.push(`/admin/asistente/${r.conv}`); } else await cargar();
    }
    catch (e) { fallar(e); }
    finally { setOcupado(false); }
  };
  const encargo = async () => {
    try { await api(`/conversaciones/${id}/encargo`, { method: "POST" }); await cargar(); } catch (e) { fallar(e); }
  };
  const resolver = async (m: Msg, accion: "confirmar" | "descartar") => {
    try { await api(`/conversaciones/${id}/propuestas/${m.id}/${accion}`, { method: "POST" }); await cargar(); if (accion === "descartar") caja.current?.focus(); }
    catch (e) { fallar(e); }
  };
  const aparte = async (m: Msg) => {
    try { const r = await api<{ id: number }>(`/conversaciones/${id}/aparte`, { body: { mensaje_id: m.id } }); router.push(`/admin/asistente/${r.id}`); }
    catch (e) { fallar(e); }
  };
  const valorar = async (conforme: boolean) => {
    try {
      const r = await api<{ id?: number }>(`/conversaciones/${id}/valorar`, { body: { conforme, motivo: conforme ? undefined : motivo } });
      if (conforme) { aviso.mostrar("Gracias. Ticket cerrado."); await cargar(); }
      else if (r.id) router.push(`/admin/asistente/${r.id}`);
    } catch (e) { fallar(e); }
  };

  const abierta = d.estado === "abierta";
  const ultimoAsis = [...msgs].reverse().find((m) => m.rol === "asistente" && m.tipo === "texto");
  const ultimoMsg = msgs[msgs.length - 1];
  const propuestaAbierta = msgs.some((m) => m.tipo === "propuesta" && m.estado === "propuesta");
  const hayDuena = msgs.some((m) => m.rol === "dueno");
  const listo = abierta && !d.pensando && !propuestaAbierta && ultimoAsis?.listo && ultimoMsg?.id === ultimoAsis.id;
  const opciones = abierta && !d.pensando && ultimoMsg && ultimoAsis && ultimoMsg.id === ultimoAsis.id ? ultimoAsis.opciones || [] : [];
  const terminado = d.estado === "hecha" || d.estado === "fallida";
  const paso = d.estado === "abierta" ? (propuestaAbierta ? 2 : 1) : d.estado === "enviada" ? 3 : 4;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col">
      <header className="sticky top-0 z-20 flex flex-col gap-2.5 border-b border-admin-ink/10 bg-admin-bg/95 px-4 pb-3 pt-[max(.75rem,env(safe-area-inset-top))] backdrop-blur md:px-8 md:pt-6">
        <div className="flex items-center gap-2">
          <Link href="/admin/asistente" aria-label="Volver a los tickets" className="-ml-1.5 rounded-full p-1.5 hover:bg-white"><Icono n="atras" /></Link>
          <div className="flex min-w-0 flex-1 flex-col">
            <b className="truncate text-[15px] font-medium"><span className="mr-1 font-mono text-xs text-admin-ink-soft">#{d.numero}</span>{limpiarTitulo(d.titulo)}</b>
            <small className="text-xs text-admin-ink-soft">Ticket {ESTADO[d.estado]?.label.toLowerCase()}</small>
          </div>
          <button onClick={() => { guardar("chat-plegado", String(id)); router.push(guardado("pantalla") || "/admin"); }} aria-label="Plegar el chat" title="Plegar: vuelve a donde estabas; el chat queda abajo"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-admin-ink/14 bg-white">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
          </button>
          <button onClick={() => nuevo()} className="flex shrink-0 items-center gap-1 rounded-full border border-admin-ink/14 bg-white px-3 py-1.5 text-xs font-medium">
            <Icono n="mas" className="h-3.5 w-3.5" /> Nuevo
          </button>
          <button onClick={() => setMenu(true)} aria-label="Más acciones del ticket" className="rounded-full p-1.5 hover:bg-white"><Icono n="puntos" /></button>
        </div>
        <Pasos paso={paso} fallo={d.estado === "fallida"} />
      </header>

      <div className="flex flex-1 flex-col gap-3 px-4 py-4 md:px-8">
        {d.ref && (
          <Link href={`/admin/asistente/${d.ref.id}`} className="flex items-center gap-2 self-start rounded-full bg-[#FBF3E4] px-3 py-1.5 text-[13px]">
            <Icono n="corregir" className="h-4 w-4" /> Corrige el ticket #{d.ref.numero} «{limpiarTitulo(d.ref.titulo)}»
          </Link>
        )}
        {d.viene_de && (
          <Link href={`/admin/asistente/${d.viene_de.id}`} className="flex items-center gap-2 self-start rounded-full bg-[#FBF3E4] px-3 py-1.5 text-[13px]">
            <Icono n="corregir" className="h-4 w-4" /> Sale del ticket #{d.viene_de.numero} «{limpiarTitulo(d.viene_de.titulo)}»
          </Link>
        )}
        <ol className="flex flex-col gap-3" aria-live="polite">
          {!msgs.some((m) => m.rol !== "sistema") && (
            <li className="flex flex-col gap-3 rounded-2xl border border-admin-ink/10 bg-white p-4">
              <p className="text-sm">Ticket #{d.numero} abierto. Cuéntame qué quieres cambiar, como se lo dirías a una persona, o elige una opción.</p>
              <Inicios onElegir={(t) => enviar(t)} deshabilitado={ocupado} />
            </li>
          )}
          {msgs.map((m) => {
            if (m.rol === "sistema") return <li key={m.id} className="self-center px-4 text-center text-xs text-admin-muted">{m.texto}</li>;
            if (m.tipo === "encargo") return <li key={m.id}><Encargo m={m} /></li>;
            if (m.tipo === "resultado")
              return (
                <li key={m.id} className={`flex flex-col gap-2 rounded-2xl border p-4 text-sm ${m.ok ? "border-[#CFDCC6] bg-[#F3F7EF]" : "border-[#E8C9C6] bg-[#FBF1F0]"}`}>
                  <div className="flex items-center gap-2"><Icono n={m.ok ? "ok" : "aviso"} className="h-4 w-4" /><b className="font-medium">{m.ok ? "Publicado" : "No se pudo hacer"}</b></div>
                  <Texto t={m.texto} />
                  <time className="text-xs text-admin-muted">{fecha(m.creado)}</time>
                </li>
              );
            if (m.tipo === "propuesta")
              return (
                <li key={m.id} className={`flex flex-col gap-3 rounded-2xl border p-4 text-sm ${m.viable ? "border-pink bg-white" : "border-[#E8C9C6] bg-[#FBF1F0]"}`}>
                  <div className="flex items-center gap-2"><Icono n="llave" className="h-4 w-4" /><b className="font-medium">{m.viable ? "Propuesta: esto es lo que voy a hacer" : "Así no se puede"}</b></div>
                  <Texto t={m.texto} />
                  {m.estado === "propuesta" && abierta && (m.viable ? (
                    <div className="flex flex-wrap gap-2">
                      <button className={PRINCIPAL} onClick={() => resolver(m, "confirmar")}><Icono n="ok" className="h-4 w-4" /> Sí, hazlo y publícalo</button>
                      <button className={SECUNDARIO} onClick={() => resolver(m, "descartar")}><Icono n="x" className="h-4 w-4" /> Cambiar algo</button>
                    </div>
                  ) : (
                    <button className={`${SECUNDARIO} self-start`} onClick={() => resolver(m, "descartar")}>Entendido</button>
                  ))}
                  {m.estado === "confirmada" && <p className="flex items-center gap-1 text-[13px] text-[#4F6645]"><Icono n="ok" className="h-3.5 w-3.5" /> Aceptada</p>}
                  {m.estado === "descartada" && <p className="text-[13px] text-admin-muted">Descartada</p>}
                </li>
              );
            const mia = m.rol === "dueno";
            return (
              <li key={m.id} className={`flex max-w-[86%] flex-col gap-1 ${mia ? "items-end self-end" : "items-start self-start"}`}>
                <div className={`rounded-2xl px-3.5 py-2.5 text-[15px] leading-snug ${mia ? "rounded-br-md bg-admin-ink text-white" : "rounded-bl-md border border-admin-ink/10 bg-white"}`}><Texto t={m.texto} /></div>
                <time className="px-1 text-[11px] text-admin-muted">{fecha(m.creado)}</time>
                {m.aparte && (
                  <div className="mt-1 flex flex-col gap-2 rounded-2xl border border-admin-ink/10 bg-white p-3 text-sm">
                    <b className="font-medium">Idea para otro ticket: {m.aparte.titulo}</b>
                    {m.aparte.conv
                      ? <Link href={`/admin/asistente/${m.aparte.conv.id}`} className={`${SECUNDARIO} self-start`}>Ver el ticket #{m.aparte.conv.numero}</Link>
                      : <button className={`${SECUNDARIO} self-start`} onClick={() => aparte(m)}><Icono n="mas" className="h-4 w-4" /> Abrir aparte</button>}
                  </div>
                )}
              </li>
            );
          })}
          {d.pensando && (
            <li className="flex items-center gap-2 self-start rounded-2xl rounded-bl-md border border-admin-ink/10 bg-white px-3.5 py-3" aria-label="El asistente está escribiendo">
              {[0, 1, 2].map((i) => <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-admin-muted" style={{ animationDelay: `${i * 150}ms` }} />)}
              {d.preparando_propuesta && <em className="ml-1 text-[13px] text-admin-ink-soft">Preparando la propuesta</em>}
            </li>
          )}
        </ol>
        <div ref={fin} />
      </div>

      <div className="sticky bottom-0 z-20 flex flex-col gap-2.5 border-t border-admin-ink/10 bg-admin-bg/95 px-4 pt-3 pb-[max(.75rem,env(safe-area-inset-bottom))] backdrop-blur md:px-8 md:pb-5">
        {opciones.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {opciones.map((o) => (
              <button key={o} disabled={ocupado} onClick={() => enviar(o)} className="rounded-full border border-pink bg-white px-3.5 py-1.5 text-sm disabled:opacity-50">{o}</button>
            ))}
          </div>
        )}
        {listo && (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-3.5 py-2.5">
            <span className="text-sm">Ya está claro.</span>
            <button className={PRINCIPAL} onClick={encargo}><Icono n="cohete" className="h-4 w-4" /> Preparar propuesta</button>
          </div>
        )}
        {abierta && (
          <>
            <form className="flex items-end gap-2" onSubmit={(e) => { e.preventDefault(); enviar(); }}>
              <textarea ref={caja} rows={1} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escribe aquí" aria-label="Mensaje para el asistente" maxLength={4000}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && matchMedia("(pointer: fine)").matches) { e.preventDefault(); enviar(); } }}
                className="min-h-[44px] flex-1 resize-none rounded-2xl border border-admin-ink/14 bg-white px-4 py-2.5 text-[16px] outline-none focus:border-admin-ink/40 md:text-sm" />
              <button disabled={ocupado || !texto.trim()} aria-label="Enviar" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-admin-ink text-white disabled:opacity-40"><Icono n="enviar" /></button>
            </form>
            {hayDuena && !listo && !d.pensando && !propuestaAbierta && (
              <button onClick={encargo} className="self-center text-[13px] text-admin-link underline-offset-2 hover:underline">¿Ya lo tienes claro? Preparar la propuesta</button>
            )}
          </>
        )}
        {d.estado === "enviada" && (
          <>
            <p className="text-center text-[13px] text-admin-ink-soft">Ticket #{d.numero} en marcha. No hace falta que esperes aquí: cuando esté publicado lo verás en tu lista de tickets. ¿Otra idea? Escríbela y te abro un ticket nuevo.</p>
            <form className="flex items-end gap-2" onSubmit={(e) => { e.preventDefault(); enviar(); }}>
              <textarea ref={caja} rows={1} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Otra idea (irá a un ticket nuevo)" aria-label="Otra idea para un ticket nuevo" maxLength={4000}
                className="min-h-[44px] flex-1 resize-none rounded-2xl border border-admin-ink/14 bg-white px-4 py-2.5 text-[16px] outline-none focus:border-admin-ink/40 md:text-sm" />
              <button disabled={ocupado || !texto.trim()} aria-label="Enviar" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-admin-ink text-white disabled:opacity-40"><Icono n="enviar" /></button>
            </form>
          </>
        )}
        {terminado && !d.valoracion && !corrigiendo && (
          <div className="flex flex-col gap-2">
            <span className="text-sm">{d.estado === "hecha" ? "¿Ha quedado como querías?" : "¿Lo intentamos de otra forma?"}</span>
            <div className="flex flex-wrap gap-2">
              {d.estado === "hecha" && <button className={PRINCIPAL} onClick={() => valorar(true)}><Icono n="ok" className="h-4 w-4" /> Sí, perfecto</button>}
              <button className={SECUNDARIO} onClick={() => setCorrigiendo(true)}>{d.estado === "hecha" ? "No, corregirlo" : "Abrir una corrección"}</button>
            </div>
          </div>
        )}
        {corrigiendo && (
          <form className="flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); valorar(false); }}>
            <label className="flex flex-col gap-1.5 text-sm">
              <span>¿Qué no te convence?</span>
              <textarea rows={2} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Por ejemplo: el texto se ve demasiado pequeño en el móvil" autoFocus
                className="rounded-xl border border-admin-ink/14 bg-white px-3.5 py-2.5 text-[16px] outline-none focus:border-admin-ink/40 md:text-sm" />
            </label>
            <div className="flex gap-2">
              <button className={PRINCIPAL} disabled={!motivo.trim()}>Abrir corrección</button>
              <button type="button" className="px-3 text-sm text-admin-link" onClick={() => setCorrigiendo(false)}>Cancelar</button>
            </div>
          </form>
        )}
        {terminado && d.valoracion === "conforme" && (
          <p className="flex flex-wrap items-center justify-center gap-1 text-[13px] text-admin-ink-soft">
            <Icono n="ok" className="h-3.5 w-3.5" /> Ticket #{d.numero} cerrado.
            <button className="text-admin-link" onClick={() => nuevo(id)}>Abrir una corrección</button>
          </p>
        )}
        {terminado && d.valoracion && (
          <button className={SECUNDARIO} onClick={() => nuevo()}><Icono n="mas" className="h-4 w-4" /> Abrir otro ticket</button>
        )}
      </div>

      {menu && (
        <Hoja titulo={`Ticket #${d.numero}`} sub={limpiarTitulo(d.titulo)} onClose={() => setMenu(false)} onError={(m) => aviso.mostrar(m, "error")}
          acciones={accionesTicket(d, () => router.push("/admin/asistente"), aviso.mostrar)} />
      )}
      {aviso.nodo}
    </div>
  );
}
