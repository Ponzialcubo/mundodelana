import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";
import { BRAND_SYSTEM_PROMPT, OUTPUT_SCHEMA, buildUserPrompt } from "@/lib/social-prompt";
import { formatPrice, hasPrice, productAction } from "@/lib/product-status";
import { deadlinePending, formatMD, getActiveCampaign } from "@/lib/campaigns";

export const maxDuration = 120;

/** Writes the Instagram caption + hashtags (and a TikTok version) for a product, in the brand's voice. */
export async function POST(req: Request) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "Falta ANTHROPIC_API_KEY en el entorno del servidor." }, { status: 500 });

  const body = (await req.json()) as { productId?: string; angle?: string; idea?: string };
  if (!body.productId) return NextResponse.json({ error: "Falta el producto" }, { status: 400 });

  const [product, sets, campaign] = await Promise.all([
    prisma.product.findUnique({ where: { id: body.productId }, include: { categories: true, campaigns: { select: { id: true } } } }),
    prisma.hashtagSet.findMany({ orderBy: { order: "asc" } }),
    getActiveCampaign(),
  ]);
  if (!product) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });

  const inCampaign = campaign && product.campaigns.some((c) => c.id === campaign.id);
  const prompt = buildUserPrompt(
    {
      name: product.name,
      shortDescription: product.shortDescription,
      description: product.description,
      materials: product.materials,
      categories: product.categories.map((c) => c.name),
      price: hasPrice(product.price.toString()) ? formatPrice(product.price.toString(), product.priceType) : null,
      pieceStatus: productAction(product.pieceStatus, product.priceType).label,
      campaign: inCampaign ? { name: campaign.name, deadline: deadlinePending(campaign) ? formatMD(campaign.deadlineMD!) : null } : null,
    },
    body.angle ?? "presentar",
    body.idea?.trim() || null,
    sets,
  );

  try {
    const message = await new Anthropic().messages.create({
      model: "claude-opus-5-5",
      max_tokens: 4000,
      system: BRAND_SYSTEM_PROMPT,
      output_config: { effort: "low", format: { type: "json_schema", schema: OUTPUT_SCHEMA } },
      messages: [{ role: "user", content: prompt }],
    });
    if (message.stop_reason === "refusal") {
      return NextResponse.json({ error: "La IA no ha podido escribir este texto. Prueba con otras indicaciones." }, { status: 422 });
    }
    const text = message.content.find((block) => block.type === "text");
    if (!text || text.type !== "text") return NextResponse.json({ error: "La IA no ha devuelto texto." }, { status: 502 });

    const parsed = JSON.parse(text.text) as { caption: string; hashtags: string[]; tiktok: string };
    const hashtags = [...new Set(parsed.hashtags.map((h) => `#${h.replace(/^#+/, "").replace(/\s+/g, "").toLowerCase()}`).filter((h) => h.length > 1))].slice(0, 25);
    return NextResponse.json({ caption: parsed.caption.trim(), hashtags: hashtags.join(" "), tiktok: parsed.tiktok.trim() });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return NextResponse.json({ error: "La IA está saturada ahora mismo. Inténtalo en un minuto." }, { status: 429 });
    console.error("Error generando texto con Anthropic:", error);
    return NextResponse.json({ error: "No se ha podido generar el texto." }, { status: 502 });
  }
}
