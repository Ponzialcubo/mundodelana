import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";
import { SITE_IMAGE_SLOTS } from "@/lib/site-images";

const KEYS = SITE_IMAGE_SLOTS.map((s) => s.key) as string[];

export async function PUT(req: Request) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { key, url, focalX = 0.5, focalY = 0.5 } = await req.json();
  if (!KEYS.includes(key) || typeof url !== "string" || !url.startsWith("/uploads/")) {
    return NextResponse.json({ error: "Petición no válida" }, { status: 400 });
  }
  await prisma.siteImage.upsert({ where: { key }, create: { key, url, focalX, focalY }, update: { url, focalX, focalY } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { key } = await req.json();
  if (!KEYS.includes(key)) return NextResponse.json({ error: "Petición no válida" }, { status: 400 });
  await prisma.siteImage.deleteMany({ where: { key } });
  return NextResponse.json({ ok: true });
}
