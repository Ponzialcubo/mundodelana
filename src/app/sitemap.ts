import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/seo";

// Generated at runtime (needs the DB), not prerendered at build time.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (path: string) => `${SITE_URL}${path}`;

  // Static public pages.
  const staticPages: MetadataRoute.Sitemap = [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    { url: url("/catalogo"), changeFrequency: "daily", priority: 0.9 },
    { url: url("/como-funciona"), changeFrequency: "monthly", priority: 0.6 },
    { url: url("/sobre-mi"), changeFrequency: "monthly", priority: 0.5 },
    { url: url("/encargo"), changeFrequency: "monthly", priority: 0.7 },
    { url: url("/faq"), changeFrequency: "monthly", priority: 0.4 },
    { url: url("/contacto"), changeFrequency: "yearly", priority: 0.4 },
    { url: url("/legal/aviso"), changeFrequency: "yearly", priority: 0.2 },
    { url: url("/legal/privacidad"), changeFrequency: "yearly", priority: 0.2 },
    { url: url("/legal/cookies"), changeFrequency: "yearly", priority: 0.2 },
  ];

  // Only published products are indexable.
  const products = await prisma.product.findMany({
    where: { publicationStatus: "PUBLICADO" },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: url(`/producto/${p.slug}`),
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Only categories/brands with at least one published product are indexable.
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({
      where: { products: { some: { publicationStatus: "PUBLICADO" } } },
      select: { slug: true, updatedAt: true },
    }),
    prisma.brand.findMany({
      where: { products: { some: { publicationStatus: "PUBLICADO" } } },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: url(`/categoria/${c.slug}`),
    lastModified: c.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const brandPages: MetadataRoute.Sitemap = brands.map((b) => ({
    url: url(`/marca/${b.slug}`),
    lastModified: b.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...productPages, ...categoryPages, ...brandPages];
}
