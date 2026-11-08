import Link from "next/link";
import { getCustomerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { OrderRow } from "@/components/account/OrderRow";
import { STATE_HINT, STATE_LABEL, formatDate } from "@/lib/order-state";

export const metadata = { title: "Mi cuenta", robots: { index: false } };

export default async function CuentaPage() {
  const customerId = (await getCustomerSession())!;
  const [customer, orders, messages, unread] = await Promise.all([
    prisma.customer.findUniqueOrThrow({ where: { id: customerId }, select: { name: true, createdAt: true } }),
    prisma.order.findMany({ where: { customerId }, orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.contactMessage.findMany({ where: { customerId }, orderBy: { createdAt: "desc" }, take: 1 }),
    prisma.contactMessage.count({ where: { customerId, repliedAt: { not: null }, replySeenAt: null } }),
  ]);
  const active = orders.find((o) => o.state !== "ENTREGADO");
  const lastMessage = messages[0];

  return (
    <div className="flex flex-col gap-6 pt-6 md:pt-0">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-[30px] font-normal leading-tight md:text-[38px]">Hola, {customer.name.split(" ")[0]}</h1>
        <p className="text-[14px] text-ink/60">Clienta desde {customer.createdAt.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}</p>
      </div>

      {unread > 0 && (
        <Link href="/cuenta/mensajes" className="flex items-center justify-between gap-3 rounded-2xl bg-pink/40 p-5">
          <span className="flex flex-col">
            <span className="font-serif text-[19px]">Elvira te ha respondido</span>
            <span className="text-[13.5px] text-ink/70">{unread === 1 ? "Tienes 1 respuesta nueva" : `Tienes ${unread} respuestas nuevas`}</span>
          </span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-surface">→</span>
        </Link>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-2xl bg-white p-5 md:p-6">
          <span className="text-[11.5px] font-medium uppercase tracking-[.16em] text-ink-soft">Tu pedido en curso</span>
          {active ? (
            <>
              <span className="font-serif text-[20px] leading-snug">{active.requestText.slice(0, 70)}{active.requestText.length > 70 ? "…" : ""}</span>
              <span className="text-[13.5px] text-ink/70">
                <strong className="font-medium text-ink">{STATE_LABEL[active.state]}</strong> · {STATE_HINT[active.state]}
              </span>
              <Link href={`/cuenta/pedidos/${active.id}`} className="mt-1 w-fit rounded-full bg-ink px-5 py-2.5 text-[13.5px] font-medium text-surface">
                Ver el pedido
              </Link>
            </>
          ) : (
            <>
              <span className="text-[14.5px] text-ink/70">No tienes ningún pedido en marcha.</span>
              <Link href="/encargo" className="mt-1 w-fit rounded-full bg-pink px-5 py-2.5 text-[13.5px] font-medium">
                Pedir algo a medida
              </Link>
            </>
          )}
        </div>

        <div className="flex flex-col gap-3 rounded-2xl bg-white p-5 md:p-6">
          <span className="text-[11.5px] font-medium uppercase tracking-[.16em] text-ink-soft">Mensajes con Elvira</span>
          {lastMessage ? (
            <>
              <span className="line-clamp-2 text-[14.5px] text-ink/80">«{lastMessage.message}»</span>
              <span className="text-[12.5px] text-ink/55">
                {formatDate(lastMessage.createdAt)} · {lastMessage.reply ? "Respondido" : "Pendiente de respuesta"}
              </span>
            </>
          ) : (
            <span className="text-[14.5px] text-ink/70">¿Tienes alguna duda? Escríbeme desde aquí y verás mi respuesta en esta sección.</span>
          )}
          <Link href="/cuenta/mensajes" className="mt-1 w-fit rounded-full border border-ink/18 px-5 py-2.5 text-[13.5px] font-medium">
            {lastMessage ? "Ver mensajes" : "Escribir a Elvira"}
          </Link>
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-end justify-between">
          <h2 className="font-serif text-[22px] font-normal">Últimos pedidos</h2>
          {orders.length > 0 && (
            <Link href="/cuenta/pedidos" className="border-b border-pink pb-0.5 text-[13.5px] font-medium">
              Ver todos
            </Link>
          )}
        </div>
        {orders.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-ink/20 bg-white p-8 text-center text-[14px] text-ink/70">
            Aquí verás tus encargos y en qué punto están.
          </p>
        ) : (
          orders.map((o) => <OrderRow key={o.id} order={o} />)
        )}
      </section>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {[
          { href: "/catalogo", title: "Ver la tienda", text: "Todas las piezas" },
          { href: "/encargo", title: "Pedir a medida", text: "Cuéntame tu idea" },
          { href: "/faq", title: "Dudas", text: "Plazos, envíos y pagos" },
        ].map((l) => (
          <Link key={l.href} href={l.href} className="flex flex-col rounded-2xl bg-cream p-4 md:p-5">
            <span className="font-serif text-[17px]">{l.title}</span>
            <span className="text-[12.5px] text-ink/60">{l.text}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
