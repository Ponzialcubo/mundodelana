import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminSearch, AdminChip } from "@/components/admin/AdminFilters";
import { ProductRowActions } from "@/components/admin/ProductRowActions";
import { PIECE_STATUS_LABEL, PIECE_STATUS_DOT, PUBLICATION_LABEL, PUBLICATION_BADGE } from "@/lib/admin-status";
import type { Prisma } from "@/generated/prisma";

export default async function AdminProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; pub?: string }>;
}) {
  const { q = "", cat = "Todas", pub = "Todos" } = await searchParams;

  const where: Prisma.ProductWhereInput = {
    ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    ...(cat !== "Todas" ? { categories: { some: { name: cat } } } : {}),
    ...(pub !== "Todos" ? { publicationStatus: pub as Prisma.EnumPublicationStatusFilter["equals"] } : {}),
  };

  const [products, categories, total] = await Promise.all([
    prisma.product.findMany({ where, include: { categories: true }, orderBy: { createdAt: "desc" } }),
    prisma.category.findMany({ orderBy: { order: "asc" }, include: { _count: { select: { products: true } } } }),
    prisma.product.count(),
  ]);

  const availableCats = categories.filter((c) => c._count.products > 0);

  function href(params: Record<string, string>) {
    const usp = new URLSearchParams();
    const merged = { q, cat, pub, ...params };
    if (merged.q) usp.set("q", merged.q);
    if (merged.cat !== "Todas") usp.set("cat", merged.cat);
    if (merged.pub !== "Todos") usp.set("pub", merged.pub);
    const qs = usp.toString();
    return `/admin/productos${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-9">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-normal">Productos</h1>
          <p className="text-sm text-admin-ink-soft">{products.length} de {total} productos</p>
        </div>
        <Link href="/admin/productos/nuevo" className="rounded-full bg-pink px-4 py-2.5 text-sm font-medium">
          + Nuevo producto
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        <AdminSearch defaultValue={q} basePath="/admin/productos" />
        <div className="flex flex-wrap gap-2">
          <AdminChip label="Todas" active={cat === "Todas"} href={href({ cat: "Todas" })} />
          {availableCats.map((c) => (
            <AdminChip key={c.id} label={c.name} active={cat === c.name} href={href({ cat: c.name })} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {["Todos", "PUBLICADO", "BORRADOR", "ARCHIVADO"].map((p) => (
            <AdminChip
              key={p}
              label={p === "Todos" ? "Todos" : PUBLICATION_LABEL[p as keyof typeof PUBLICATION_LABEL]}
              active={pub === p}
              href={href({ pub: p })}
            />
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-admin-ink/10 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-admin-ink/10 bg-admin-surface-soft text-left text-xs text-admin-faint">
              <th className="px-4 py-3 font-medium">Foto</th>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Publicación</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const badge = PUBLICATION_BADGE[p.publicationStatus];
              return (
                <tr key={p.id} className="border-b border-admin-ink/6">
                  <td className="px-4 py-3">
                    <div
                      className="h-11 w-11 rounded-md"
                      style={{ background: "repeating-linear-gradient(45deg,#EDEBE8 0 6px,#F7F6F4 6px 12px)" }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium">{p.name}</span>
                      <span className="font-mono text-xs text-admin-faint">/{p.slug}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-admin-ink-soft">{p.categories[0]?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    {p.priceType === "PERSONALIZADO" ? "desde " : ""}
                    {Number(p.price).toFixed(0)} €
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: PIECE_STATUS_DOT[p.pieceStatus] }} />
                      {PIECE_STATUS_LABEL[p.pieceStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="rounded-full px-2.5 py-1 text-xs font-medium"
                      style={{ background: badge.bg, color: badge.fg }}
                    >
                      {PUBLICATION_LABEL[p.publicationStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ProductRowActions id={p.id} publicationStatus={p.publicationStatus} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="flex flex-col items-center gap-3 p-12 text-center">
            <span className="text-admin-ink-soft">Ningún producto con estos filtros</span>
            <Link href="/admin/productos" className="text-sm font-medium text-admin-link">Quitar filtros</Link>
          </div>
        )}
      </div>
    </div>
  );
}
