import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: body.name,
      slug: body.slug,
      shortDescription: body.shortDescription || null,
      description: body.description || null,
      materials: body.materials || null,
      metaTitle: body.metaTitle || null,
      metaDescription: body.metaDescription || null,
      publicationStatus: body.publicationStatus,
      pieceStatus: body.pieceStatus,
      featured: Boolean(body.featured),
      priceType: body.priceType,
      price: body.price,
      instagramUrl: body.instagramUrl || null,
      tiktokUrl: body.tiktokUrl || null,
      mainImage: body.mainImage || null,
      images: body.images
        ? {
            deleteMany: {},
            create: body.images.map((url: string, order: number) => ({ url, order })),
          }
        : undefined,
      categories: body.categoryIds ? { set: body.categoryIds.map((cid: string) => ({ id: cid })) } : undefined,
      relatedTo: body.relatedIds ? { set: body.relatedIds.map((rid: string) => ({ id: rid })) } : undefined,
    },
  });

  return NextResponse.json({ ok: true, id: product.id });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  await prisma.product.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
