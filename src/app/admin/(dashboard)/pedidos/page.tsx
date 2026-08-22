import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminChip } from "@/components/admin/AdminFilters";
import type { Prisma, OrderState } from "@/generated/prisma";

const STATE_LABEL: Record<OrderState, string> = {
  NUEVO: "Nuevo",
  COTIZADO: "Cotizado",
  CONFIRMADO: "Confirmado",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
};

const STATE_DOT: Record<OrderState, string> = {
  NUEVO: "#E8B4B8",
  COTIZADO: "#D9A566",
  CONFIRMADO: "#6F8A64",
  ENVIADO: "#8FA3B0",
  ENTREGADO: "#9CAF88",
};

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string; type?: string }>;
}) {
  const { state = "Todos", type = "Todos" } = await searchParams;

  const where: Prisma.OrderWhereInput = {
    ...(state !== "Todos" ? { state: state as OrderState } : {}),
    ...(type !== "Todos" ? { type: type as Prisma.EnumOrderTypeFilter["equals"] } : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({ where, orderBy: { createdAt: "desc" } }),
    prisma.order.count(),
  ]);

  function href(params: Record<string, string>) {
    const usp = new URLSearchParams();
    const merged = { state, type, ...params };
    if (merged.state !== "Todos") usp.set("state", merged.state);
    if (merged.type !== "Todos") usp.set("type", merged.type);
    const qs = usp.toString();
    return `/admin/pedidos${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-9">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-normal">Pedidos</h1>
          <p className="text-sm text-admin-ink-soft">{orders.length} de {total} pedidos</p>
        </div>
        <button className="rounded-full border border-admin-ink/16 bg-white px-4 py-2.5 text-sm font-medium">
          Exportar CSV
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <AdminChip label="Todos" active={state === "Todos"} href={href({ state: "Todos" })} />
          {(["NUEVO", "COTIZADO", "CONFIRMADO", "ENVIADO", "ENTREGADO"] as OrderState[]).map((s) => (
            <AdminChip key={s} label={STATE_LABEL[s]} active={state === s} href={href({ state: s })} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <AdminChip label="Todos" active={type === "Todos"} href={href({ type: "Todos" })} />
          <AdminChip label="Personalizado" active={type === "PERSONALIZADO"} href={href({ type: "PERSONALIZADO" })} />
          <AdminChip label="Reserva de stock" active={type === "RESERVA_STOCK"} href={href({ type: "RESERVA_STOCK" })} />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-admin-ink/10 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-admin-ink/10 bg-admin-surface-soft text-left text-xs text-admin-faint">
              <th className="px-4 py-3 font-medium">Referencia</th>
              <th className="px-4 py-3 font-medium">Clienta</th>
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-admin-ink/6">
                <td className="px-4 py-3 font-mono text-xs">{o.ref}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium">{o.clientName}</span>
                    <span className="text-xs text-admin-ink-soft">{o.clientPhone}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-admin-ink-soft">{o.requestText.slice(0, 34)}…</td>
                <td className="px-4 py-3 text-admin-ink-soft">
                  {o.type === "PERSONALIZADO" ? "Personalizado" : "Reserva de stock"}
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATE_DOT[o.state] }} />
                    {STATE_LABEL[o.state]}
                  </span>
                </td>
                <td className="px-4 py-3 text-admin-ink-soft">
                  {o.createdAt.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/pedidos/${o.id}`} className="font-medium text-admin-link">Abrir</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="p-12 text-center text-admin-ink-soft">Ningún pedido con estos filtros</div>
        )}
      </div>
    </div>
  );
}
