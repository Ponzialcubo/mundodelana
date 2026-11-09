// Bridge between the back office and the server's AI agent (agente.sergiolab.es).
// The browser never sees the agent key: every call goes through /api/admin/asistente, after the admin login.
const URL_AGENTE = (process.env.AGENTE_URL || "").replace(/\/$/, "");
const KEY = process.env.AGENTE_KEY || "";

export const asistenteActivo = () => !!(URL_AGENTE && KEY);

export function agente(path: string, init: RequestInit = {}, timeoutMs = 15_000) {
  return fetch(`${URL_AGENTE}/api/v1/asistente${path}`, {
    ...init,
    headers: { authorization: `Bearer ${KEY}`, "content-type": "application/json", ...(init.headers || {}) },
    signal: AbortSignal.timeout(timeoutMs),
    cache: "no-store",
  });
}

type Fila = { estado: string; valoracion: string | null; ultimo_rol?: string | null };

/** A ticket waits for the owner when the assistant spoke last, or when it finished and she hasn't said if it's right. */
export const esperaALaDuena = (c: Fila) =>
  (c.estado === "abierta" && c.ultimo_rol === "asistente") || ((c.estado === "hecha" || c.estado === "fallida") && !c.valoracion);

// Badge of the menu: cached briefly so the agent is not asked on every page of the panel.
let cache: { n: number; at: number } | null = null;
export async function ticketsQueEsperan(): Promise<number> {
  if (!asistenteActivo()) return 0;
  if (cache && Date.now() - cache.at < 20_000) return cache.n;
  try {
    const [activas, terminadas] = await Promise.all(
      ["activas", "terminadas"].map(async (v) => {
        const r = await agente(`/conversaciones?vista=${v}`, {}, 1500);
        return r.ok ? ((await r.json()) as Fila[]) : [];
      }),
    );
    const n = [...activas, ...terminadas].filter(esperaALaDuena).length;
    cache = { n, at: Date.now() };
    return n;
  } catch {
    return cache?.n ?? 0;
  }
}
