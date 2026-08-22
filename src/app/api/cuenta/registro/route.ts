import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createCustomerSession } from "@/lib/session";

export async function POST(req: Request) {
  const { name, email, password, newsletterOptIn } = await req.json();

  if (!name || !email || !password || password.length < 8) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const existing = await prisma.customer.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Ya existe una cuenta con ese email" }, { status: 409 });
  }

  const customer = await prisma.customer.create({
    data: {
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      newsletterOptIn: Boolean(newsletterOptIn),
    },
  });

  if (newsletterOptIn) {
    await prisma.subscriber.upsert({
      where: { email },
      update: { state: "ACTIVO" },
      create: { email, state: "ACTIVO" },
    });
  }

  await createCustomerSession(customer.id);
  return NextResponse.json({ ok: true });
}
