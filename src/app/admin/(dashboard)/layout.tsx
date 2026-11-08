import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const adminId = await getAdminSession();
  const [admin, orders, messages, ideas] = await Promise.all([
    adminId ? prisma.admin.findUnique({ where: { id: adminId } }) : null,
    prisma.order.count({ where: { state: "NUEVO" } }),
    prisma.contactMessage.count({ where: { readAt: null, reply: null } }),
    // Ideas we've answered that she hasn't seen are not tracked: show the ones still open.
    prisma.idea.count({ where: { status: { in: ["NUEVA", "EN_REVISION"] } } }),
  ]);

  return (
    <div className="min-h-screen">
      <AdminSidebar counts={{ orders, messages, ideas }} adminName={admin?.name ?? "Admin"} />
      {/* The desktop sidebar is fixed: leave its width. Bottom padding leaves room for the mobile tab bar. */}
      <main className="min-w-0 overflow-x-hidden pb-24 md:ml-[232px] md:pb-0">{children}</main>
    </div>
  );
}
