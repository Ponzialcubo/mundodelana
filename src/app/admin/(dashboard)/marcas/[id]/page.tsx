import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BrandEditorForm } from "@/components/admin/BrandEditorForm";

export default async function EditarMarcaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const brand = await prisma.brand.findUnique({ where: { id }, include: { _count: { select: { products: true } } } });
  if (!brand) notFound();

  return (
    <BrandEditorForm
      initial={{
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        order: brand.order,
        metaTitle: brand.metaTitle ?? "",
        metaDescription: brand.metaDescription ?? "",
        productCount: brand._count.products,
      }}
    />
  );
}
