"use client";

import Link from "next/link";
import { useState } from "react";

export function RecuperarForm() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    await fetch("/api/cuenta/recuperar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email") }),
    });
    setLoading(false);
    // Same message whether or not the account exists — the form never
    // reveals that.
    setSent(true);
  }

  if (sent) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-5 py-14 text-center md:px-0">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sage text-2xl text-white">✓</span>
        <h1 className="font-serif text-[26px] font-normal">Revisa tu correo</h1>
        <p className="text-[14px] font-light text-ink/75">
          Si existe una cuenta con ese email, te hemos enviado un enlace para elegir una nueva contraseña. Caduca en
          1 hora.
        </p>
        <Link href="/acceso" className="text-sm font-medium text-pink-deep underline">
          Volver a entrar
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-5 py-14 md:px-0">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-serif text-[28px] font-normal">Recuperar contraseña</h1>
        <p className="text-[14px] font-light text-ink/75">
          Escribe el email de tu cuenta y te mandamos un enlace para elegir una contraseña nueva.
        </p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <input name="email" type="email" required placeholder="Email" className="rounded-lg border border-ink/16 bg-white px-4 py-3 text-sm outline-none" />
        <button type="submit" disabled={loading} className="rounded-full bg-pink px-6 py-3.5 text-[14.5px] font-medium disabled:opacity-60">
          {loading ? "Enviando…" : "Enviar enlace"}
        </button>
        <Link href="/acceso" className="text-center text-xs text-ink/60 underline">
          Volver a entrar
        </Link>
      </form>
    </div>
  );
}
