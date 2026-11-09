// AI texts for the back office (product sheets, posts, image prompts…).
// They are written ONLY by the server's agent (agente.sergiolab.es) with its Claude subscription.
// There is deliberately no fallback to the paid Anthropic API: if the agent is down, the owner gets a clear
// "try again in a minute" and the failure is logged by the agent to be reviewed.
const URL_AGENTE = (process.env.AGENTE_URL || "").replace(/\/$/, "");
const KEY = process.env.AGENTE_KEY || "";

export type Modelo = "haiku" | "sonnet";
type Pedido = {
  /** Short name of the job, for the agent's usage panel (e.g. "ficha-producto"). */
  tarea: string;
  sistema: string;
  texto: string;
  /** JPEG photos in base64 (max 4). Keep them small: every pixel costs tokens. */
  imagenes?: string[];
  /** haiku for short or simple texts; sonnet only where quality really shows. */
  modelo?: Modelo;
  esquema?: Record<string, unknown>;
};

export class IAError extends Error {
  constructor(message: string, public status = 502) {
    super(message);
  }
}

export const iaDisponible = () => !!(URL_AGENTE && KEY);

async function pedir(p: Pedido, formato: "json" | "texto") {
  if (!iaDisponible()) throw new IAError("La IA no está configurada en este servidor.", 503);
  let r: Response;
  try {
    r = await fetch(`${URL_AGENTE}/api/v1/herramientas/generar`, {
      method: "POST",
      headers: { authorization: `Bearer ${KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ ...p, modelo: p.modelo ?? "haiku", formato }),
      signal: AbortSignal.timeout(150_000),
      cache: "no-store",
    });
  } catch {
    throw new IAError("La IA no responde ahora mismo. Prueba en un minuto.", 503);
  }
  const d = (await r.json().catch(() => ({}))) as { datos?: unknown; texto?: string; error?: string };
  if (r.status === 400) throw new IAError(d.error || "Faltan datos para la IA.", 400);
  if (!r.ok) throw new IAError("La IA está ocupada ahora mismo. Prueba en un minuto.", 503);
  return d;
}

export async function generarJson<T>(p: Pedido): Promise<T> {
  const d = await pedir(p, "json");
  if (!d.datos || typeof d.datos !== "object") throw new IAError("La IA no ha devuelto lo esperado. Inténtalo de nuevo.");
  return d.datos as T;
}

export async function generarTexto(p: Pedido): Promise<string> {
  const d = await pedir(p, "texto");
  const t = String(d.texto ?? "").trim();
  if (!t) throw new IAError("La IA no ha devuelto texto. Inténtalo de nuevo.");
  return t;
}
