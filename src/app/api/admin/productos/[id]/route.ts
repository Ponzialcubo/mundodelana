import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  // Only the fields sent are changed: quick actions (archive from the list) send
  // just one field and must not wipe the rest of the product.
  const has = (key: string) => key in body;
  const text = (key: string) => (has(key) ? body[key] || null : undefined);

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: has("name") ? body.name : undefined,
      slug: has("slug") ? body.slug : undefined,
      shortDescription: text("shortDescription"),
      description: text("description"),
      materials: text("materials"),
      metaTitle: text("metaTitle"),
      metaDescription: text("metaDescription"),
      publicationStatus: body.publicationStatus,
      pieceStatus: body.pieceStatus,
      featured: has("featured") ? Boolean(body.featured) : undefined,
      priceType: body.priceType,
      price: has("price") ? (body.price === "" ? 0 : body.price) : undefined,
      instagramUrl: text("instagramUrl"),
      tiktokUrl: text("tiktokUrl"),
      mainImage: text("mainImage"),
      mainImageFocalX: has("mainImageFocalX") ? body.mainImageFocalX : undefined,
      mainImageFocalY: has("mainImageFocalY") ? body.mainImageFocalY : undefined,
      mainImageZoom: has("mainImageZoom") ? body.mainImageZoom : undefined,
      images: body.images
        ? {
            deleteMany: {},
            create: body.images.map(
              (
                img: { url: string; mediaType?: "IMAGE" | "VIDEO"; posterUrl?: string; focalX: number; focalY: number; zoom?: number },
                order: number
              ) => ({
                url: img.url,
                mediaType: img.mediaType ?? "IMAGE",
                posterUrl: img.posterUrl || null,
                focalX: img.focalX ?? 0.5,
                focalY: img.focalY ?? 0.5,
                zoom: img.zoom ?? 1,
                order,
              })
            ),
          }
        : undefined,
      categories: body.categoryIds ? { set: body.categoryIds.map((cid: string) => ({ id: cid })) } : undefined,
      brands: body.brandIds ? { set: body.brandIds.map((bid: string) => ({ id: bid })) } : undefined,
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
