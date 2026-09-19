import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { FooterWithSettings } from "@/components/public/FooterWithSettings";
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

const STATE_STEPS: OrderState[] = ["NUEVO", "COTIZADO", "CONFIRMADO", "ENVIADO", "ENTREGADO"];

export default async function PedidoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const customerId = await getCustomerSession();
  if (!customerId) redirect("/acceso");

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      referenceImages: true,
      budgetLines: true,
      product: { select: { name: true, slug: true, mainImage: true } },
    },
  });

  // Never distinguish "doesn't exist" from "belongs to someone else" — both
  // 404, so the order ID in the URL can't be used to probe other accounts.
  if (!order || order.customerId !== customerId) notFound();

  const currentStepIndex = STATE_STEPS.indexOf(order.state);
  const total = order.budgetLines.reduce((sum, line) => sum + Number(line.price), 0);

  return (
    <>
      <section className="mx-auto flex max-w-3xl flex-col gap-6 px-5 py-10 md:px-0 md:py-12">
        <Link href="/cuenta" className="text-sm text-ink/60 underline">
          ← Volver a mis pedidos
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-xs text-ink-soft">{order.ref}</span>
            <h1 className="font-serif text-2xl font-normal">
              {order.type === "PERSONALIZADO" ? "Encargo personalizado" : "Reserva de pieza en stock"}
            </h1>
            <span className="text-xs text-ink/55">
              Pedido el{" "}
              {order.createdAt.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
              {order.targetDate &&
                ` · Fecha objetivo: ${order.targetDate.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}`}
            </span>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-ink/12 bg-white px-3.5 py-1.5 text-xs font-medium">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATE_DOT[order.state] }} />
            {STATE_LABEL[order.state]}
          </span>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl border border-ink/8 bg-white p-4">
          {STATE_STEPS.map((step, i) => (
            <div key={step} className="flex flex-1 items-center gap-1.5">
              <div className="flex flex-1 flex-col items-center gap-1.5 whitespace-nowrap">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: i <= currentStepIndex ? STATE_DOT[order.state] : "#EFE7DE" }}
                />
                <span className={`text-[11px] ${i <= currentStepIndex ? "font-medium text-ink" : "text-ink/40"}`}>
                  {STATE_LABEL[step]}
                </span>
              </div>
              {i < STATE_STEPS.length - 1 && (
                <span
                  className="h-px flex-1"
                  style={{ background: i < currentStepIndex ? STATE_DOT[order.state] : "#EFE7DE" }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_280px]">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 rounded-xl border border-ink/8 bg-white p-5">
              <span className="font-serif text-base font-medium">Qué has pedido</span>
              <p className="text-sm font-light leading-relaxed text-ink/80">{order.requestText}</p>
              {order.product && (
                <Link
                  href={`/producto/${order.product.slug}`}
                  className="flex w-fit items-center gap-2.5 rounded-lg border border-ink/10 bg-surface px-3 py-2 text-xs font-medium"
                >
                  Ver ficha de &ldquo;{order.product.name}&rdquo;
                </Link>
              )}
            </div>

            {order.referenceImages.length > 0 && (
              <div className="flex flex-col gap-3 rounded-xl border border-ink/8 bg-white p-5">
                <span className="font-serif text-base font-medium">Fotos de referencia</span>
                <div className="grid grid-cols-3 gap-2.5">
                  {order.referenceImages.map((img) => (
                    <div key={img.id} className="relative aspect-square overflow-hidden rounded-lg">
                      <Image src={img.url} alt="Referencia del encargo" fill sizes="150px" className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {order.budgetLines.length > 0 && (
              <div className="flex flex-col gap-3 rounded-xl border border-ink/8 bg-white p-5">
                <span className="font-serif text-base font-medium">Presupuesto</span>
                <div className="flex flex-col gap-2">
                  {order.budgetLines.map((line) => (
                    <div key={line.id} className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="text-ink/80">{line.concept}</span>
                      <span className="whitespace-nowrap font-medium">{Number(line.price).toFixed(2)} €</span>
                    </div>
                  ))}
                  <div className="mt-1.5 flex items-baseline justify-between border-t border-ink/10 pt-2.5 text-sm font-medium">
                    <span>Total</span>
                    <span>{total.toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <aside className="flex flex-col gap-4">
            <div className="rounded-xl bg-cream p-5">
              <span className="font-serif text-base font-medium">¿Alguna duda con este pedido?</span>
              <p className="mt-1.5 text-xs text-ink/70">
                Escríbeme mencionando la referencia {order.ref} y lo miramos.
              </p>
              <Link href="/contacto" className="mt-3 inline-block rounded-full bg-white px-4 py-2 text-xs font-medium">
                Contactar
              </Link>
            </div>
          </aside>
        </div>
      </section>
      <FooterWithSettings />
    </>
  );
}
