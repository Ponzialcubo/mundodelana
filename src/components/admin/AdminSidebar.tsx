"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ALL_ITEMS, IDEAS, MOBILE_TABS, NAV_GROUPS, type NavItem } from "@/components/admin/admin-nav";
import { AdminIcon } from "@/components/admin/AdminIcon";

export type AdminCounts = { orders: number; messages: number; ideas: number };

export function AdminSidebar({ counts, adminName }: { counts: AdminCounts; adminName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  const moreActive = pathname === "/admin/mas" || ALL_ITEMS.some((i) => !MOBILE_TABS.includes(i.href) && isActive(i.href));
  const badge = (item: NavItem) => (item.badge && item.badge !== "ideas" ? counts[item.badge] : 0);

  return (
    <>
      {/* Desktop sidebar: fixed to the window, sized so it never needs its own scroll */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[232px] flex-col border-r border-admin-ink/10 bg-white md:flex">
        <Link href="/admin" className="flex items-center gap-2.5 px-5 pb-3 pt-5">
          {/* eslint-disable-next-line @next/next/no-img-element -- tiny static logo */}
          <img src="/logo-mundolana.png" alt="" width={30} height={30} className="h-[30px] w-[30px]" />
          <span className="flex flex-col leading-none">
            <span className="font-serif text-[17px] font-medium text-admin-ink">Mundolana</span>
            <span className="mt-0.5 text-[10px] uppercase tracking-[.16em] text-admin-faint">Panel</span>
          </span>
        </Link>

        <nav className="flex min-h-0 flex-1 flex-col gap-2.5 px-3 py-2">
          {NAV_GROUPS.map((group) => (
            <div key={group.title ?? "main"} className="flex flex-col">
              {group.title && <span className="px-3 pb-0.5 text-[10px] font-medium uppercase tracking-[.14em] text-admin-faint">{group.title}</span>}
              {group.items.map((item) => {
                const active = isActive(item.href);
                const count = badge(item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-[6px] text-[13.5px] transition ${active ? "bg-[#F1E4E5] font-medium text-admin-ink" : "text-admin-ink-soft hover:bg-admin-bg hover:text-admin-ink"}`}
                  >
                    <AdminIcon name={item.icon} className="h-[17px] w-[17px] shrink-0" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {count > 0 && <span className="rounded-full bg-pink px-1.5 py-0.5 text-[10px] font-medium leading-none text-admin-ink">{count}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="flex flex-col gap-2 border-t border-admin-ink/10 p-3">
          <Link
            href={IDEAS.href}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition ${isActive(IDEAS.href) ? "bg-admin-ink text-white" : "bg-[#FBF3E4] text-admin-ink hover:bg-[#F6E7D3]"}`}
          >
            <AdminIcon name="ideas" className="h-[18px] w-[18px]" />
            <span className="flex flex-1 flex-col leading-tight">
              Ideas
              <span className={`text-[11px] font-normal ${isActive(IDEAS.href) ? "text-white/70" : "text-admin-ink-soft"}`}>Apunta cambios y mejoras</span>
            </span>
            {counts.ideas > 0 && <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] leading-none text-admin-ink">{counts.ideas}</span>}
          </Link>
          <div className="flex items-center gap-2.5 px-1.5 pt-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pink font-serif text-xs font-medium text-admin-ink">{adminName[0]}</span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-xs font-medium text-admin-ink">{adminName}</span>
              <button onClick={logout} className="text-left text-xs text-admin-link">
                Cerrar sesión
              </button>
            </div>
            <Link href="/" target="_blank" title="Ver la tienda" className="rounded-full border border-admin-ink/12 px-2.5 py-1 text-[11px] font-medium text-admin-ink-soft">
              Tienda ↗
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-admin-ink/10 bg-white px-4 py-3 md:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- tiny static logo */}
          <img src="/logo-mundolana.png" alt="" width={28} height={28} className="h-7 w-7" />
          <span className="font-serif text-base font-medium text-admin-ink">Mundolana</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href={IDEAS.href} className="flex items-center gap-1.5 rounded-full bg-[#FBF3E4] px-3 py-1.5 text-xs font-medium text-admin-ink">
            <AdminIcon name="ideas" className="h-4 w-4" /> Ideas
          </Link>
          <Link href="/" target="_blank" className="text-xs font-medium text-admin-link">
            Tienda ↗
          </Link>
        </div>
      </header>

      {/* Mobile bottom tabs */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-admin-ink/10 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        {[...ALL_ITEMS.filter((i) => MOBILE_TABS.includes(i.href)), { href: "/admin/mas", label: "Más", icon: "categories" as const, hint: "" }].map((item) => {
          const active = item.href === "/admin/mas" ? moreActive : isActive(item.href);
          const count = "badge" in item ? badge(item as NavItem) : 0;
          return (
            <Link key={item.href} href={item.href} className="relative flex flex-col items-center gap-1 pb-2.5 pt-2 text-[11px] font-medium" style={{ color: active ? "#1F1B1A" : "#9A928E" }}>
              <AdminIcon name={item.icon} className="h-5 w-5" />
              {item.label}
              {count > 0 && <span className="absolute right-[20%] top-1 rounded-full bg-pink px-1.5 text-[10px] text-admin-ink">{count}</span>}
              {active && <span className="absolute top-0 h-[3px] w-8 rounded-b-full bg-pink" />}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
