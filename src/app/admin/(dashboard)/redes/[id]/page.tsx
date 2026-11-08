import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseMedia } from "@/lib/social/publish";
import { PostComposer } from "@/components/admin/social/PostComposer";

export default async function AdminPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, sets] = await Promise.all([
    prisma.socialPost.findUnique({
      where: { id },
      include: { product: { include: { images: { orderBy: { order: "asc" } } } } },
    }),
    prisma.hashtagSet.findMany({ orderBy: { order: "asc" } }),
  ]);
  if (!post) notFound();

  const p = post.product;
  // Every photo of the product, to add back the ones not in the post.
  const library = p
    ? [
        ...(p.mainImage ? [{ url: p.mainImage, kind: "image" as const, focalX: p.mainImageFocalX, focalY: p.mainImageFocalY, zoom: p.mainImageZoom }] : []),
        ...p.images.map((i) => ({ url: i.url, kind: i.mediaType === "VIDEO" ? ("video" as const) : ("image" as const), posterUrl: i.posterUrl, focalX: i.focalX, focalY: i.focalY, zoom: i.zoom })),
      ]
    : [];

  return (
    <PostComposer
      post={{
        id: post.id,
        status: post.status,
        media: parseMedia(post.media),
        instagramText: post.instagramText ?? "",
        hashtags: post.hashtags ?? "",
        tiktokText: post.tiktokText ?? "",
        scheduledFor: post.scheduledFor?.toISOString() ?? null,
        permalink: post.instagramPermalink,
        publishedAt: post.instagramPublishedAt?.toISOString() ?? null,
        error: post.instagramPublishError,
      }}
      product={p ? { id: p.id, name: p.name, slug: p.slug } : null}
      library={library}
      hashtagSets={sets.map((s) => ({ name: s.name, tags: s.tags }))}
    />
  );
}
