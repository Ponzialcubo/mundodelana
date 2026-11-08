import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/product-status";
import { isInWindow } from "@/lib/campaigns";

export const dynamic = "force-dynamic";

export type SearchIndex = {
  products: { name: string; slug: string; image: string | null; price: string; terms: string }[];
  categories: { name: string; slug: string; count: number }[];
  brands: { name: string; slug: string; count: number }[];
  campaigns: { name: string; slug: string }[];
};

/**
 * The whole published catalog as a small index (a few KB). The search box
 * downloads it once and filters on the device, so results appear as you type.
 */
export async function GET() {
  const published = { publicationStatus: "PUBLICADO" as const };
  const [products, categories, brands, campaigns] = await Promise.all([
    prisma.product.findMany({
      where: published,
      orderBy: [{ featured: "desc" }, { name: "asc" }],
      select: {
        name: true, slug: true, mainImage: true, price: true, priceType: true, shortDescription: true,
        categories: { select: { name: true } }, brands: { select: { name: true } },
      },
    }),
    prisma.category.findMany({ orderBy: { order: "asc" }, select: { name: true, slug: true, _count: { select: { products: { where: published } } } } }),
    prisma.brand.findMany({ orderBy: { order: "asc" }, select: { name: true, slug: true, _count: { select: { products: { where: published } } } } }),
    prisma.campaign.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
  ]);

  const index: SearchIndex = {
    products: products.map((p) => ({
      name: p.name,
      slug: p.slug,
      image: p.mainImage,
      price: formatPrice(p.price.toString(), p.priceType),
      terms: [p.shortDescription, ...p.categories.map((c) => c.name), ...p.brands.map((b) => b.name)].filter(Boolean).join(" "),
    })),
    categories: categories.filter((c) => c._count.products > 0).map((c) => ({ name: c.name, slug: c.slug, count: c._count.products })),
    brands: brands.filter((b) => b._count.products > 0).map((b) => ({ name: b.name, slug: b.slug, count: b._count.products })),
    campaigns: campaigns.filter((c) => isInWindow(c.startMD, c.endMD)).map((c) => ({ name: c.name, slug: c.slug })),
  };

  return NextResponse.json(index, { headers: { "Cache-Control": "public, max-age=60" } });
}
