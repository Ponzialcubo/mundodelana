import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";

const STATUSES = ["NUEVA", "USADA", "DESCARTADA"] as const;

export async function POST(req: Request) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { ids, status } = (await req.json()) as { ids: string[]; status: (typeof STATUSES)[number] };
  if (!Array.isArray(ids) || !STATUSES.includes(status)) {
    return NextResponse.json({ error: "Petición no válida" }, { status: 400 });
  }

  await prisma.libraryMedia.updateMany({ where: { id: { in: ids } }, data: { status } });
  return NextResponse.json({ ok: true });
}
