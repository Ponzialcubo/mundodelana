import Link from "next/link";
import { MORE } from "@/components/admin/admin-nav";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";

export default function AdminMasPage() {
  return (
    <div className="flex flex-col gap-5 p-5 md:p-9">
      <h1 className="font-serif text-2xl font-normal">Más opciones</h1>
      <div className="flex flex-col divide-y divide-admin-ink/8 rounded-xl border border-admin-ink/10 bg-white">
        {MORE.map((item) => (
          <Link key={item.href} href={item.href} className="flex items-center justify-between px-5 py-4">
            <span className="flex flex-col">
              <span className="text-sm font-medium">{item.label}</span>
              <span className="text-xs text-admin-ink-soft">{item.hint}</span>
            </span>
            <span className="text-admin-faint">›</span>
          </Link>
        ))}
      </div>
      <AdminLogoutButton />
    </div>
  );
}
