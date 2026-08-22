import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductEditorForm, type ProductFormData } from "@/components/admin/ProductEditorForm";

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [product, categories, relatedOptions] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { categories: true, relatedTo: { select: { id: true } } },
    }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    prisma.product.findMany({ where: { id: { not: id } }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  const initial: ProductFormData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription ?? "",
    description: product.description ?? "",
    materials: product.materials ?? "",
    metaTitle: product.metaTitle ?? "",
    metaDescription: product.metaDescription ?? "",
    publicationStatus: product.publicationStatus,
    pieceStatus: product.pieceStatus,
    featured: product.featured,
    priceType: product.priceType,
    price: product.price.toString(),
    instagramUrl: product.instagramUrl ?? "",
    tiktokUrl: product.tiktokUrl ?? "",
    categoryIds: product.categories.map((c) => c.id),
    relatedIds: product.relatedTo.map((r) => r.id),
  };

  return <ProductEditorForm initial={initial} categories={categories} relatedOptions={relatedOptions} />;
}
