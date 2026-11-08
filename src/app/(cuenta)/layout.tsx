import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AccountNav } from "@/components/account/AccountNav";
import { LogoutButton } from "@/components/public/LogoutButton";

export const dynamic = "force-dynamic";

/**
 * The customer's own space: a light header (logo, "Ver tienda") and the
 * account sections, without the shop menu so it feels like a personal area.
 */
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const customerId = await getCustomerSession();
  if (!customerId) redirect("/acceso");

  const [customer, unread] = await Promise.all([
    prisma.customer.findUnique({ where: { id: customerId }, select: { name: true, email: true } }),
    prisma.contactMessage.count({ where: { customerId, repliedAt: { not: null }, replySeenAt: null } }),
  ]);
  if (!customer) redirect("/acceso");

  return (
    <div className="flex min-h-screen flex-col bg-surface text-ink">
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 md:px-8 md:py-3.5">
          <Link href="/cuenta" className="flex items-center gap-2.5">
            <Image src="/logo-mundolana.png" alt="" width={36} height={36} className="h-9 w-9" />
            <span className="flex flex-col leading-none">
              <span className="font-serif text-[18px] font-medium">Mundolana</span>
              <span className="mt-0.5 text-[11px] uppercase tracking-[.14em] text-ink/55">Mi cuenta</span>
            </span>
          </Link>
          <Link href="/catalogo" className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-[13.5px] font-medium text-surface">
            Ver tienda <span aria-hidden="true">→</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-6 px-5 pb-12 md:grid-cols-[230px_1fr] md:gap-10 md:px-8 md:py-10">
        <aside className="flex flex-col gap-5 md:sticky md:top-24 md:self-start">
          <div className="hidden items-center gap-3 md:flex">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-pink font-serif text-lg font-medium">{customer.name[0]?.toUpperCase()}</span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-medium">{customer.name}</span>
              <span className="truncate text-[12.5px] text-ink/55">{customer.email}</span>
            </span>
          </div>
          <AccountNav unread={unread} />
          <div className="hidden md:block">
            <LogoutButton />
          </div>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
