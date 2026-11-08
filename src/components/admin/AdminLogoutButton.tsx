"use client";

import { useRouter } from "next/navigation";

export function AdminLogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button onClick={logout} className="self-start text-sm font-medium text-admin-link">
      Cerrar sesión
    </button>
  );
}
