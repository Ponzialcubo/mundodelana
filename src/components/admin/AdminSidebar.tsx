"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const GESTION = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/categorias", label: "Categorías" },
  { href: "/admin/newsletter", label: "Newsletter" },
];

const SITIO = [
  { href: "/admin/ajustes", label: "Configuración" },
  { href: "/admin/perfil", label: "Perfil" },
];

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

  return (
    <aside className="flex w-[230px] shrink-0 flex-col gap-6 border-r border-admin-ink/10 bg-white px-4 py-6">
      <div className="flex items-center gap-2 px-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-pink font-serif text-sm font-medium text-admin-ink">
          m
        </span>
        <span className="font-serif text-base font-medium text-admin-ink">Mundodelana</span>
      </div>

      <nav className="flex flex-col gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="mb-1 px-2 font-mono text-[10px] tracking-wider text-admin-faint">GESTIÓN</span>
          {GESTION.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-admin-ink"
              style={isActive(item.href) ? { background: "#F1E4E5" } : {}}
            >
              {item.label}
              {item.label === "Pedidos" && pendingCount > 0 && (
                <span className="rounded-full bg-pink px-1.5 py-0.5 text-[10px] font-medium text-admin-ink">
                  {pendingCount}
                </span>
              )}
            </Link>
          ))}
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="mb-1 px-2 font-mono text-[10px] tracking-wider text-admin-faint">SITIO</span>
          {SITIO.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-admin-ink"
              style={isActive(item.href) ? { background: "#F1E4E5" } : {}}
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
  );
}
