import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { AdminSearch } from "@/components/admin/AdminFilters";
import { ProductRowActions } from "@/components/admin/ProductRowActions";
import { QuickPrice } from "@/components/admin/QuickPrice";
import { CategorySelect } from "@/components/admin/CategorySelect";
import { PIECE_STATUS_LABEL, PIECE_STATUS_DOT, PUBLICATION_LABEL, PUBLICATION_BADGE } from "@/lib/admin-status";
import { frameStyle } from "@/lib/framing";
import type { Prisma } from "@/generated/prisma";

const PER_PAGE = 20;

const STATUS_TABS = [
  { key: "Todos", label: "Todos" },
  { key: "PENDIENTE", label: "Sin precio o sin foto" },
  { key: "PUBLICADO", label: "En la tienda" },
  { key: "BORRADOR", label: "Borradores" },
  { key: "ARCHIVADO", label: "Archivados" },
] as const;

const pendingWhere: Prisma.ProductWhereInput = { publicationStatus: { not: "ARCHIVADO" }, OR: [{ price: { lte: 0 } }, { mainImage: null }, { mainImage: "" }] };

function statusWhere(pub: string): Prisma.ProductWhereInput {
  if (pub === "PENDIENTE") return pendingWhere;
  if (pub === "Todos") return {};
  return { publicationStatus: pub as Prisma.EnumPublicationStatusFilter["equals"] };
}

export default async function AdminProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; pub?: string; pagina?: string }>;
}) {
  const { q = "", cat = "Todas", pub = "Todos", pagina } = await searchParams;
  const page = Math.max(1, Number(pagina) || 1);

  const base: Prisma.ProductWhereInput = {
    ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    ...(cat !== "Todas" ? { categories: { some: { name: cat } } } : {}),
  };
  const where = { ...base, ...statusWhere(pub) };

  const [products, matching, categories, counts] = await Promise.all([
    prisma.product.findMany({ where, include: { categories: true }, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER_PAGE, take: PER_PAGE }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { order: "asc" }, include: { _count: { select: { products: true } } } }),
    Promise.all(STATUS_TABS.map((t) => prisma.product.count({ where: { ...base, ...statusWhere(t.key) } }))),
  ]);
  const pages = Math.max(1, Math.ceil(matching / PER_PAGE));

  function href(params: Record<string, string>) {
    const usp = new URLSearchParams();
    const merged = { q, cat, pub, pagina: "1", ...params };
    if (merged.q) usp.set("q", merged.q);
    if (merged.cat !== "Todas") usp.set("cat", merged.cat);
    if (merged.pub !== "Todos") usp.set("pub", merged.pub);
    if (merged.pagina !== "1") usp.set("pagina", merged.pagina);
    const qs = usp.toString();
    return `/admin/productos${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 p-5 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-normal">Productos</h1>
          <p className="text-sm text-admin-ink-soft">Toca un producto para editarlo. El precio se puede cambiar aquí mismo.</p>
        </div>
        <Link href="/admin/productos/nuevo" className="rounded-full bg-pink px-5 py-2.5 text-sm font-medium">
          + Nuevo producto
        </Link>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-admin-ink/10 bg-white p-3 md:flex-row md:items-center md:p-4">
        <AdminSearch defaultValue={q} basePath="/admin/productos" />
        <CategorySelect value={cat} options={categories.filter((c) => c._count.products > 0).map((c) => c.name)} />
      </div>

      <nav className="-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] md:mx-0 md:px-0">
        {STATUS_TABS.map((t, i) => (
          <Link
            key={t.key}
            href={href({ pub: t.key })}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${pub === t.key ? "bg-admin-ink text-white" : "border border-admin-ink/14 bg-white"}`}
          >
            {t.label} <span className={pub === t.key ? "text-white/60" : "text-admin-faint"}>{counts[i]}</span>
          </Link>
        ))}
      </nav>

      <div className="flex flex-col divide-y divide-admin-ink/8 overflow-hidden rounded-2xl border border-admin-ink/10 bg-white">
        {products.map((p) => {
          const badge = PUBLICATION_BADGE[p.publicationStatus];
          return (
            <div key={p.id} className="flex items-center gap-3 px-3 py-3 md:gap-4 md:px-4">
              <Link href={`/admin/productos/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3 md:gap-4">
                {p.mainImage ? (
                  <div className="relative aspect-[4/5] w-[52px] shrink-0 overflow-hidden rounded-lg md:w-[60px]">
                    <Image src={p.mainImage} alt="" fill sizes="60px" className="object-cover" style={frameStyle({ focalX: p.mainImageFocalX, focalY: p.mainImageFocalY, zoom: p.mainImageZoom })} />
                  </div>
                ) : (
                  <div className="flex aspect-[4/5] w-[52px] shrink-0 items-center justify-center rounded-lg border border-dashed border-pink text-center text-[9px] text-admin-ink-soft md:w-[60px]">
                    sin foto
                  </div>
                )}
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="truncate text-[14.5px] font-medium">{p.name}</span>
                  <span className="truncate text-xs text-admin-ink-soft">{p.categories.map((c) => c.name).join(", ") || "Sin categoría"}</span>
                  <span className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full px-2 py-0.5 font-medium" style={{ background: badge.bg, color: badge.fg }}>
                      {PUBLICATION_LABEL[p.publicationStatus]}
                    </span>
                    <span className="hidden items-center gap-1 text-admin-ink-soft sm:flex">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: PIECE_STATUS_DOT[p.pieceStatus] }} />
                      {PIECE_STATUS_LABEL[p.pieceStatus]}
                    </span>
                  </span>
                </div>
              </Link>
              <QuickPrice id={p.id} price={Number(p.price)} priceType={p.priceType} />
              <div className="hidden lg:block">
                <ProductRowActions id={p.id} publicationStatus={p.publicationStatus} />
              </div>
            </div>
          );
        })}
        {products.length === 0 && (
          <div className="flex flex-col items-center gap-3 p-12 text-center">
            <span className="text-admin-ink-soft">Ningún producto con estos filtros</span>
            <Link href="/admin/productos" className="text-sm font-medium text-admin-link">
              Quitar filtros
            </Link>
          </div>
        )}
      </div>

      {pages > 1 && (
        <nav className="flex flex-wrap items-center justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={href({ pagina: String(n) })}
              className={`flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm ${n === page ? "bg-admin-ink text-white" : "border border-admin-ink/14 bg-white"}`}
            >
              {n}
            </Link>
          ))}
          <span className="w-full text-center text-xs text-admin-faint">
            {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, matching)} de {matching}
          </span>
        </nav>
      )}
    </div>
  );
}
