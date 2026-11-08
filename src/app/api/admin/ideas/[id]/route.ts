import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";
import type { IdeaStatus } from "@/generated/prisma";

const AREAS = ["web", "tienda", "panel", "otra"];
const STATUSES: IdeaStatus[] = ["NUEVA", "EN_REVISION", "HECHA", "DESCARTADA"];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const title = body.title === undefined ? undefined : String(body.title).trim().slice(0, 140);
  if (title === "") return NextResponse.json({ error: "El título no puede quedar vacío" }, { status: 400 });
  await prisma.idea.update({
    where: { id },
    data: {
      title,
      description: body.description === undefined ? undefined : String(body.description).trim().slice(0, 4000),
      area: AREAS.includes(body.area) ? body.area : undefined,
      status: STATUSES.includes(body.status) ? body.status : undefined,
    },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  await prisma.idea.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
