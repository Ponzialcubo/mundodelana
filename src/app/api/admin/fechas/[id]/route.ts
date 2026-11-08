import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";

const MD = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  if (!MD.test(body.startMD) || !MD.test(body.endMD) || (body.deadlineMD && !MD.test(body.deadlineMD))) {
    return NextResponse.json({ error: "Revisa las fechas" }, { status: 400 });
  }
  if (!body.bannerTitle?.trim() || !body.bannerText?.trim()) {
    return NextResponse.json({ error: "El banner necesita título y texto" }, { status: 400 });
  }

  await prisma.campaign.update({
    where: { id },
    data: {
      active: Boolean(body.active),
      startMD: body.startMD,
      endMD: body.endMD,
      deadlineMD: body.deadlineMD || null,
      bannerTitle: body.bannerTitle.trim(),
      bannerText: body.bannerText.trim(),
      bannerImage: body.banner?.url ?? null,
      bannerFocalX: body.banner?.focalX ?? 0.5,
      bannerFocalY: body.banner?.focalY ?? 0.5,
      bannerImageMobile: body.bannerMobile?.url ?? null,
      bannerMobileFocalX: body.bannerMobile?.focalX ?? 0.5,
      bannerMobileFocalY: body.bannerMobile?.focalY ?? 0.5,
      accent: body.accent,
      products: { set: (body.productIds ?? []).map((pid: string) => ({ id: pid })) },
    },
  });
  return NextResponse.json({ ok: true });
}
