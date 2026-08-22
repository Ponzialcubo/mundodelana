import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/session";

export async function POST(req: Request) {
  const customerId = await getCustomerSession();
  if (!customerId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { active } = await req.json();

  const customer = await prisma.customer.update({
    where: { id: customerId },
    data: { newsletterOptIn: Boolean(active) },
  });

  await prisma.subscriber.upsert({
    where: { email: customer.email },
    update: { state: active ? "ACTIVO" : "BAJA" },
    create: { email: customer.email, state: active ? "ACTIVO" : "BAJA" },
  });

  return NextResponse.json({ ok: true });
}
