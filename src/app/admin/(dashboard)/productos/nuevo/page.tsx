import { prisma } from "@/lib/prisma";
import { ProductEditorForm } from "@/components/admin/ProductEditorForm";

export default async function NuevoProductoPage() {
  const [categories, relatedOptions] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    prisma.product.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return <ProductEditorForm categories={categories} relatedOptions={relatedOptions} />;
}
