import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";

export const maxDuration = 60;

const SYSTEM_PROMPT = `Ayudas a Elvira, de Mundolana (crochet y amigurumis hechos a mano en Galicia), a pedir imágenes a ChatGPT o Gemini.

Recibes un prompt base ya probado y una idea corta de Elvira. Reescribe el prompt para que la imagen refleje su idea:
- Mantén todo lo que el prompt base exige (formato y medidas, estilo de marca, espacio libre para texto, "sin texto ni logos", y si pide no cambiar la pieza, eso sigue siendo lo más importante).
- Integra la idea de forma concreta y visual: escena, objetos, colores, luz, composición. Si la idea contradice el formato o el estilo, adáptala sin romperlos.
- Español de España, claro y directo, en el mismo esquema por apartados del prompt base. Sin introducciones ni explicaciones: devuelve solo el prompt final.`;

/** Rewrites a ready-made image prompt around a short idea from the owner. */
export async function POST(req: Request) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "Falta ANTHROPIC_API_KEY en el entorno del servidor." }, { status: 500 });
  }

  const { prompt, idea } = (await req.json()) as { prompt?: string; idea?: string };
  if (!prompt?.trim() || !idea?.trim() || prompt.length > 8000 || idea.length > 1000) {
    return NextResponse.json({ error: "Escribe tu idea primero." }, { status: 400 });
  }

  try {
    const message = await new Anthropic().messages.create({
      model: "claude-opus-5-5",
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
      output_config: { effort: "low" },
      messages: [{ role: "user", content: `PROMPT BASE:\n${prompt}\n\nIDEA DE ELVIRA:\n${idea}` }],
    });
    const text = message.content.find((block) => block.type === "text");
    if (message.stop_reason === "refusal" || !text || text.type !== "text") {
      return NextResponse.json({ error: "La IA no ha podido reescribirlo. Usa el prompt con tu idea añadida al final." }, { status: 422 });
    }
    return NextResponse.json({ prompt: text.text.trim() });
  } catch {
    return NextResponse.json({ error: "No se ha podido contactar con la IA. Prueba en un momento." }, { status: 502 });
  }
}
