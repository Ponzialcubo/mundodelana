"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
        <h1 className="font-serif text-[28px] font-normal">Tu cuenta de Mundodelana</h1>
        <p className="text-[14px] font-light text-ink/75">
          Sirve para seguir tus encargos y guardar favoritos. No hace falta para pedir: también puedes escribirme
          sin más.
        </p>
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
