"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ContactForm({
  defaultName = "",
  defaultContact = "",
  compact = false,
  onSent,
}: {
  defaultName?: string;
  defaultContact?: string;
  /** Inside the account: name and contact are already known, only the message is asked. */
  compact?: boolean;
  onSent?: () => void;
} = {}) {
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          contact: form.get("contact"),
          message: form.get("message"),
        }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
      onSent?.();
      if (compact) router.refresh();
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-sage/40 bg-sage/10 p-6">
        <span className="font-serif text-xl">¡Mensaje enviado!</span>
        <span className="text-sm text-ink/75">Te contesto en cuanto pueda, normalmente el mismo día.</span>
        {compact && (
          <button type="button" onClick={() => setSent(false)} className="mt-1 w-fit text-sm font-medium text-pink-deep underline">
            Escribir otro mensaje
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {compact && (
        <>
          <input type="hidden" name="name" value={defaultName} />
          <input type="hidden" name="contact" value={defaultContact} />
        </>
      )}
      <label className={compact ? "hidden" : "flex flex-col gap-1.5"}>
        <span className="text-[13px] font-medium text-ink/80">Tu nombre</span>
        <input
          name={compact ? undefined : "name"}
          defaultValue={defaultName}
          required={!compact}
          placeholder="María García"
          className="rounded-lg border border-ink/16 bg-white px-4 py-3 text-sm outline-none"
        />
      </label>
      <label className={compact ? "hidden" : "flex flex-col gap-1.5"}>
        <span className="text-[13px] font-medium text-ink/80">Email o teléfono</span>
        <input
          name={compact ? undefined : "contact"}
          defaultValue={defaultContact}
          required={!compact}
          placeholder="maria@correo.com o 600 000 000"
          className="rounded-lg border border-ink/16 bg-white px-4 py-3 text-sm outline-none"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-ink/80">Tu mensaje</span>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="Cuéntame qué necesitas: pieza, colores, para cuándo…"
          className="rounded-lg border border-ink/16 bg-white px-4 py-3 text-sm outline-none"
        />
      </label>
      <span className="text-xs text-ink/55">Solo uso tus datos para contestarte. Nada de listas de correo.</span>
      {error && <span className="text-xs text-admin-danger">Algo ha fallado, inténtalo de nuevo.</span>}
      <button
        type="submit"
        disabled={loading}
        className="mt-1 rounded-full bg-pink px-6 py-3.5 text-[14.5px] font-medium disabled:opacity-60"
      >
        {loading ? "Enviando…" : "Enviar mensaje"}
      </button>
    </form>
  );
}
