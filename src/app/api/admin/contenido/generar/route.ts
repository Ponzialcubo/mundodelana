import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { IAError, generarJson, iaDisponible } from "@/lib/ia";
import {
  CONTENT_BRAND_SYSTEM_PROMPT,
  CONTENT_FIELDS,
  CONTENT_OUTPUT_SCHEMA,
  buildCategoryContentPrompt,
  buildProductContentPrompt,
  type ContentField,
} from "@/lib/content-prompt";

export const maxDuration = 160;

function isContentField(value: unknown): value is ContentField {
  return typeof value === "string" && (CONTENT_FIELDS as readonly string[]).includes(value);
}

export async function POST(req: Request) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  if (!iaDisponible()) return NextResponse.json({ error: "La IA no está configurada en este servidor." }, { status: 503 });

  const body = await req.json();
  const field = body.field;
  if (!isContentField(field)) {
    return NextResponse.json({ error: "Campo no admitido." }, { status: 400 });
  }

  const isCategoryField = field.startsWith("category");
  const notes = typeof body.notes === "string" ? body.notes : undefined;
  const prompt = isCategoryField
    ? buildCategoryContentPrompt(field, body.context ?? {}, notes)
    : buildProductContentPrompt(field, body.context ?? {}, notes);

  try {
    const parsed = await generarJson<{ text: string }>({
      tarea: `texto-${field}`,
      modelo: "haiku",
      sistema: CONTENT_BRAND_SYSTEM_PROMPT,
      esquema: CONTENT_OUTPUT_SCHEMA as Record<string, unknown>,
      texto: prompt,
    });
    return NextResponse.json({ text: String(parsed.text ?? "").trim() });
  } catch (error) {
    if (error instanceof IAError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("Error generando contenido:", error);
    return NextResponse.json({ error: "No se ha podido generar el texto." }, { status: 502 });
  }
}
