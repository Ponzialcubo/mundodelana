"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/cuenta", label: "Resumen", icon: "M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" },
  { href: "/cuenta/pedidos", label: "Pedidos", icon: "M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8zM9 8V6.5a3 3 0 0 1 6 0V8" },
  { href: "/cuenta/mensajes", label: "Mensajes", icon: "M4.5 6.5A1.5 1.5 0 0 1 6 5h12a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 18 16H10l-4.5 3.5V16H6a1.5 1.5 0 0 1-1.5-1.5z" },
  { href: "/cuenta/datos", label: "Mis datos", icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7.5 8.5c.8-3.6 3.8-5.5 7.5-5.5s6.7 1.9 7.5 5.5" },
];

/** Account sections: tabs pinned under the header on mobile, a sidebar on desktop. */
export function AccountNav({ unread }: { unread: number }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/cuenta" ? pathname === href : pathname.startsWith(href));

  return (
    <nav aria-label="Mi cuenta" className="sticky top-[61px] z-30 -mx-5 border-b border-ink/8 bg-surface/95 px-3 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:px-0">
      <ul className="flex md:flex-col md:gap-1">
        {ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex flex-col items-center gap-1 px-1 py-2.5 text-[12px] font-medium md:flex-row md:gap-3 md:rounded-xl md:px-4 md:py-3 md:text-[14.5px] ${
                  active ? "text-ink md:bg-white md:shadow-[0_4px_16px_rgba(74,63,59,.06)]" : "text-ink/55 hover:text-ink"
                }`}
              >
                <svg viewBox="0 0 24 24" className="h-[21px] w-[21px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
                  <path d={item.icon} />
                </svg>
                {item.label}
                {item.href === "/cuenta/mensajes" && unread > 0 && (
                  <span className="absolute right-[22%] top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-pink-deep px-1 text-[10.5px] text-white md:static md:ml-auto">
                    {unread}
                  </span>
                )}
                {active && <span className="absolute inset-x-4 bottom-0 h-[2px] rounded-full bg-ink md:hidden" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
