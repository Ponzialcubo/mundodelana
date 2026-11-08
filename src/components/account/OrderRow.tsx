import Link from "next/link";
import type { OrderState } from "@/generated/prisma";
import { STATE_DOT, STATE_LABEL, formatDate } from "@/lib/order-state";

export function OrderRow({ order }: { order: { id: string; ref: string; requestText: string; state: OrderState; createdAt: Date } }) {
  return (
    <Link href={`/cuenta/pedidos/${order.id}`} className="flex items-center justify-between gap-3 rounded-2xl border border-ink/8 bg-white p-4 transition hover:shadow-[0_6px_20px_rgba(74,63,59,.07)] md:p-5">
      <span className="flex min-w-0 flex-col gap-1">
        <span className="truncate font-serif text-[16.5px]">{order.requestText}</span>
        <span className="text-[12.5px] text-ink/55">
          <span className="font-mono">{order.ref}</span> · {formatDate(order.createdAt)}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-[12px] font-medium">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATE_DOT[order.state] }} />
          {STATE_LABEL[order.state]}
        </span>
        <span className="text-ink/40" aria-hidden="true">›</span>
      </span>
    </Link>
  );
}
