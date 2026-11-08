import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";
import type { PostMedia } from "@/lib/social/publish";

/**
 * Starts an Instagram post for a product: its photos (up to 10, with the same
 * framing as the shop) are preselected. Reuses an open draft for that product.
 */
export async function POST(req: Request) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { productId, fromId } = await req.json();

  // "New version" of an existing post: same photos and texts, as a fresh draft.
  if (fromId) {
    const source = await prisma.socialPost.findUnique({ where: { id: fromId } });
    if (!source) return NextResponse.json({ error: "No existe" }, { status: 404 });
    const copy = await prisma.socialPost.create({
      data: { productId: source.productId, media: source.media ?? [], instagramText: source.instagramText, hashtags: source.hashtags, tiktokText: source.tiktokText },
    });
    return NextResponse.json({ id: copy.id });
  }

  const product = productId
    ? await prisma.product.findUnique({ where: { id: productId }, include: { images: { orderBy: { order: "asc" } } } })
    : null;
  if (!product) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });

  const draft = await prisma.socialPost.findFirst({ where: { productId, status: "BORRADOR" }, orderBy: { updatedAt: "desc" } });
  if (draft) return NextResponse.json({ id: draft.id });

  const media: PostMedia[] = [
    ...(product.mainImage ? [{ url: product.mainImage, kind: "image" as const, focalX: product.mainImageFocalX, focalY: product.mainImageFocalY, zoom: product.mainImageZoom }] : []),
    ...product.images.map((i) => ({
      url: i.url,
      kind: i.mediaType === "VIDEO" ? ("video" as const) : ("image" as const),
      posterUrl: i.posterUrl,
      focalX: i.focalX,
      focalY: i.focalY,
      zoom: i.zoom,
    })),
  ].slice(0, 10);

  const post = await prisma.socialPost.create({ data: { productId, media } });
  return NextResponse.json({ id: post.id });
}
