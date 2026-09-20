import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductEditorForm, type ProductFormData } from "@/components/admin/ProductEditorForm";

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [product, categories, brands, relatedOptions] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        categories: true,
        brands: true,
        relatedTo: { select: { id: true } },
        images: { orderBy: { order: "asc" } },
      },
    }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    prisma.brand.findMany({ orderBy: { order: "asc" } }),
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
    brandIds: product.brands.map((b) => b.id),
    relatedIds: product.relatedTo.map((r) => r.id),
    mainImage: product.mainImage ?? "",
    mainImageFocalX: product.mainImageFocalX,
    mainImageFocalY: product.mainImageFocalY,
    images: product.images.map((i) => ({
      url: i.url,
      mediaType: i.mediaType,
      posterUrl: i.posterUrl,
      focalX: i.focalX,
      focalY: i.focalY,
    })),
  };

  return <ProductEditorForm initial={initial} categories={categories} brands={brands} relatedOptions={relatedOptions} />;
}
