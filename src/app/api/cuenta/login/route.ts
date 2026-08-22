import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createCustomerSession } from "@/lib/session";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const customer = await prisma.customer.findUnique({ where: { email } });
  if (!customer || !(await bcrypt.compare(password, customer.passwordHash))) {
    return NextResponse.json({ error: "Email o contraseña incorrectos" }, { status: 401 });
  }

  await createCustomerSession(customer.id);
  return NextResponse.json({ ok: true });
}
