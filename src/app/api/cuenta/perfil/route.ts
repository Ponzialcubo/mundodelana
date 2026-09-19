import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/session";

export async function PATCH(req: Request) {
  const customerId = await getCustomerSession();
  if (!customerId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { name, phone } = await req.json();

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "El nombre no puede estar vacío" }, { status: 400 });
  }

  await prisma.customer.update({
    where: { id: customerId },
    data: { name: name.trim(), phone: phone?.trim() || null },
  });

  return NextResponse.json({ ok: true });
}
