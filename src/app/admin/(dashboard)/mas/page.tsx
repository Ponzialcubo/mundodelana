import Link from "next/link";
import { IDEAS, MOBILE_TABS, NAV_GROUPS } from "@/components/admin/admin-nav";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";

export default function AdminMasPage() {
  return (
    <div className="flex flex-col gap-5 p-5">
      <h1 className="font-serif text-2xl font-normal">Más opciones</h1>

      <Link href={IDEAS.href} className="flex items-center gap-3.5 rounded-2xl bg-[#FBF3E4] p-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white">
          <AdminIcon name="ideas" className="h-5 w-5" />
        </span>
        <span className="flex flex-1 flex-col">
          <span className="font-medium">Ideas</span>
          <span className="text-xs text-admin-ink-soft">Apunta cambios y mejoras para la web</span>
        </span>
        <span className="text-admin-faint">›</span>
      </Link>

      {NAV_GROUPS.filter((g) => g.title).map((group) => {
        const items = group.items.filter((i) => !MOBILE_TABS.includes(i.href));
        if (items.length === 0) return null;
        return (
          <section key={group.title} className="flex flex-col gap-2">
            <span className="px-1 text-[11px] font-medium uppercase tracking-[.14em] text-admin-faint">{group.title}</span>
            <div className="flex flex-col divide-y divide-admin-ink/8 rounded-2xl border border-admin-ink/10 bg-white">
              {items.map((item) => (
                <Link key={item.href} href={item.href} className="flex items-center gap-3.5 px-4 py-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-admin-bg text-admin-ink">
                    <AdminIcon name={item.icon} />
                  </span>
                  <span className="flex flex-1 flex-col">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-xs text-admin-ink-soft">{item.hint}</span>
                  </span>
                  <span className="text-admin-faint">›</span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
      <AdminLogoutButton />
    </div>
  );
}
