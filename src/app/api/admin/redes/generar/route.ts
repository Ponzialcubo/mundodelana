import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";
import { BRAND_SYSTEM_PROMPT, OUTPUT_SCHEMA, buildUserPrompt } from "@/lib/social-prompt";

export const maxDuration = 120;

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
  const productId: string | undefined = body.productId;
  if (!productId) return NextResponse.json({ error: "Falta el producto" }, { status: 400 });

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { categories: true },
  });
  if (!product) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });

  const prompt = buildUserPrompt(
    {
      name: product.name,
      shortDescription: product.shortDescription,
      description: product.description,
      materials: product.materials,
      categories: product.categories.map((c) => c.name),
      price: Number(product.price).toFixed(2),
      priceType: product.priceType,
      pieceStatus: product.pieceStatus,
    },
    typeof body.angle === "string" && body.angle.trim() ? body.angle.trim() : null,
    typeof body.notes === "string" && body.notes.trim() ? body.notes.trim() : null
  );

  const client = new Anthropic();

  try {
    const message = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 4000,
      system: BRAND_SYSTEM_PROMPT,
      output_config: { format: { type: "json_schema", schema: OUTPUT_SCHEMA } },
      messages: [{ role: "user", content: prompt }],
    });

    if (message.stop_reason === "refusal") {
      return NextResponse.json(
        { error: "La IA no ha podido generar este texto. Prueba a reformular las indicaciones." },
        { status: 422 }
      );
    }

    const text = message.content.find((block) => block.type === "text");
    if (!text || text.type !== "text") {
      return NextResponse.json({ error: "La IA no ha devuelto texto." }, { status: 502 });
    }

    const parsed = JSON.parse(text.text) as { instagram: string; tiktok: string };
    return NextResponse.json({ instagram: parsed.instagram, tiktok: parsed.tiktok });
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
    console.error("Error generando texto con Anthropic:", error);
    return NextResponse.json({ error: "No se ha podido generar el texto." }, { status: 502 });
  }
}
