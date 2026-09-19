"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { googleSignIn } from "./actions";

export function AuthTabs() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "registro">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/cuenta/login", {
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
    router.push("/cuenta");
    router.refresh();
  }

  async function onRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/cuenta/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
        newsletterOptIn: form.get("newsletter") === "on",
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se ha podido crear la cuenta");
      return;
    }
    router.push("/cuenta");
    router.refresh();
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-5 py-14 md:px-0">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-serif text-[28px] font-normal">Tu cuenta de Mundolana</h1>
        <p className="text-[14px] font-light text-ink/75">
          Sirve para seguir tus encargos y guardar favoritos. No hace falta para pedir: también puedes escribirme
          sin más.
        </p>
      </div>

      <form action={googleSignIn}>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2.5 rounded-full border border-ink/16 bg-white px-6 py-3 text-sm font-medium text-ink"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.09-1.8 2.73v2.27h2.92c1.7-1.57 2.68-3.88 2.68-6.64Z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.17l-2.92-2.27c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.34C2.44 15.98 5.48 18 9 18Z" />
            <path fill="#FBBC05" d="M3.97 10.71a5.4 5.4 0 0 1 0-3.42V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.34Z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.95l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58Z" />
          </svg>
          Continuar con Google
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs text-ink/45">
        <span className="h-px flex-1 bg-ink/12" />
        o con tu email
        <span className="h-px flex-1 bg-ink/12" />
      </div>

      <div className="flex rounded-full bg-cream p-1">
        <button
          onClick={() => setTab("login")}
          className="flex-1 rounded-full py-2.5 text-sm font-medium"
          style={tab === "login" ? { background: "#fff", boxShadow: "0 2px 6px rgba(74,63,59,.12)" } : {}}
        >
          Entrar
        </button>
        <button
          onClick={() => setTab("registro")}
          className="flex-1 rounded-full py-2.5 text-sm font-medium"
          style={tab === "registro" ? { background: "#fff", boxShadow: "0 2px 6px rgba(74,63,59,.12)" } : {}}
        >
          Crear cuenta
        </button>
      </div>

      {error && <p className="text-center text-sm text-admin-danger">{error}</p>}

      {tab === "login" ? (
        <form onSubmit={onLogin} className="flex flex-col gap-4">
          <input name="email" type="email" required placeholder="Email" className="rounded-lg border border-ink/16 bg-white px-4 py-3 text-sm outline-none" />
          <input name="password" type="password" required placeholder="Contraseña" className="rounded-lg border border-ink/16 bg-white px-4 py-3 text-sm outline-none" />
          <button type="submit" disabled={loading} className="rounded-full bg-pink px-6 py-3.5 text-[14.5px] font-medium disabled:opacity-60">
            {loading ? "Entrando…" : "Entrar"}
          </button>
          <Link href="/acceso/recuperar" className="text-center text-xs text-ink/60 underline">
            ¿Has olvidado tu contraseña?
          </Link>
        </form>
      ) : (
        <form onSubmit={onRegister} className="flex flex-col gap-4">
          <input name="name" required placeholder="Nombre" className="rounded-lg border border-ink/16 bg-white px-4 py-3 text-sm outline-none" />
          <input name="email" type="email" required placeholder="Email" className="rounded-lg border border-ink/16 bg-white px-4 py-3 text-sm outline-none" />
          <input name="password" type="password" required minLength={8} placeholder="Mínimo 8 caracteres" className="rounded-lg border border-ink/16 bg-white px-4 py-3 text-sm outline-none" />
          <label className="flex items-center gap-2 text-[13px] text-ink/75">
            <input name="newsletter" type="checkbox" defaultChecked className="accent-pink" />
            Quiero recibir avisos de nuevos productos por email (opcional, un correo al mes como mucho)
          </label>
          <button type="submit" disabled={loading} className="rounded-full bg-pink px-6 py-3.5 text-[14.5px] font-medium disabled:opacity-60">
            {loading ? "Creando cuenta…" : "Crear cuenta"}
          </button>
          <p className="text-center text-xs text-ink/55">
            Al crear la cuenta aceptas el aviso legal y la política de privacidad.
          </p>
        </form>
      )}
    </div>
  );
}
