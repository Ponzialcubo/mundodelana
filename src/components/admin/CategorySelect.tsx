"use client";

import { useRouter } from "next/navigation";

/** Category filter as a dropdown: one line instead of a row of chips. */
export function CategorySelect({ value, options }: { value: string; options: string[] }) {
  const router = useRouter();
  return (
    <select
      value={value}
      onChange={(e) => {
        const params = new URLSearchParams(window.location.search);
        if (e.target.value === "Todas") params.delete("cat");
        else params.set("cat", e.target.value);
        params.delete("pagina");
        router.push(`/admin/productos?${params.toString()}`);
      }}
      className="rounded-full border border-admin-ink/16 bg-admin-bg px-4 py-2.5 text-[16px] outline-none md:w-60 md:text-sm"
      aria-label="Categoría"
    >
      <option value="Todas">Todas las categorías</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
