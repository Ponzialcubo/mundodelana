import Link from "next/link";
import { prisma } from "@/lib/prisma";

function relativeTime(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "hace unos minutos";
  if (hours < 24) return `hace ${hours} hora${hours === 1 ? "" : "s"}`;
  const days = Math.floor(hours / 24);
  return `hace ${days} día${days === 1 ? "" : "s"}`;
}

export default async function AdminDashboardPage() {
  const now = new Date();

  const [pendingOrders, productCounts, activeSubs, likesAgg, incomplete, topProducts] = await Promise.all([
    prisma.order.findMany({ where: { state: "NUEVO" }, orderBy: { createdAt: "asc" }, take: 5 }),
    prisma.product.groupBy({ by: ["publicationStatus"], _count: true }),
    prisma.subscriber.count({ where: { state: "ACTIVO" } }),
    prisma.product.aggregate({ _sum: { likes: true } }),
    // Anything not archived that is missing what a shopper needs to see.
    prisma.product.findMany({
      where: {
        publicationStatus: { not: "ARCHIVADO" },
        OR: [{ mainImage: null }, { mainImage: "" }, { price: { lte: 0 } }, { publicationStatus: "BORRADOR" }],
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.product.findMany({
      where: { publicationStatus: "PUBLICADO" },
      orderBy: [{ likes: "desc" }, { views: "desc" }],
      take: 5,
    }),
  ]);

  const publishedProducts = productCounts.find((p) => p.publicationStatus === "PUBLICADO")?._count ?? 0;
  const draftProducts = productCounts.find((p) => p.publicationStatus === "BORRADOR")?._count ?? 0;
  const totalLikes = likesAgg._sum.likes ?? 0;

  function missing(p: (typeof incomplete)[number]) {
    const items: string[] = [];
    if (!p.mainImage) items.push("foto");
    if (Number(p.price) <= 0) items.push("precio");
    if (p.publicationStatus === "BORRADOR") items.push("sin publicar");
    return items.join(" · ");
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-5 md:p-9">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-normal">Hola 👋</h1>
          <p className="text-sm text-admin-ink-soft">
            {now.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <div className="flex gap-2.5">
          <Link href="/" target="_blank" className="hidden rounded-full border border-admin-ink/16 bg-white px-4 py-2.5 text-sm font-medium md:block">
            Ver la tienda
          </Link>
          <Link href="/admin/productos/nuevo" className="rounded-full bg-pink px-4 py-2.5 text-sm font-medium">
            + Nuevo producto
          </Link>
        </div>
      </div>

      {pendingOrders.length > 0 ? (
        <div className="flex flex-col gap-3 rounded-xl border border-pink/40 bg-admin-accent-soft p-5 md:p-6">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-serif text-lg font-medium">
              {pendingOrders.length} encargo{pendingOrders.length === 1 ? "" : "s"} sin responder
            </span>
            <Link href="/admin/pedidos" className="text-sm font-medium text-admin-link">Ver todos</Link>
          </div>
          <div className="flex flex-col divide-y divide-admin-ink/8 rounded-lg bg-white">
            {pendingOrders.map((o) => (
              <Link key={o.id} href={`/admin/pedidos/${o.id}`} className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="flex min-w-0 flex-col">
                  <span className="text-sm font-medium">{o.clientName}</span>
                  <span className="truncate text-xs text-admin-ink-soft">{o.requestText}</span>
                </span>
                <span className="shrink-0 text-xs text-admin-faint">{relativeTime(o.createdAt)}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-admin-ink/10 bg-white p-5 text-sm text-admin-ink-soft">
          No hay encargos pendientes de responder. 🎉
        </div>
      )}

      {incomplete.length > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-admin-ink/10 bg-white p-5 md:p-6">
          <div className="flex flex-col">
            <span className="font-serif text-lg font-medium">Pendiente de completar</span>
            <span className="text-xs text-admin-ink-soft">Productos a los que les falta algo para lucir en la tienda</span>
          </div>
          <div className="flex flex-col divide-y divide-admin-ink/8">
            {incomplete.map((p) => (
              <Link key={p.id} href={`/admin/productos/${p.id}`} className="flex items-center justify-between gap-3 py-2.5">
                <span className="truncate text-sm font-medium">{p.name}</span>
                <span className="shrink-0 text-xs text-admin-link">Falta: {missing(p)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <Link href="/admin/productos?pub=PUBLICADO" className="flex flex-col gap-1 rounded-xl border border-admin-ink/10 bg-white p-4">
          <span className="font-serif text-2xl font-medium">{publishedProducts}</span>
          <span className="text-xs text-admin-ink-soft">en la tienda</span>
          {draftProducts > 0 && <span className="text-[11px] text-admin-faint">+{draftProducts} en borrador</span>}
        </Link>
        <Link href="/admin/newsletter" className="flex flex-col gap-1 rounded-xl border border-admin-ink/10 bg-white p-4">
          <span className="font-serif text-2xl font-medium">{activeSubs}</span>
          <span className="text-xs text-admin-ink-soft">suscriptoras</span>
        </Link>
        <div className="flex flex-col gap-1 rounded-xl border border-admin-ink/10 bg-white p-4">
          <span className="font-serif text-2xl font-medium">{totalLikes}</span>
          <span className="text-xs text-admin-ink-soft">me gusta</span>
        </div>
      </div>

      {topProducts.length > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-admin-ink/10 bg-white p-5 md:p-6">
          <span className="font-serif text-lg font-medium">Lo que más gusta</span>
          <div className="flex flex-col divide-y divide-admin-ink/8">
            {topProducts.map((p, i) => (
              <Link key={p.id} href={`/admin/productos/${p.id}`} className="flex items-center justify-between gap-3 py-2.5">
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">{i + 1}. {p.name}</span>
                  <span className="text-xs text-admin-ink-soft">{p.views} visitas</span>
                </span>
                <span className="text-sm text-admin-link">♥ {p.likes}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
