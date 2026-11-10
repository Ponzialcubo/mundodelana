"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ALL_ITEMS, ASISTENTE, NAV_GROUPS, type NavItem } from "@/components/admin/admin-nav";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { Pildora, useActivas } from "@/components/admin/asistente/Pildora";
import type { Diseno } from "@/lib/panel-diseno";

export type AdminCounts = { orders: number; messages: number; asistente: number };

const TITULOS: [string, string][] = [["/admin/diseno", "Diseño del panel"], ["/admin/mas", "Más"], ["/admin/productos/nuevo", "Nuevo producto"]];

/** Pinch zoom is allowed; if the screen stays zoomed in, «Tamaño normal» puts it back. */
function VueltaZoom() {
  const [z, setZ] = useState<{ s: number; x: number; y: number; w: number } | null>(null);
  useEffect(() => {
    const vv = window.visualViewport; if (!vv) return;
    const f = () => { if (vv.scale > 1.05) setZ({ s: vv.scale, x: vv.offsetLeft, y: vv.offsetTop, w: vv.width }); else { setZ(null); if (window.scrollX) window.scrollTo(0, window.scrollY); } };
    vv.addEventListener("resize", f); vv.addEventListener("scroll", f);
    return () => { vv.removeEventListener("resize", f); vv.removeEventListener("scroll", f); };
  }, []);
  if (!z) return null;
  const volver = () => {
    const m = document.querySelector('meta[name="viewport"]'); if (!m) return; const antes = m.getAttribute("content") || "";
    m.setAttribute("content", `${antes}, maximum-scale=1`); setTimeout(() => { m.setAttribute("content", antes); window.scrollTo(0, window.scrollY); }, 350);
  };
  return (
    <button onClick={volver} style={{ left: z.x + z.w / 2, top: z.y + 10, transform: `translateX(-50%) scale(${1 / z.s})`, transformOrigin: "top center" }}
      className="fixed z-[80] flex items-center gap-1.5 whitespace-nowrap rounded-full bg-admin-ink px-4 py-2 text-sm font-medium text-white shadow-lg">↺ Tamaño normal</button>
  );
}

export function AdminSidebar({ counts, adminName, diseno }: { counts: AdminCounts; adminName: string; diseno: Diseno }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const enChat = /^\/admin\/asistente\/\d+/.test(pathname);
  const activas = useActivas();
  useEffect(() => setMenu(false), [pathname]);
  // Screen that opens first (Diseño del panel), once per visit and only when landing on Inicio.
  useEffect(() => {
    try {
      if (sessionStorage.getItem("panel-arrancado")) return; sessionStorage.setItem("panel-arrancado", "1");
      if (pathname === "/admin" && diseno.inicio !== "/admin") router.replace(diseno.inicio);
    } catch { /* no storage */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on the first load
  }, []);
  // Last screen outside the assistant: folding the chat goes back to it.
  useEffect(() => { if (!pathname.startsWith("/admin/asistente")) { try { sessionStorage.setItem("pantalla", pathname + location.search); } catch { /* no storage */ } } }, [pathname]);
  useEffect(() => {
    if (!menu) return;
    const f = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    addEventListener("keydown", f); return () => removeEventListener("keydown", f);
  }, [menu]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  const badge = (item: NavItem) => (item.badge ? counts[item.badge] : 0);
  const titulo = TITULOS.find(([h]) => pathname.startsWith(h))?.[1]
    ?? [...ALL_ITEMS].sort((a, b) => b.href.length - a.href.length).find((i) => isActive(i.href))?.label ?? "Mundolana";
  const barra = diseno.barra.map((h) => ALL_ITEMS.find((i) => i.href === h)).filter((i): i is NavItem => !!i);
  const mitad = Math.ceil(barra.length / 2);
  const tab = (item: NavItem) => {
    const active = isActive(item.href); const count = badge(item);
    return (
      <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className="relative flex min-w-0 flex-col items-center justify-end gap-1 pb-2 pt-2 text-[11px] font-medium" style={{ color: active ? "#1F1B1A" : "#9A928E" }}>
        <span className={`relative flex h-7 w-12 items-center justify-center rounded-full ${active ? "bg-[#F1E4E5]" : ""}`}>
          <AdminIcon name={item.icon} className="h-5 w-5" />
          {count > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-pink px-1.5 text-[10px] leading-4 text-admin-ink">{count}</span>}
        </span>
        <span className="max-w-full truncate">{item.label}</span>
      </Link>
    );
  };

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
            href={ASISTENTE.href}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition ${isActive(ASISTENTE.href) ? "bg-admin-ink text-white" : "bg-[#FBF3E4] text-admin-ink hover:bg-[#F6E7D3]"}`}
          >
            <AdminIcon name="assistant" className="h-[18px] w-[18px]" />
            <span className="flex flex-1 flex-col leading-tight">
              Asistente
              <span className={`text-[11px] font-normal ${isActive(ASISTENTE.href) ? "text-white/70" : "text-admin-ink-soft"}`}>Pide cambios en la web</span>
            </span>
            {counts.asistente > 0 && <span title="Tickets esperando tu respuesta" className="rounded-full bg-pink px-1.5 py-0.5 text-[10px] font-medium leading-none text-admin-ink">{counts.asistente}</span>}
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
          <Link href="/admin/diseno" className="px-1.5 text-[11px] text-admin-link">Diseño del panel</Link>
        </div>
      </aside>

      {/* Mobile top bar: menu, screen title and the assistant («Agente»). Hidden inside an assistant chat. */}
      {!enChat && (
        <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-admin-ink/10 bg-white/95 px-2 pb-2 pt-[max(.5rem,env(safe-area-inset-top))] backdrop-blur md:hidden">
          <button onClick={() => setMenu(true)} aria-label="Abrir menú" aria-expanded={menu} className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-admin-ink hover:bg-admin-bg">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10" /></svg>
            {counts.orders + counts.messages > 0 && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-pink ring-2 ring-white" />}
          </button>
          <span className="min-w-0 flex-1 truncate font-serif text-lg font-medium text-admin-ink">{titulo}</span>
          <Link href={ASISTENTE.href} aria-label={`Agente${counts.asistente ? `: ${counts.asistente} tickets esperan tu respuesta` : ""}`}
            className={`relative flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium ${isActive(ASISTENTE.href) ? "bg-admin-ink text-white" : "bg-[#FBF3E4] text-admin-ink"}`}>
            <AdminIcon name="assistant" className="h-[18px] w-[18px]" /> Agente
            {counts.asistente > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-pink px-1.5 text-[10px] leading-4 text-admin-ink">{counts.asistente}</span>}
          </Link>
        </header>
      )}

      {/* Mobile drawer: every section, grouped like the desktop sidebar */}
      {menu && (
        <div className="fixed inset-0 z-50 bg-admin-ink/40 md:hidden" onClick={(e) => { if (e.target === e.currentTarget) setMenu(false); }}>
          <nav aria-label="Menú" className="absolute inset-y-0 left-0 flex w-[min(86vw,320px)] flex-col overflow-y-auto rounded-r-3xl bg-white pb-[env(safe-area-inset-bottom)] shadow-2xl">
            <div className="flex items-center gap-3 border-b border-admin-ink/10 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))]">
              {/* eslint-disable-next-line @next/next/no-img-element -- tiny static logo */}
              <img src="/logo-mundolana.png" alt="" width={36} height={36} className="h-9 w-9" />
              <span className="flex min-w-0 flex-1 flex-col leading-tight"><span className="font-serif text-lg font-medium text-admin-ink">Mundolana</span><span className="truncate text-xs text-admin-ink-soft">{adminName}</span></span>
              <button onClick={() => setMenu(false)} aria-label="Cerrar menú" className="flex h-11 w-11 items-center justify-center rounded-xl text-admin-ink-soft hover:bg-admin-bg">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
              </button>
            </div>
            <div className="flex flex-col gap-3 px-3 py-3">
              {[...NAV_GROUPS, { title: null, items: [ASISTENTE] }].map((group, gi) => (
                <div key={gi} className="flex flex-col gap-0.5">
                  {group.title && <span className="px-3 pb-1 text-[10px] font-medium uppercase tracking-[.14em] text-admin-faint">{group.title}</span>}
                  {group.items.map((item) => {
                    const active = isActive(item.href); const count = badge(item);
                    return (
                      <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}
                        className={`flex min-h-[46px] items-center gap-3 rounded-xl px-2 text-[15px] ${active ? "bg-[#F1E4E5] font-medium text-admin-ink" : "text-admin-ink-soft"}`}>
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${active ? "bg-admin-ink text-white" : "bg-admin-bg"}`}><AdminIcon name={item.icon} className="h-[18px] w-[18px]" /></span>
                        <span className="flex-1 truncate">{item.label}</span>
                        {count > 0 && <span className="rounded-full bg-pink px-1.5 py-0.5 text-[10px] font-medium leading-none text-admin-ink">{count}</span>}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="mt-auto flex flex-col gap-0.5 border-t border-admin-ink/10 px-3 py-3 text-[14px] text-admin-ink-soft">
              <Link href="/admin/diseno" className="flex min-h-[44px] items-center gap-3 rounded-xl px-2"><svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-1.2-1-1.6-1-2.6 0-1 .8-1.8 1.8-1.8H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3zM7.5 11h.01M10 7h.01M15 7h.01" /></svg> Diseño del panel</Link>
              <Link href="/" target="_blank" className="flex min-h-[44px] items-center gap-3 rounded-xl px-2"><svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg> Ver la tienda</Link>
              <button onClick={logout} className="flex min-h-[44px] items-center gap-3 rounded-xl px-2 text-left"><svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h10" /></svg> Cerrar sesión</button>
            </div>
          </nav>
        </div>
      )}

      {/* Mobile bottom bar: 4 tabs chosen in Diseño del panel + «Nuevo producto» in the middle. Hidden inside an assistant chat. */}
      {!enChat && (
        <nav aria-label="Secciones" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-admin-ink/10 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
          {barra.slice(0, mitad).map(tab)}
          <Link href="/admin/productos/nuevo" aria-label="Nuevo producto" className="flex flex-col items-center justify-end gap-1 pb-2 text-[11px] font-medium text-admin-ink">
            <span className="-mt-5 flex h-[52px] w-[52px] items-center justify-center rounded-full border-[3px] border-white bg-admin-ink text-white shadow-lg">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
            </span>
            Nuevo
          </Link>
          {barra.slice(mitad).map(tab)}
        </nav>
      )}
      {!pathname.startsWith("/admin/asistente") && <Pildora activas={activas} />}
      <VueltaZoom />
    </>
  );
}
