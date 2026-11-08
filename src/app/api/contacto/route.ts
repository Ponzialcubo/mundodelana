import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/session";

export async function POST(req: Request) {
  const body = await req.json();
  const name = String(body.name ?? "").trim().slice(0, 120);
  const contact = String(body.contact ?? "").trim().slice(0, 160);
  const message = String(body.message ?? "").trim().slice(0, 4000);

  if (!name || !contact || !message) {
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
  }

  // Signed-in customers get the message (and the owner's reply) in their account.
  const customerId = await getCustomerSession();

  await prisma.contactMessage.create({ data: { name, contact, message, customerId } });

  return NextResponse.json({ ok: true });
}
