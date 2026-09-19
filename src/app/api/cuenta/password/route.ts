import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/session";

export async function PATCH(req: Request) {
  const customerId = await getCustomerSession();
  if (!customerId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { currentPassword, newPassword } = await req.json();

  if (!newPassword || newPassword.length < 8) {
    return NextResponse.json({ error: "La nueva contraseña debe tener al menos 8 caracteres" }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  // Accounts with a password must confirm the current one. Google-only
  // accounts (no passwordHash yet) are setting one for the first time.
  if (customer.passwordHash) {
    if (!currentPassword || !(await bcrypt.compare(currentPassword, customer.passwordHash))) {
      return NextResponse.json({ error: "La contraseña actual no es correcta" }, { status: 401 });
    }
  }

  await prisma.customer.update({
    where: { id: customerId },
    data: { passwordHash: await bcrypt.hash(newPassword, 10) },
  });

  return NextResponse.json({ ok: true });
}
