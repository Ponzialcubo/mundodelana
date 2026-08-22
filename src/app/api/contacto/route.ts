import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, contact, message } = body;

  if (!name || !contact || !message) {
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
  }

  await prisma.contactMessage.create({ data: { name, contact, message } });

  return NextResponse.json({ ok: true });
}
