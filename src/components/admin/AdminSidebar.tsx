"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MAIN, MORE } from "@/components/admin/admin-nav";

export function AdminSidebar({ pendingCount, adminName }: { pendingCount: number; adminName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  const moreActive = pathname === "/admin/mas" || MORE.some((item) => isActive(item.href));

  const badge = pendingCount > 0 && (
    <span className="rounded-full bg-pink px-1.5 py-0.5 text-[10px] font-medium text-admin-ink">{pendingCount}</span>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[220px] shrink-0 flex-col gap-6 border-r border-admin-ink/10 bg-white px-4 py-6 md:flex">
        <Link href="/admin" className="flex items-center gap-2 px-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-pink font-serif text-sm font-medium text-admin-ink">
            m
          </span>
          <span className="font-serif text-base font-medium text-admin-ink">Mundolana</span>
        </Link>

        <nav className="flex flex-col gap-5 overflow-y-auto">
          <div className="flex flex-col gap-0.5">
            {MAIN.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-admin-ink"
                style={isActive(item.href) ? { background: "#F1E4E5" } : {}}
              >
                {item.label}
                {item.href === "/admin/pedidos" && badge}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="mb-1 px-3 font-mono text-[10px] tracking-wider text-admin-faint">MÁS</span>
            {MORE.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-1.5 text-[13px] text-admin-ink-soft"
                style={isActive(item.href) ? { background: "#F1E4E5", color: "#1F1B1A" } : {}}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="mt-auto flex items-center gap-2.5 border-t border-admin-ink/10 pt-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pink font-serif text-xs font-medium text-admin-ink">
            {adminName[0]}
          </span>
          <div className="flex flex-1 flex-col">
            <span className="text-xs font-medium text-admin-ink">{adminName}</span>
            <button onClick={logout} className="text-left text-xs text-admin-link">
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-admin-ink/10 bg-white px-4 py-3 md:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-pink font-serif text-sm font-medium text-admin-ink">
            m
          </span>
          <span className="font-serif text-base font-medium text-admin-ink">Mundolana</span>
        </Link>
        <Link href="/" target="_blank" className="text-xs font-medium text-admin-link">
          Ver tienda
        </Link>
      </header>

      {/* Mobile bottom tabs */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-admin-ink/10 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        {[...MAIN, { href: "/admin/mas", label: "Más" }].map((item) => {
          const active = item.href === "/admin/mas" ? moreActive : isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center gap-0.5 py-3 text-xs font-medium"
              style={{ color: active ? "#1F1B1A" : "#9A928E" }}
            >
              <span className="h-1 w-6 rounded-full" style={{ background: active ? "#E8B4B8" : "transparent" }} />
              {item.label}
              {item.href === "/admin/pedidos" && pendingCount > 0 && (
                <span className="absolute right-[18%] top-1.5 rounded-full bg-pink px-1.5 text-[10px] text-admin-ink">
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
