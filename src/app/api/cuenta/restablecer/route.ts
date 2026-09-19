import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createCustomerSession } from "@/lib/session";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(req: Request) {
  const { token, password } = await req.json();

  if (!token || typeof token !== "string" || !password || password.length < 8) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return NextResponse.json({ error: "El enlace no es válido o ha caducado. Pide uno nuevo." }, { status: 400 });
  }

  const customer = await prisma.customer.update({
    where: { id: resetToken.customerId },
    data: { passwordHash: await bcrypt.hash(password, 10) },
  });

  await prisma.passwordResetToken.update({
    where: { id: resetToken.id },
    data: { usedAt: new Date() },
  });

  await createCustomerSession(customer.id);
  return NextResponse.json({ ok: true });
}
