import Link from "next/link";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { NewsletterToggle } from "@/components/public/NewsletterToggle";
import { LogoutButton } from "@/components/public/LogoutButton";
import { Footer } from "@/components/public/Footer";
import type { OrderState } from "@/generated/prisma";

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

const STATE_ACTION: Record<OrderState, string> = {
  NUEVO: "Ver",
  COTIZADO: "Ver",
  CONFIRMADO: "Ver",
  ENVIADO: "Seguir envío",
  ENTREGADO: "Pedir otra vez",
};

export default async function CuentaPage() {
  const customerId = await getCustomerSession();
  if (!customerId) redirect("/acceso");

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { orders: { orderBy: { createdAt: "desc" } } },
  });
  if (!customer) redirect("/acceso");

  return (
    <>
      <section className="flex flex-col gap-6 px-5 py-10 md:px-14 md:py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-pink font-serif text-lg font-medium">
              {customer.name[0]?.toUpperCase()}
            </span>
            <div className="flex flex-col">
              <h1 className="font-serif text-xl font-normal">Hola, {customer.name.split(" ")[0]}</h1>
              <span className="text-[13px] text-ink/60">
                {customer.email}
                {customer.phone ? ` · ${customer.phone}` : ""} · clienta desde{" "}
                {customer.createdAt.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
              </span>
            </div>
          </div>
          <LogoutButton />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_300px]">
          <div className="flex flex-col gap-3">
            {customer.orders.length === 0 && (
              <p className="rounded-xl border border-dashed border-ink/20 bg-white p-8 text-center text-sm text-ink/70">
                Todavía no tienes pedidos. <Link href="/encargo" className="font-medium text-pink-deep">Pide algo a medida</Link>.
              </p>
            )}
            {customer.orders.map((o) => (
              <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/8 bg-white p-5">
                <div className="flex flex-col gap-1">
                  <span className="font-serif text-base font-medium">{o.requestText.slice(0, 40)}{o.requestText.length > 40 ? "…" : ""}</span>
                  <span className="font-mono text-xs text-ink-soft">
                    {o.ref} · {o.createdAt.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 rounded-full border border-ink/12 bg-surface px-3 py-1 text-xs font-medium">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATE_DOT[o.state] }} />
                    {STATE_LABEL[o.state]}
                  </span>
                  <span className="text-sm font-medium text-pink-deep">{STATE_ACTION[o.state]}</span>
                </div>
              </div>
            ))}
          </div>

          <aside className="flex flex-col gap-4">
            <NewsletterToggle initialActive={customer.newsletterOptIn} />
            <div className="rounded-xl border border-ink/8 bg-white p-5 text-xs leading-relaxed text-ink/70">
              <p><strong>Nuevo</strong> · lo he recibido, te escribo pronto</p>
              <p><strong>Confirmado</strong> · detalles y precio cerrados</p>
              <p><strong>Enviado</strong> · en camino, con seguimiento</p>
              <p><strong>Entregado</strong> · ya en tus manos</p>
            </div>
            <div className="rounded-xl bg-cream p-5">
              <span className="font-serif text-base font-medium">¿Algo va mal con un pedido?</span>
              <p className="mt-1.5 text-xs text-ink/70">Escríbeme y lo miramos. Respondo de lunes a sábado.</p>
              <Link href="/contacto" className="mt-3 inline-block rounded-full bg-white px-4 py-2 text-xs font-medium">
                Contactar
              </Link>
            </div>
          </aside>
        </div>
      </section>
      <Footer />
    </>
  );
}
