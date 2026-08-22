"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SubscriberRowAction({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/admin/suscriptores/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: active ? "BAJA" : "ACTIVO" }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button onClick={toggle} disabled={loading} className="text-sm font-medium text-admin-link disabled:opacity-50">
      {active ? "Dar de baja" : "Reactivar"}
    </button>
  );
}
