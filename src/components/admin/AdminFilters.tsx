"use client";

import { useRouter } from "next/navigation";

export function AdminSearch({ defaultValue, basePath }: { defaultValue: string; basePath: string }) {
  const router = useRouter();

  return (
    <label className="flex w-full items-center gap-2.5 rounded-full border border-admin-ink/16 bg-admin-bg px-4 py-2.5 md:w-[280px]">
      <span className="text-sm text-admin-faint">⌕</span>
      <input
        defaultValue={defaultValue}
        placeholder="Buscar producto…"
        className="flex-1 bg-transparent text-sm outline-none"
        onChange={(e) => {
          const params = new URLSearchParams(window.location.search);
          if (e.target.value) params.set("q", e.target.value);
          else params.delete("q");
          router.replace(`${basePath}?${params.toString()}`);
        }}
      />
    </label>
  );
}

export function AdminChip({ label, active, href }: { label: string; active: boolean; href: string }) {
  return (
    <a
      href={href}
      className="whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px]"
      style={
        active
          ? { background: "#1F1B1A", color: "#F7F6F4", fontWeight: 500 }
          : { background: "#fff", color: "#1F1B1A", border: "1px solid rgba(31,27,26,.14)" }
      }
    >
      {label}
    </a>
  );
}
