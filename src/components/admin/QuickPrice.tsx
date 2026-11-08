"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Price field right in the product list: saves when leaving the field, no need to open the product. */
export function QuickPrice({ id, price, priceType }: { id: string; price: number; priceType: "STOCK" | "PERSONALIZADO" }) {
  const router = useRouter();
  const [value, setValue] = useState(price > 0 ? String(price) : "");
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");

  async function save() {
    const next = value.trim() === "" ? 0 : Number(value.replace(",", "."));
    if (!Number.isFinite(next) || next < 0 || next === price) return;
    setState("saving");
    await fetch(`/api/admin/productos/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ price: next }) });
    setState("saved");
    setTimeout(() => setState("idle"), 1800);
    router.refresh();
  }

  return (
    <label className="flex flex-col items-end gap-0.5">
      <span className={`flex items-center gap-1 rounded-lg border bg-white px-2.5 py-1.5 ${price > 0 ? "border-admin-ink/14" : "border-pink"}`}>
        {priceType === "PERSONALIZADO" && <span className="text-[11px] text-admin-faint">desde</span>}
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
          inputMode="decimal"
          placeholder="—"
          aria-label="Precio"
          className="w-14 bg-transparent text-right text-[16px] outline-none md:text-sm"
        />
        <span className="text-xs text-admin-faint">€</span>
      </span>
      <span className="h-3 text-[10px] text-admin-link">{state === "saving" ? "Guardando…" : state === "saved" ? "✓ Guardado" : price > 0 ? "" : "Sin precio"}</span>
    </label>
  );
}
