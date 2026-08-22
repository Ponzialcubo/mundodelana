import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const adminId = await getAdminSession();
  const admin = adminId ? await prisma.admin.findUnique({ where: { id: adminId } }) : null;
  const pendingCount = await prisma.order.count({ where: { state: "NUEVO" } });

  return (
    <div className="flex min-h-screen">
      <AdminSidebar pendingCount={pendingCount} adminName={admin?.name ?? "Admin"} />
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
