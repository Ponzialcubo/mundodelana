"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se ha podido iniciar sesión");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-admin-canvas px-5">
      <div className="flex w-full max-w-sm flex-col gap-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-pink font-serif text-sm font-medium text-admin-ink">
            m
          </span>
          <span className="font-serif text-lg font-medium text-admin-ink">Mundodelana · Panel</span>
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-2xl font-normal text-admin-ink">Acceso al panel</h1>
          <p className="text-sm text-admin-ink-soft">Solo para la administradora de la tienda.</p>
        </div>

        {error && <p className="text-sm text-admin-danger">{error}</p>}

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-admin-ink/85">Usuario o email</span>
            <input
              name="email"
              type="email"
              required
              placeholder="elvira@mundodelana.es"
              className="rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-3 text-sm text-admin-ink outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-admin-ink/85">Contraseña</span>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-3 text-sm text-admin-ink outline-none"
            />
          </label>
          <label className="flex items-center gap-2 text-[13px] text-admin-ink-soft">
            <input type="checkbox" className="accent-pink" />
            No cerrar sesión
          </label>
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-pink px-6 py-3.5 text-[14.5px] font-medium text-admin-ink disabled:opacity-60"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <span className="text-center text-xs text-admin-faint">Sesión protegida</span>
      </div>
    </div>
  );
}
