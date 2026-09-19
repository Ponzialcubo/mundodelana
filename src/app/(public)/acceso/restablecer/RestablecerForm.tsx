"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function RestablecerForm({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/cuenta/restablecer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: form.get("password") }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se ha podido cambiar la contraseña");
      return;
    }
    router.push("/cuenta");
    router.refresh();
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-5 py-14 md:px-0">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-serif text-[28px] font-normal">Elige tu nueva contraseña</h1>
      </div>
      {error && <p className="text-center text-sm text-admin-danger">{error}</p>}
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="Mínimo 8 caracteres"
          className="rounded-lg border border-ink/16 bg-white px-4 py-3 text-sm outline-none"
        />
        <button type="submit" disabled={loading} className="rounded-full bg-pink px-6 py-3.5 text-[14.5px] font-medium disabled:opacity-60">
          {loading ? "Guardando…" : "Guardar contraseña"}
        </button>
        {error && (
          <Link href="/acceso/recuperar" className="text-center text-xs text-ink/60 underline">
            Pedir un enlace nuevo
          </Link>
        )}
      </form>
    </div>
  );
}
