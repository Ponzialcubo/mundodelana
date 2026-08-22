import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CategoryEditorForm } from "@/components/admin/CategoryEditorForm";

export default async function EditarCategoriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id }, include: { _count: { select: { products: true } } } });
  if (!category) notFound();

  return (
    <CategoryEditorForm
      initial={{
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description ?? "",
        metaTitle: category.metaTitle ?? "",
        metaDescription: category.metaDescription ?? "",
        order: category.order,
        productCount: category._count.products,
      }}
    />
  );
}
