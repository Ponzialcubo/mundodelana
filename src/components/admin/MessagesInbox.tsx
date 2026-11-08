"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Message = {
  id: string;
  name: string;
  contact: string;
  phone: string | null;
  message: string;
  createdAt: string;
  read: boolean;
  reply: string | null;
  hasAccount: boolean;
};

const when = (iso: string) =>
  new Date(iso).toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid" });

/** Digits of a Spanish phone written any way, ready for wa.me (null if it isn't one). */
function waNumber(value: string | null) {
  const digits = value?.replace(/\D/g, "") ?? "";
  if (digits.length === 9) return `34${digits}`;
  if (digits.length === 11 && digits.startsWith("34")) return digits;
  return null;
}

export function MessagesInbox({ messages }: { messages: Message[] }) {
  const [filter, setFilter] = useState<"pending" | "all">("pending");
  const pending = messages.filter((m) => !m.reply && !m.read);
  const shown = filter === "pending" ? pending : messages;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex w-fit rounded-full bg-admin-bg p-1 text-sm">
        {(
          [
            ["pending", `Sin atender (${pending.length})`],
            ["all", `Todos (${messages.length})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-full px-4 py-1.5 font-medium ${filter === key ? "bg-white shadow-sm" : "text-admin-ink-soft"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {shown.length === 0 && (
        <p className="rounded-xl border border-dashed border-admin-ink/20 bg-white p-8 text-center text-sm text-admin-ink-soft">
          {filter === "pending" ? "Todo atendido. ¡Bien!" : "Todavía no hay mensajes."}
        </p>
      )}
      {shown.map((m) => (
        <MessageCard key={m.id} message={m} />
      ))}
    </div>
  );
}

function MessageCard({ message: m }: { message: Message }) {
  const router = useRouter();
  const [open, setOpen] = useState(!m.read && !m.reply);
  const [reply, setReply] = useState(m.reply ?? "");
  const [saving, setSaving] = useState(false);
  const wa = waNumber(m.phone) ?? waNumber(m.contact);
  const email = m.contact.includes("@") ? m.contact : null;

  async function patch(body: object) {
    setSaving(true);
    await fetch(`/api/admin/mensajes/${m.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className={`flex flex-col gap-3 rounded-xl border bg-white p-4 md:p-5 ${!m.read && !m.reply ? "border-pink" : "border-admin-ink/10"}`}>
      <button type="button" onClick={() => setOpen(!open)} className="flex items-start justify-between gap-3 text-left">
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="flex items-center gap-2 text-sm font-medium">
            {!m.read && !m.reply && <span className="h-2 w-2 shrink-0 rounded-full bg-pink-deep" />}
            {m.name}
            {m.hasAccount && <span className="rounded-full bg-admin-bg px-2 py-0.5 text-[10.5px] font-medium text-admin-ink-soft">Con cuenta</span>}
          </span>
          <span className={`text-sm text-admin-ink-soft ${open ? "" : "line-clamp-1"}`}>{open ? m.contact : m.message}</span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-xs text-admin-faint">{when(m.createdAt)}</span>
          {m.reply && <span className="text-[11px] font-medium text-admin-link">✓ Respondido</span>}
        </span>
      </button>

      {open && (
        <>
          <p className="whitespace-pre-line rounded-lg bg-admin-bg px-4 py-3 text-sm leading-relaxed">{m.message}</p>

          <div className="flex flex-wrap gap-2">
            {wa && (
              <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="rounded-full bg-[#25D366] px-4 py-2 text-sm font-medium text-white">
                WhatsApp
              </a>
            )}
            {email && (
              <a href={`mailto:${email}?subject=${encodeURIComponent("Tu mensaje a Mundolana")}`} className="rounded-full border border-admin-ink/16 px-4 py-2 text-sm font-medium">
                Email
              </a>
            )}
            {!m.read && !m.reply && (
              <button type="button" onClick={() => patch({ read: true })} disabled={saving} className="rounded-full border border-admin-ink/16 px-4 py-2 text-sm font-medium">
                Marcar como atendido
              </button>
            )}
          </div>

          {m.hasAccount ? (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-admin-ink-soft">{m.reply ? "Tu respuesta (la ve en su cuenta)" : "Responder en su cuenta"}</span>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                placeholder="Escribe tu respuesta…"
                className="rounded-lg border border-admin-ink/14 px-3 py-2.5 text-sm outline-none"
              />
              <button
                type="button"
                onClick={() => patch({ reply })}
                disabled={saving || !reply.trim() || reply.trim() === m.reply}
                className="w-fit rounded-full bg-admin-ink px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving ? "Enviando…" : m.reply ? "Actualizar respuesta" : "Enviar respuesta"}
              </button>
            </div>
          ) : (
            <span className="text-xs text-admin-ink-soft">No tiene cuenta: contéstale por WhatsApp o email.</span>
          )}
        </>
      )}
    </div>
  );
}
