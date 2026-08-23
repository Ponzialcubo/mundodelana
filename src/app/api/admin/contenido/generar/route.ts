import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import {
  CONTENT_BRAND_SYSTEM_PROMPT,
  CONTENT_FIELDS,
  CONTENT_OUTPUT_SCHEMA,
  buildCategoryContentPrompt,
  buildProductContentPrompt,
  type ContentField,
} from "@/lib/content-prompt";

export const maxDuration = 60;

function isContentField(value: unknown): value is ContentField {
  return typeof value === "string" && (CONTENT_FIELDS as readonly string[]).includes(value);
}

export async function POST(req: Request) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Falta ANTHROPIC_API_KEY en el entorno del servidor." },
      { status: 500 }
    );
  }

  const body = await req.json();
  const field = body.field;
  if (!isContentField(field)) {
    return NextResponse.json({ error: "Campo no admitido." }, { status: 400 });
  }

  const isCategoryField = field === "categoryMetaTitle" || field === "categoryMetaDescription";
  const prompt = isCategoryField
    ? buildCategoryContentPrompt(field, body.context ?? {})
    : buildProductContentPrompt(field, body.context ?? {});

  const client = new Anthropic();

  try {
    const message = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 1000,
      system: CONTENT_BRAND_SYSTEM_PROMPT,
      output_config: { format: { type: "json_schema", schema: CONTENT_OUTPUT_SCHEMA } },
      messages: [{ role: "user", content: prompt }],
    });

    if (message.stop_reason === "refusal") {
      return NextResponse.json(
        { error: "La IA no ha podido generar este texto. Prueba a rellenar más campos de contexto." },
        { status: 422 }
      );
    }

    const text = message.content.find((block) => block.type === "text");
    if (!text || text.type !== "text") {
      return NextResponse.json({ error: "La IA no ha devuelto texto." }, { status: 502 });
    }

    const parsed = JSON.parse(text.text) as { text: string };
    return NextResponse.json({ text: parsed.text });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "La API de Anthropic está saturada ahora mismo. Inténtalo en un minuto." },
        { status: 429 }
      );
    }
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: "La ANTHROPIC_API_KEY no es válida." }, { status: 500 });
    }
    console.error("Error generando contenido con Anthropic:", error);
    return NextResponse.json({ error: "No se ha podido generar el texto." }, { status: 502 });
  }
}
