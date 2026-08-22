import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";
import { productMetaFallback } from "@/lib/seo";

export async function POST(req: Request) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json();

  // Auto-fill SEO meta from a template when the admin left them empty.
  const fallback = productMetaFallback({
    name: body.name,
    shortDescription: body.shortDescription,
    description: body.description,
  });

  const product = await prisma.product.create({
    data: {
      name: body.name,
      slug: body.slug,
      shortDescription: body.shortDescription || null,
      description: body.description || null,
      materials: body.materials || null,
      metaTitle: body.metaTitle?.trim() || fallback.metaTitle,
      metaDescription: body.metaDescription?.trim() || fallback.metaDescription,
      publicationStatus: body.publicationStatus,
      pieceStatus: body.pieceStatus,
      featured: Boolean(body.featured),
      priceType: body.priceType,
      price: body.price,
      instagramUrl: body.instagramUrl || null,
      tiktokUrl: body.tiktokUrl || null,
      categories: body.categoryIds?.length ? { connect: body.categoryIds.map((id: string) => ({ id })) } : undefined,
      relatedTo: body.relatedIds?.length ? { connect: body.relatedIds.map((id: string) => ({ id })) } : undefined,
    },
  });

  return NextResponse.json({ ok: true, id: product.id });
}
