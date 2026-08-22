"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CategoryRowActions({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function remove() {
    if (!confirm("¿Eliminar esta categoría?")) return;
    setLoading(true);
    await fetch(`/api/admin/categorias/${id}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-3 text-sm">
      <Link href={`/admin/categorias/${id}`} className="font-medium text-admin-link">Editar</Link>
      <button onClick={remove} disabled={loading} className="text-admin-danger disabled:opacity-50">Eliminar</button>
    </div>
  );
}
