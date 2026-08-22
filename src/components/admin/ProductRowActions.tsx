"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProductRowActions({ id, publicationStatus }: { id: string; publicationStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function archive() {
    setLoading(true);
    await fetch(`/api/admin/productos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicationStatus: "ARCHIVADO" }),
    });
    setLoading(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm("¿Eliminar este producto? No se puede deshacer.")) return;
    setLoading(true);
    await fetch(`/api/admin/productos/${id}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-3 text-sm">
      <Link href={`/admin/productos/${id}`} className="font-medium text-admin-link">
        Editar
      </Link>
      {publicationStatus !== "ARCHIVADO" && (
        <button onClick={archive} disabled={loading} className="text-admin-ink-soft disabled:opacity-50">
          Archivar
        </button>
      )}
      <button onClick={remove} disabled={loading} className="text-admin-danger disabled:opacity-50">
        Eliminar
      </button>
    </div>
  );
}
