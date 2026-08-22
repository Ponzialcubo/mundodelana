"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/cuenta/logout", { method: "POST" });
    router.push("/acceso");
    router.refresh();
  }

  return (
    <button onClick={logout} className="rounded-full border border-ink/22 bg-white px-5 py-2.5 text-sm font-medium">
      Cerrar sesión
    </button>
  );
}
