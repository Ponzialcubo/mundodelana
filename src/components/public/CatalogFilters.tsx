"use client";

import { useRouter } from "next/navigation";

export function CatalogSearch({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
      }}
      className="flex w-full items-center gap-2.5 rounded-full border border-ink/16 bg-white px-5 py-3 md:w-[260px]"
    >
      <span className="text-sm text-ink/45">⌕</span>
      <input
        name="q"
        defaultValue={defaultValue}
        placeholder="Buscar por nombre…"
        className="flex-1 bg-transparent text-sm text-ink outline-none"
        onChange={(e) => {
          const params = new URLSearchParams(window.location.search);
          if (e.target.value) params.set("q", e.target.value);
          else params.delete("q");
          router.replace(`/catalogo?${params.toString()}`);
        }}
      />
    </form>
  );
}

export function CatalogChip({
  label,
  active,
  href,
}: {
  label: string;
  active: boolean;
  href: string;
}) {
  return (
    <a
      href={href}
      className="rounded-full px-4 py-2 text-[13.5px] transition-colors"
      style={
        active
          ? { background: "#4A3F3B", color: "#F7F1EA" }
          : { background: "#fff", color: "#4A3F3B", border: "1px solid rgba(74,63,59,.16)" }
      }
    >
      {label}
    </a>
  );
}
