import { prisma } from "@/lib/prisma";
import { MessagesInbox } from "@/components/admin/MessagesInbox";

export default async function AdminMensajesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { customer: { select: { name: true, email: true, phone: true } } },
  });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 p-5 md:p-9">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-2xl font-normal">Mensajes</h1>
        <p className="text-sm text-admin-ink-soft">
          Lo que te escriben desde «Contacto» y desde «Mi cuenta». Si la persona tiene cuenta, tu respuesta le aparece en su
          área de cliente; si no, contéstale por WhatsApp o email con los botones.
        </p>
      </div>
      <MessagesInbox
        messages={messages.map((m) => ({
          id: m.id,
          name: m.customer?.name ?? m.name,
          contact: m.contact,
          phone: m.customer?.phone ?? null,
          message: m.message,
          createdAt: m.createdAt.toISOString(),
          read: Boolean(m.readAt),
          reply: m.reply,
          hasAccount: Boolean(m.customerId),
        }))}
      />
    </div>
  );
}
