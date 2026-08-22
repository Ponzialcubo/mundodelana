import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";

export async function PATCH(req: Request) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { currentPassword, newPassword } = await req.json();

  const admin = await prisma.admin.findUnique({ where: { id: adminId } });
  if (!admin || !(await bcrypt.compare(currentPassword, admin.passwordHash))) {
    return NextResponse.json({ error: "La contraseña actual no es correcta" }, { status: 401 });
  }
  if (!newPassword || newPassword.length < 8) {
    return NextResponse.json({ error: "La nueva contraseña debe tener al menos 8 caracteres" }, { status: 400 });
  }

  await prisma.admin.update({
    where: { id: adminId },
    data: { passwordHash: await bcrypt.hash(newPassword, 10) },
  });

  return NextResponse.json({ ok: true });
}
