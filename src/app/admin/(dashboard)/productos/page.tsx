import Link from "next/link";
import Image from "next/image";
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
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 p-5 md:p-9">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-normal">Productos</h1>
          <p className="text-sm text-admin-ink-soft">{products.length} de {total} productos</p>
        </div>
        <Link href="/admin/productos/nuevo" className="rounded-full bg-pink px-4 py-2.5 text-sm font-medium">
          + Nuevo
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

      <div className="flex flex-col divide-y divide-admin-ink/8 overflow-hidden rounded-xl border border-admin-ink/10 bg-white">
        {products.map((p) => {
          const badge = PUBLICATION_BADGE[p.publicationStatus];
          return (
            <div key={p.id} className="flex items-center gap-3 px-3 py-3 md:px-4">
              <Link href={`/admin/productos/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                {p.mainImage ? (
                  <div className="relative h-16 w-[52px] shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={p.mainImage}
                      alt={p.name}
                      fill
                      sizes="52px"
                      className="object-cover"
                      style={{ objectPosition: `${p.mainImageFocalX * 100}% ${p.mainImageFocalY * 100}%` }}
                    />
                  </div>
                ) : (
                  <div
                    className="flex h-16 w-[52px] shrink-0 items-center justify-center rounded-md text-[9px] text-admin-faint"
                    style={{ background: "repeating-linear-gradient(45deg,#EDEBE8 0 6px,#F7F6F4 6px 12px)" }}
                  >
                    sin foto
                  </div>
                )}
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="truncate text-sm font-medium">{p.name}</span>
                  <span className="truncate text-xs text-admin-ink-soft">
                    {p.categories[0]?.name ?? "Sin categoría"} ·{" "}
                    {Number(p.price) > 0
                      ? `${p.priceType === "PERSONALIZADO" ? "desde " : ""}${Number(p.price).toFixed(0)} €`
                      : "sin precio"}
                  </span>
                  <span className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full px-2 py-0.5 font-medium" style={{ background: badge.bg, color: badge.fg }}>
                      {PUBLICATION_LABEL[p.publicationStatus]}
                    </span>
                    <span className="flex items-center gap-1 text-admin-ink-soft">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: PIECE_STATUS_DOT[p.pieceStatus] }} />
                      {PIECE_STATUS_LABEL[p.pieceStatus]}
                    </span>
                  </span>
                </div>
              </Link>
              <div className="hidden md:block">
                <ProductRowActions id={p.id} publicationStatus={p.publicationStatus} />
              </div>
              <span className="text-admin-faint md:hidden">›</span>
            </div>
          );
        })}
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
