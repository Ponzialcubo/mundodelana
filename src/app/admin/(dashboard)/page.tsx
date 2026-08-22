import Link from "next/link";
import { prisma } from "@/lib/prisma";

const DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

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
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 6);
  weekAgo.setHours(0, 0, 0, 0);

  const [pendingOrders, productCounts, subscriberCounts, likesAgg, weekOrders, topProducts] = await Promise.all([
    prisma.order.findMany({
      where: { state: "NUEVO" },
      orderBy: { createdAt: "asc" },
      take: 5,
    }),
    prisma.product.groupBy({ by: ["publicationStatus"], _count: true }),
    prisma.subscriber.groupBy({ by: ["state"], _count: true }),
    prisma.product.aggregate({ _sum: { likes: true } }),
    prisma.order.findMany({ where: { createdAt: { gte: weekAgo } }, select: { createdAt: true } }),
    prisma.product.findMany({ orderBy: [{ likes: "desc" }, { views: "desc" }], take: 5, include: { categories: true } }),
  ]);

  const totalProducts = productCounts.reduce((sum, p) => sum + p._count, 0);
  const publishedProducts = productCounts.find((p) => p.publicationStatus === "PUBLICADO")?._count ?? 0;
  const totalSubs = subscriberCounts.reduce((sum, s) => sum + s._count, 0);
  const activeSubs = subscriberCounts.find((s) => s.state === "ACTIVO")?._count ?? 0;
  const totalLikes = likesAgg._sum.likes ?? 0;

  const dayBuckets = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekAgo);
    d.setDate(d.getDate() + i);
    return { date: d, count: 0 };
  });
  for (const o of weekOrders) {
    const idx = Math.floor((o.createdAt.getTime() - weekAgo.getTime()) / (1000 * 60 * 60 * 24));
    if (idx >= 0 && idx < 7) dayBuckets[idx].count++;
  }
  const maxCount = Math.max(1, ...dayBuckets.map((d) => d.count));
  const totalWeek = dayBuckets.reduce((sum, d) => sum + d.count, 0);

  const oldestPending = pendingOrders[0];

  return (
    <div className="flex flex-col gap-7 p-6 md:p-9">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-normal">Dashboard</h1>
          <p className="text-sm text-admin-ink-soft">
            {now.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2.5">
          <Link href="/" target="_blank" className="rounded-full border border-admin-ink/16 bg-white px-4 py-2.5 text-sm font-medium">
            Ver la tienda
          </Link>
          <Link href="/admin/productos/nuevo" className="rounded-full bg-pink px-4 py-2.5 text-sm font-medium">
            Nuevo producto
          </Link>
        </div>
      </div>

      {oldestPending && (
        <Link
          href="/admin/pedidos"
          className="flex flex-col gap-1 rounded-xl border border-pink/40 bg-admin-accent-soft p-6"
        >
          <span className="font-mono text-[10px] uppercase tracking-wider text-admin-link">Sin responder</span>
          <span className="font-serif text-3xl font-medium">{pendingOrders.length}</span>
          <span className="text-sm text-admin-ink-soft">
            encargos nuevos · el más antiguo, {relativeTime(oldestPending.createdAt)}
          </span>
          <span className="mt-1 w-fit text-sm font-medium text-admin-link">Responder ahora</span>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="flex flex-col gap-1 rounded-xl border border-admin-ink/10 bg-white p-5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-admin-faint">Productos</span>
          <span className="font-serif text-2xl font-medium">{totalProducts}</span>
          <span className="text-xs text-admin-ink-soft">{publishedProducts} publicados</span>
        </div>
        <div className="flex flex-col gap-1 rounded-xl border border-admin-ink/10 bg-white p-5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-admin-faint">Newsletter</span>
          <span className="font-serif text-2xl font-medium">{totalSubs}</span>
          <span className="text-xs text-admin-ink-soft">{activeSubs} activas</span>
        </div>
        <div className="col-span-2 flex flex-col gap-1 rounded-xl border border-admin-ink/10 bg-white p-5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-admin-faint">Me gusta</span>
          <span className="font-serif text-2xl font-medium">{totalLikes}</span>
          <span className="text-xs text-admin-ink-soft">en total</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div className="flex flex-col gap-4 rounded-xl border border-admin-ink/10 bg-white p-6">
          <div className="flex items-center justify-between">
            <span className="font-serif text-lg font-medium">Pedidos recibidos</span>
            <span className="text-xs text-admin-ink-soft">Últimos 7 días · {totalWeek} encargos</span>
          </div>
          <div className="flex h-32 items-end gap-3">
            {dayBuckets.map((d, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className="w-full rounded-t-md"
                  style={{
                    height: `${(d.count / maxCount) * 100}%`,
                    minHeight: 4,
                    background: d.count === maxCount && d.count > 0 ? "#E8B4B8" : "#E2DFDB",
                  }}
                />
                <span className="text-[11px] text-admin-faint">{DAY_LABELS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-admin-ink/10 bg-white p-6">
          <span className="font-serif text-lg font-medium">Más gustados</span>
          <div className="flex flex-col divide-y divide-admin-ink/8">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{i + 1}. {p.name}</span>
                  <span className="text-xs text-admin-ink-soft">
                    {p.categories[0]?.name ?? "—"} · {p.views} vistas
                  </span>
                </div>
                <span className="text-sm text-admin-link">♥ {p.likes}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-admin-ink/10 bg-white p-6">
        <div className="flex items-center justify-between">
          <span className="font-serif text-lg font-medium">Pedidos nuevos sin responder</span>
          <Link href="/admin/pedidos" className="text-sm font-medium text-admin-link">Ver todos los pedidos</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-admin-ink/10 text-left text-xs text-admin-faint">
                <th className="py-2 font-medium">Referencia</th>
                <th className="py-2 font-medium">Clienta y pieza</th>
                <th className="py-2 font-medium">Tipo</th>
                <th className="py-2 font-medium">Recibido</th>
                <th className="py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {pendingOrders.map((o) => (
                <tr key={o.id} className="border-b border-admin-ink/6">
                  <td className="py-3 font-mono text-xs">{o.ref}</td>
                  <td className="py-3">
                    <span className="font-medium">{o.clientName}</span>
                    <span className="text-admin-ink-soft"> · {o.requestText.slice(0, 30)}…</span>
                  </td>
                  <td className="py-3 text-admin-ink-soft">
                    {o.type === "PERSONALIZADO" ? "Personalizado" : "Reserva de stock"}
                  </td>
                  <td className="py-3 text-admin-ink-soft">{relativeTime(o.createdAt)}</td>
                  <td className="py-3 text-right">
                    <Link href={`/admin/pedidos/${o.id}`} className="font-medium text-admin-link">Responder</Link>
                  </td>
                </tr>
              ))}
              {pendingOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-admin-ink-soft">
                    No hay pedidos pendientes. 🎉
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
