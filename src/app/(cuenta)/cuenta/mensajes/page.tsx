import { getCustomerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ContactForm } from "@/components/public/ContactForm";
import { formatDate } from "@/lib/order-state";

export const metadata = { title: "Mensajes", robots: { index: false } };

const time = (d: Date) => d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid" });

export default async function MensajesPage() {
  const customerId = (await getCustomerSession())!;
  const [customer, messages] = await Promise.all([
    prisma.customer.findUniqueOrThrow({ where: { id: customerId }, select: { name: true, email: true } }),
    prisma.contactMessage.findMany({ where: { customerId }, orderBy: { createdAt: "asc" } }),
  ]);

  // Opening this page counts as reading Elvira's replies.
  await prisma.contactMessage.updateMany({ where: { customerId, repliedAt: { not: null }, replySeenAt: null }, data: { replySeenAt: new Date() } });

  return (
    <div className="flex flex-col gap-5 pt-6 md:pt-0">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-[28px] font-normal md:text-[34px]">Mensajes con Elvira</h1>
        <p className="text-[14px] text-ink/60">Todo lo que me has escrito desde la web y mis respuestas.</p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 md:p-6">
        {messages.length === 0 && <p className="py-6 text-center text-[14px] text-ink/60">Aún no me has escrito. ¡Pregunta lo que quieras!</p>}
        {messages.map((m) => (
          <div key={m.id} className="flex flex-col gap-2.5">
            <span className="self-center text-[11.5px] text-ink/45">{formatDate(m.createdAt)}</span>
            <div className="ml-auto flex max-w-[85%] flex-col gap-1 rounded-2xl rounded-br-md bg-pink/35 px-4 py-3">
              <p className="whitespace-pre-line text-[14.5px] leading-relaxed">{m.message}</p>
              <span className="self-end text-[11px] text-ink/50">{time(m.createdAt)}</span>
            </div>
            {m.reply ? (
              <div className="flex max-w-[85%] items-end gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage/40 font-serif text-sm">E</span>
                <div className="flex flex-col gap-1 rounded-2xl rounded-bl-md bg-cream px-4 py-3">
                  <span className="text-[11.5px] font-medium text-ink/60">Elvira</span>
                  <p className="whitespace-pre-line text-[14.5px] leading-relaxed">{m.reply}</p>
                  {m.repliedAt && <span className="self-end text-[11px] text-ink/50">{formatDate(m.repliedAt)} · {time(m.repliedAt)}</span>}
                </div>
              </div>
            ) : (
              <span className="text-[12px] text-ink/50">Pendiente de respuesta · contesto en menos de 24 h laborables</span>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl bg-white p-5 md:p-6">
        <span className="font-serif text-[19px]">Nuevo mensaje</span>
        <ContactForm compact defaultName={customer.name} defaultContact={customer.email} />
      </div>
    </div>
  );
}
