import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OrderStateChips, OrderNotes } from "@/components/admin/OrderDetailPanel";

export default async function AdminPedidoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { budgetLines: true, referenceImages: true, product: true },
  });
  if (!order) notFound();

  const total = order.budgetLines.reduce((sum, l) => sum + Number(l.price), 0);
  const firstName = order.clientName.split(" ")[0];
  const phoneDigits = order.clientPhone.replace(/\D/g, "");

  return (
    <div className="flex flex-col gap-6 p-6 md:p-9">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/pedidos" className="text-sm text-admin-ink-soft">← Volver a pedidos</Link>
          <span className="font-mono text-sm font-medium">{order.ref}</span>
        </div>
        <a
          href={`https://wa.me/34${phoneDigits}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-sage px-4 py-2.5 text-sm font-medium text-white"
        >
          Abrir WhatsApp con {firstName}
        </a>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 rounded-xl border border-admin-ink/10 bg-white p-6">
            <span className="font-serif text-base font-medium">Qué pide</span>
            <p className="text-sm leading-relaxed text-admin-ink/85">{order.requestText}</p>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-admin-ink-soft">
              <span>Recibido: {order.createdAt.toLocaleString("es-ES", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
              <span>Tipo: {order.type === "PERSONALIZADO" ? "personalizado" : "reserva de stock"}</span>
              {order.targetDate && (
                <span>Fecha objetivo: {order.targetDate.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-admin-ink/10 bg-white p-6">
            <span className="font-serif text-base font-medium">Fotos de referencia</span>
            {order.referenceImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {order.referenceImages.map((img) => (
                  <div key={img.id} className="h-24 rounded-lg" style={{ background: "repeating-linear-gradient(45deg,#EDEBE8 0 9px,#F7F6F4 9px 18px)" }} />
                ))}
              </div>
            ) : (
              <span className="text-sm text-admin-faint">Sin más fotos</span>
            )}
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-admin-ink/10 bg-white p-6">
            <span className="font-serif text-base font-medium">Notas internas</span>
            <OrderNotes id={order.id} initialNotes={order.internalNotes ?? ""} />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-xl border border-admin-ink/10 bg-white p-6">
            <span className="font-serif text-base font-medium">Estado del pedido</span>
            <OrderStateChips id={order.id} current={order.state} />
            <span className="text-xs text-admin-faint">
              Al cambiar el estado, la clienta lo ve en su cuenta. No se envía email automático.
            </span>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-admin-ink/10 bg-white p-6">
            <span className="font-serif text-base font-medium">Contacto</span>
            <span className="text-sm">{order.clientName}</span>
            <span className="text-sm text-admin-ink-soft">{order.clientPhone}</span>
            {order.clientEmail && <span className="text-sm text-admin-ink-soft">{order.clientEmail}</span>}
            <div className="mt-2 flex gap-2">
              <a href={`https://wa.me/34${phoneDigits}`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-admin-ink/16 px-3 py-1.5 text-xs font-medium">
                Abrir WhatsApp
              </a>
              {order.clientEmail && (
                <button className="rounded-full border border-admin-ink/16 px-3 py-1.5 text-xs font-medium">Copiar email</button>
              )}
            </div>
          </div>

          {order.budgetLines.length > 0 && (
            <div className="flex flex-col gap-2 rounded-xl border border-admin-ink/10 bg-white p-6">
              <span className="font-serif text-base font-medium">Presupuesto</span>
              {order.budgetLines.map((l) => (
                <div key={l.id} className="flex justify-between text-sm">
                  <span className="text-admin-ink-soft">{l.concept}</span>
                  <span>{Number(l.price).toFixed(2)} €</span>
                </div>
              ))}
              <div className="mt-1 flex justify-between border-t border-admin-ink/10 pt-2 text-sm font-medium">
                <span>Total</span>
                <span>{total.toFixed(2)} €</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
