"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProfileForm({
  initialName,
  initialPhone,
  hasPassword,
}: {
  initialName: string;
  initialPhone: string;
  hasPassword: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  async function onSaveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError("");
    setProfileSaved(false);
    const res = await fetch("/api/cuenta/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });
    setProfileSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setProfileError(data.error ?? "No se ha podido guardar");
      return;
    }
    setProfileSaved(true);
    router.refresh();
  }

  async function onSavePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordError("");
    setPasswordSaved(false);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/cuenta/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: form.get("currentPassword"),
        newPassword: form.get("newPassword"),
      }),
    });
    setPasswordSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setPasswordError(data.error ?? "No se ha podido cambiar la contraseña");
      return;
    }
    setPasswordSaved(true);
    (e.target as HTMLFormElement).reset();
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-ink/8 bg-white p-5">
      <span className="font-serif text-base font-medium">Mis datos</span>

      <form onSubmit={onSaveProfile} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-ink/70">Nombre</span>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setProfileSaved(false);
            }}
            className="rounded-lg border border-ink/16 bg-white px-3.5 py-2.5 text-sm outline-none"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-ink/70">Teléfono</span>
          <input
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setProfileSaved(false);
            }}
            placeholder="600 000 000"
            className="rounded-lg border border-ink/16 bg-white px-3.5 py-2.5 text-sm outline-none"
          />
        </label>
        {profileError && <p className="text-xs text-admin-danger">{profileError}</p>}
        {profileSaved && <p className="text-xs text-sage-deep">Guardado.</p>}
        <button
          type="submit"
          disabled={profileSaving}
          className="self-start rounded-full border border-ink/16 bg-white px-4 py-2 text-xs font-medium disabled:opacity-60"
        >
          {profileSaving ? "Guardando…" : "Guardar datos"}
        </button>
      </form>

      <div className="border-t border-ink/8 pt-4">
        {!passwordOpen ? (
          <button onClick={() => setPasswordOpen(true)} className="text-xs font-medium text-pink-deep underline">
            {hasPassword ? "Cambiar contraseña" : "Establecer una contraseña"}
          </button>
        ) : (
          <form onSubmit={onSavePassword} className="flex flex-col gap-3">
            <span className="text-xs font-medium text-ink/70">
              {hasPassword ? "Cambiar contraseña" : "Establecer una contraseña"}
            </span>
            {hasPassword && (
              <input
                name="currentPassword"
                type="password"
                required
                placeholder="Contraseña actual"
                className="rounded-lg border border-ink/16 bg-white px-3.5 py-2.5 text-sm outline-none"
              />
            )}
            <input
              name="newPassword"
              type="password"
              required
              minLength={8}
              placeholder="Nueva contraseña (mín. 8 caracteres)"
              className="rounded-lg border border-ink/16 bg-white px-3.5 py-2.5 text-sm outline-none"
            />
            {passwordError && <p className="text-xs text-admin-danger">{passwordError}</p>}
            {passwordSaved && <p className="text-xs text-sage-deep">Contraseña actualizada.</p>}
            <button
              type="submit"
              disabled={passwordSaving}
              className="self-start rounded-full border border-ink/16 bg-white px-4 py-2 text-xs font-medium disabled:opacity-60"
            >
              {passwordSaving ? "Guardando…" : "Guardar contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
