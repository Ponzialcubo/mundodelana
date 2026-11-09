import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";
import { IAError, generarJson, iaDisponible } from "@/lib/ia";
import { BRAND_SYSTEM_PROMPT, OUTPUT_SCHEMA, buildUserPrompt } from "@/lib/social-prompt";
import { formatPrice, hasPrice, productAction } from "@/lib/product-status";
import { deadlinePending, formatMD, getActiveCampaign } from "@/lib/campaigns";

export const maxDuration = 160;

/** Writes the Instagram caption + hashtags (and a TikTok version) for a product, in the brand's voice. */
export async function POST(req: Request) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!iaDisponible()) return NextResponse.json({ error: "La IA no está configurada en este servidor." }, { status: 503 });

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
    const parsed = await generarJson<{ caption: string; hashtags: string[]; tiktok: string }>({
      tarea: "post-redes",
      // Captions are the brand's voice in public: sonnet.
      modelo: "sonnet",
      sistema: BRAND_SYSTEM_PROMPT,
      esquema: OUTPUT_SCHEMA as Record<string, unknown>,
      texto: prompt,
    });
    const tags = Array.isArray(parsed.hashtags) ? parsed.hashtags : [];
    const hashtags = [...new Set(tags.map((h) => `#${String(h).replace(/^#+/, "").replace(/\s+/g, "").toLowerCase()}`).filter((h) => h.length > 1))].slice(0, 25);
    return NextResponse.json({ caption: String(parsed.caption ?? "").trim(), hashtags: hashtags.join(" "), tiktok: String(parsed.tiktok ?? "").trim() });
  } catch (error) {
    if (error instanceof IAError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("Error generando texto de redes:", error);
    return NextResponse.json({ error: "No se ha podido generar el texto." }, { status: 502 });
  }
}
