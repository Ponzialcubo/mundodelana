import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";
import { normalizarDiseno } from "@/lib/panel-diseno";

// Saves the admin panel design (Diseño del panel). Only the validated shape is stored.
export async function PUT(req: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Tu sesión ha caducado. Vuelve a entrar." }, { status: 401 });
  const diseno = normalizarDiseno(await req.json().catch(() => ({})));
  const panelDesign = JSON.stringify(diseno);
  await prisma.siteSettings.upsert({ where: { id: 1 }, update: { panelDesign }, create: { id: 1, panelDesign } });
  return NextResponse.json({ ok: true, diseno });
}
