import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ticketsQueEsperan } from "@/lib/asistente";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const adminId = await getAdminSession();
  const [admin, orders, messages, asistente] = await Promise.all([
    adminId ? prisma.admin.findUnique({ where: { id: adminId } }) : null,
    prisma.order.count({ where: { state: "NUEVO" } }),
    prisma.contactMessage.count({ where: { readAt: null, reply: null } }),
    // Assistant tickets waiting for her (a reply, a proposal or saying if the result is right).
    ticketsQueEsperan(),
  ]);

  return (
    <div className="min-h-screen">
      <AdminSidebar counts={{ orders, messages, asistente }} adminName={admin?.name ?? "Admin"} />
      {/* The desktop sidebar is fixed: leave its width. Bottom padding leaves room for the mobile tab bar. */}
      <main className="min-w-0 overflow-x-clip pb-24 md:ml-[232px] md:pb-0">{children}</main>
    </div>
  );
}
