// AI texts for the back office (product sheets, posts, image prompts…).
// They are written by the server's agent (agente.sergiolab.es) with its Claude subscription, so they don't spend
// API credits. Only if the agent is down, and IA_RESPALDO_API isn't "no", it falls back to the API with the
// cheapest model, so the owner is never stuck.
import Anthropic from "@anthropic-ai/sdk";

const URL_AGENTE = (process.env.AGENTE_URL || "").replace(/\/$/, "");
const KEY = process.env.AGENTE_KEY || "";
const MODELO_RESPALDO = "claude-haiku-5-5";

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

export const iaDisponible = () => !!(URL_AGENTE && KEY) || !!process.env.ANTHROPIC_API_KEY;

async function porAgente(p: Pedido, formato: "json" | "texto") {
  const r = await fetch(`${URL_AGENTE}/api/v1/herramientas/generar`, {
    method: "POST",
    headers: { authorization: `Bearer ${KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ ...p, modelo: p.modelo ?? "haiku", formato }),
    signal: AbortSignal.timeout(150_000),
    cache: "no-store",
  });
  const d = (await r.json().catch(() => ({}))) as { datos?: unknown; texto?: string; error?: string };
  if (r.status === 400) throw new IAError(d.error || "Faltan datos para la IA.", 400);
  if (!r.ok) throw new Error(d.error || `agente ${r.status}`);
  return d;
}

async function porApi(p: Pedido, formato: "json" | "texto") {
  const message = await new Anthropic().messages.create({
    model: MODELO_RESPALDO,
    max_tokens: 2000,
    system: p.sistema,
    ...(formato === "json" && p.esquema ? { output_config: { format: { type: "json_schema" as const, schema: p.esquema } } } : {}),
    messages: [
      {
        role: "user",
        content: [
          ...(p.imagenes ?? []).map((data) => ({ type: "image" as const, source: { type: "base64" as const, media_type: "image/jpeg" as const, data } })),
          { type: "text" as const, text: p.texto },
        ],
      },
    ],
  });
  const t = message.content.find((b) => b.type === "text");
  if (message.stop_reason === "refusal" || !t || t.type !== "text") throw new IAError("La IA no ha podido hacerlo. Prueba con otras indicaciones.", 422);
  return formato === "json" ? { datos: JSON.parse(t.text) } : { texto: t.text };
}

async function pedir(p: Pedido, formato: "json" | "texto") {
  if (URL_AGENTE && KEY) {
    try {
      return await porAgente(p, formato);
    } catch (e) {
      if (e instanceof IAError) throw e;
      if (!process.env.ANTHROPIC_API_KEY || process.env.IA_RESPALDO_API === "no") {
        throw new IAError("La IA está ocupada ahora mismo. Prueba en un minuto.", 503);
      }
      console.warn(`IA (${p.tarea}): el agente no respondió (${(e as Error).message}); uso la API de respaldo.`);
    }
  } else if (!process.env.ANTHROPIC_API_KEY) {
    throw new IAError("La IA no está configurada en este servidor.", 503);
  }
  try {
    return await porApi(p, formato);
  } catch (e) {
    if (e instanceof IAError) throw e;
    if (e instanceof Anthropic.RateLimitError) throw new IAError("La IA está saturada ahora mismo. Inténtalo en un minuto.", 429);
    throw new IAError("No se ha podido contactar con la IA. Prueba en un momento.", 502);
  }
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
