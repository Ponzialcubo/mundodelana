import Link from "next/link";
import { getCustomerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { OrderRow } from "@/components/account/OrderRow";
import { STATE_DOT, STATE_HINT, STATE_LABEL, STATE_STEPS } from "@/lib/order-state";

export const metadata = { title: "Mis pedidos", robots: { index: false } };

export default async function PedidosPage() {
  const customerId = (await getCustomerSession())!;
  const orders = await prisma.order.findMany({ where: { customerId }, orderBy: { createdAt: "desc" } });

  return (
    <div className="flex flex-col gap-5 pt-6 md:pt-0">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-[28px] font-normal md:text-[34px]">Mis pedidos</h1>
        <p className="text-[14px] text-ink/60">Tus encargos y reservas, con el punto en el que está cada uno.</p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-10 text-center">
          <span className="font-serif text-[20px]">Todavía no tienes pedidos</span>
          <span className="max-w-sm text-[14px] text-ink/65">Cuando encargues algo con tu cuenta iniciada, aparecerá aquí.</span>
          <Link href="/encargo" className="mt-1 rounded-full bg-pink px-5 py-3 text-[14px] font-medium">
            Pedir algo a medida
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {orders.map((o) => (
            <OrderRow key={o.id} order={o} />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 rounded-2xl bg-cream p-5">
        <span className="font-serif text-[17px]">Qué significa cada estado</span>
        <ul className="grid grid-cols-1 gap-1.5 text-[13px] text-ink/75 md:grid-cols-2">
          {STATE_STEPS.map((s) => (
            <li key={s} className="flex items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: STATE_DOT[s] }} />
              <strong className="font-medium text-ink">{STATE_LABEL[s]}</strong> · {STATE_HINT[s]}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
