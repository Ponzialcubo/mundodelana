import { prisma } from "@/lib/prisma";
import { SocialComposer } from "@/components/admin/SocialComposer";

export default async function AdminRedesPage() {
  const [products, posts] = await Promise.all([
    prisma.product.findMany({
      where: { publicationStatus: { not: "ARCHIVADO" } },
      include: { categories: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.socialPost.findMany({
      include: { product: { select: { name: true } } },
      orderBy: [{ scheduledFor: "asc" }, { createdAt: "desc" }],
      take: 30,
    }),
  ]);

  return (
    <SocialComposer
      products={products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        shortDescription: p.shortDescription,
        description: p.description,
        materials: p.materials,
        categories: p.categories.map((c) => c.name),
        price: Number(p.price).toFixed(2),
        priceType: p.priceType,
        pieceStatus: p.pieceStatus,
      }))}
      posts={posts.map((post) => ({
        id: post.id,
        productName: post.product.name,
        scheduledFor: post.scheduledFor?.toISOString() ?? null,
        instagramText: post.instagramText,
        tiktokText: post.tiktokText,
        mediaUrl: post.mediaUrl,
      }))}
    />
  );
}
