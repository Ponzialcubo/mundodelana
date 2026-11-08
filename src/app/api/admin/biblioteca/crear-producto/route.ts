import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";
import { slugify } from "@/lib/slugify";
import { productMetaFallback } from "@/lib/seo";
import { captionToProductDraft } from "@/lib/library";

async function uniqueSlug(base: string): Promise<string> {
  const root = base || "pieza";
  let slug = root;
  for (let n = 2; await prisma.product.findUnique({ where: { slug }, select: { id: true } }); n++) {
    slug = `${root}-${n}`;
  }
  return slug;
}

/**
 * Creates a draft product from selected library media: photos keep the
 * selection order (first photo = cover), name/description come from the
 * Instagram caption. The owner then completes price/category in the editor.
 */
export async function POST(req: Request) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { ids } = (await req.json()) as { ids: string[] };
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "Selecciona al menos una foto" }, { status: 400 });
  }

  const found = await prisma.libraryMedia.findMany({ where: { id: { in: ids } } });
  const media = ids.map((id) => found.find((m) => m.id === id)).filter((m) => m !== undefined);
  const cover = media.find((m) => m.mediaType === "IMAGE");
  if (!cover) return NextResponse.json({ error: "Hace falta al menos una foto (no solo vídeos)" }, { status: 400 });

  const { name, description } = captionToProductDraft(media.find((m) => m.caption)?.caption);
  const fallback = productMetaFallback({ name, description });

  const product = await prisma.product.create({
    data: {
      name,
      slug: await uniqueSlug(slugify(name)),
      description: description || null,
      metaTitle: fallback.metaTitle,
      metaDescription: fallback.metaDescription,
      publicationStatus: "BORRADOR",
      price: 0,
      instagramUrl: cover.permalink,
      mainImage: cover.url,
      images: {
        create: media
          .filter((m) => m.id !== cover.id)
          .map((m, order) => ({ url: m.url, mediaType: m.mediaType, posterUrl: m.posterUrl, order })),
      },
    },
  });

  await prisma.libraryMedia.updateMany({ where: { id: { in: media.map((m) => m.id) } }, data: { status: "USADA" } });
  return NextResponse.json({ id: product.id });
}
