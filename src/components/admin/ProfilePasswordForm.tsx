"use client";

import { useState } from "react";

export function ProfilePasswordForm() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    const form = new FormData(e.currentTarget);
    const newPassword = form.get("newPassword") as string;
    const repeat = form.get("repeatPassword") as string;

    if (newPassword !== repeat) {
      setError("Las contraseñas nuevas no coinciden");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/admin/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: form.get("currentPassword"), newPassword }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se ha podido guardar");
      return;
    }
    setSuccess(true);
    (e.target as HTMLFormElement).reset();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {error && <p className="text-sm text-admin-danger">{error}</p>}
      {success && <p className="text-sm text-sage-deep">Contraseña actualizada.</p>}
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-admin-ink/85">Contraseña actual</span>
        <input name="currentPassword" type="password" required placeholder="••••••••" className="rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-2.5 text-sm outline-none" />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-admin-ink/85">Nueva contraseña</span>
        <input name="newPassword" type="password" required minLength={8} placeholder="Mínimo 8 caracteres" className="rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-2.5 text-sm outline-none" />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-admin-ink/85">Repite la nueva contraseña</span>
        <input name="repeatPassword" type="password" required placeholder="••••••••" className="rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-2.5 text-sm outline-none" />
      </label>
      <span className="text-xs text-admin-faint">Al guardar se cierran las sesiones abiertas en otros dispositivos.</span>
      <button type="submit" disabled={loading} className="w-fit rounded-full bg-pink px-5 py-2.5 text-sm font-medium disabled:opacity-60">
        {loading ? "Guardando…" : "Guardar contraseña"}
      </button>
    </form>
  );
}
