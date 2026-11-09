import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";
import { UPLOADS_DIR } from "@/lib/uploads";
import { BRAND_VOICE } from "@/lib/content-prompt";
import { IAError, generarJson, iaDisponible } from "@/lib/ia";

export const maxDuration = 160;

const MAX_PHOTOS = 4;

const SYSTEM_PROMPT = `Eres quien redacta las fichas del catálogo de Mundolana, una marca gallega de crochet artesanal.

${BRAND_VOICE}

Vas a ver las fotos de UNA pieza de crochet y debes rellenar su ficha completa a partir de lo que se ve:
- name: nombre corto y claro de la pieza, como lo diría Elvira (por ejemplo "Osito Lucas", "Tortuga marina", "Diadema de flores"). Sin la palabra "amigurumi" salvo que ayude a entender qué es.
- shortDescription: una sola línea (hasta ~90 caracteres) para la tarjeta del catálogo.
- description: 2 a 4 frases para la ficha: qué es, detalles visibles (colores, accesorios, acabado) y para quién o qué ocasión encaja.
- materials: un material por línea. Solo lo que se puede afirmar con seguridad; si no sabes la marca del hilo, pon "Algodón" a secas. Incluye "Relleno antialérgico" solo si es un muñeco relleno.
- categories: elige de la lista que te doy la categoría o categorías que encajan (normalmente una). Si ninguna encaja, deja la lista vacía.
- metaTitle: título para Google, hasta 60 caracteres.
- metaDescription: descripción para Google, hasta 155 caracteres.

Describe solo lo que se ve en las fotos y lo que te indiquen las notas. No inventes tamaños, plazos ni precios.`;

function outputSchema(categoryNames: string[]) {
  return {
    type: "object",
    properties: {
      name: { type: "string" },
      shortDescription: { type: "string" },
      description: { type: "string" },
      materials: { type: "string" },
      categories: { type: "array", items: { type: "string", enum: categoryNames.length ? categoryNames : ["-"] } },
      metaTitle: { type: "string" },
      metaDescription: { type: "string" },
    },
    required: ["name", "shortDescription", "description", "materials", "categories", "metaTitle", "metaDescription"],
    additionalProperties: false,
  };
}

/** Loads an already-uploaded photo and shrinks it: 768px is plenty to recognise a piece and costs about half the tokens of 1024px. */
async function loadPhoto(url: string): Promise<string> {
  // basename() keeps the read inside the uploads volume whatever the client sends.
  const file = await readFile(path.join(UPLOADS_DIR, path.basename(url)));
  const jpeg = await sharp(file).rotate().resize({ width: 768, height: 768, fit: "inside" }).jpeg({ quality: 75 }).toBuffer();
  return jpeg.toString("base64");
}

/**
 * Fills a whole product sheet (name, texts, materials, category, SEO) from its
 * photos, so the owner only has to check it and set the price.
 */
export async function POST(req: Request) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  if (!iaDisponible()) return NextResponse.json({ error: "La IA no está configurada en este servidor." }, { status: 503 });

  const body = (await req.json()) as { imageUrls?: string[]; notes?: string };
  const imageUrls = (body.imageUrls ?? []).filter((u) => typeof u === "string" && u.startsWith("/uploads/")).slice(0, MAX_PHOTOS);
  if (imageUrls.length === 0) {
    return NextResponse.json({ error: "Sube al menos una foto primero." }, { status: 400 });
  }

  const categories = await prisma.category.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } });

  let photos: string[];
  try {
    photos = await Promise.all(imageUrls.map(loadPhoto));
  } catch {
    return NextResponse.json({ error: "No se han podido leer las fotos." }, { status: 400 });
  }

  const notes = body.notes?.trim();
  const categoryNames = categories.map((c) => c.name);

  try {
    const result = await generarJson<{
      name: string;
      shortDescription: string;
      description: string;
      materials: string;
      categories: string[];
      metaTitle: string;
      metaDescription: string;
    }>({
      tarea: "ficha-producto",
      // Seeing the piece and writing the whole sheet is where quality shows: sonnet. Everything else uses haiku.
      modelo: "sonnet",
      sistema: SYSTEM_PROMPT,
      esquema: outputSchema(categoryNames),
      imagenes: photos,
      texto: [
        `Categorías disponibles: ${categoryNames.join(", ") || "ninguna"}.`,
        notes ? `Notas de Elvira: ${notes}` : "",
        "Rellena la ficha de esta pieza.",
      ]
        .filter(Boolean)
        .join("\n"),
    });
    const elegidas = Array.isArray(result.categories) ? result.categories : [];
    return NextResponse.json({
      ...result,
      categories: elegidas,
      categoryIds: categories.filter((c) => elegidas.includes(c.name)).map((c) => c.id),
    });
  } catch (err) {
    const status = err instanceof IAError ? err.status : 500;
    return NextResponse.json({ error: err instanceof IAError ? err.message : "No se ha podido generar la ficha." }, { status });
  }
}
