import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";
import { ProfilePasswordForm } from "@/components/admin/ProfilePasswordForm";

export default async function AdminPerfilPage() {
  const adminId = await getAdminSession();
  const admin = adminId ? await prisma.admin.findUnique({ where: { id: adminId } }) : null;

  return (
    <div className="flex flex-col gap-6 p-6 md:p-9">
      <h1 className="font-serif text-2xl font-normal">Perfil</h1>

      <div className="flex max-w-lg flex-col gap-6">
        <div className="flex items-center gap-3 rounded-xl border border-admin-ink/10 bg-white p-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-pink font-serif text-lg font-medium">
            {admin?.name?.[0] ?? "A"}
          </span>
          <div className="flex flex-col">
            <span className="font-medium">{admin?.name} · administradora</span>
            <span className="text-sm text-admin-ink-soft">{admin?.email}</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-admin-ink/10 bg-white p-6">
          <span className="font-serif text-lg font-medium">Cambiar contraseña</span>
          <ProfilePasswordForm />
        </div>
      </div>
    </div>
  );
}
