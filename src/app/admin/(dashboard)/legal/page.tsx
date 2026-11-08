import { prisma } from "@/lib/prisma";
import { LegalEditorForm } from "@/components/admin/LegalEditorForm";

const ORDER = ["aviso", "privacidad", "cookies"];

export default async function AdminLegalPage() {
  const pages = await prisma.legalPage.findMany();
  const sorted = [...pages].sort((a, b) => ORDER.indexOf(a.slug) - ORDER.indexOf(b.slug));

  return (
    <LegalEditorForm
      pages={sorted.map((p) => ({
        slug: p.slug,
        title: p.title,
        content: p.content,
        updatedAt: p.updatedAt.toISOString(),
      }))}
    />
  );
}
