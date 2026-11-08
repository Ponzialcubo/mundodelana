import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";
import { SITE_IMAGE_KEYS } from "@/lib/site-pages";

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const num = (v: unknown, fallback: number, min: number, max: number) => (typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback);

/** Uploads or reframes the image of a spot (keeps its visibility settings). */
export async function PUT(req: Request) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json();
  const { key, url } = body;
  if (!SITE_IMAGE_KEYS.includes(key) || typeof url !== "string" || !url.startsWith("/uploads/")) {
    return NextResponse.json({ error: "Petición no válida" }, { status: 400 });
  }
  const framing = { url, focalX: num(body.focalX, 0.5, 0, 1), focalY: num(body.focalY, 0.5, 0, 1), zoom: num(body.zoom, 1, 1, 3) };
  await prisma.siteImage.upsert({ where: { key }, create: { key, ...framing }, update: framing });
  return NextResponse.json({ ok: true });
}

/** Visibility of a prepared banner: switched on/off and optional dates. */
export async function PATCH(req: Request) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { key, hidden, startsOn, endsOn } = await req.json();
  if (!SITE_IMAGE_KEYS.includes(key)) return NextResponse.json({ error: "Petición no válida" }, { status: 400 });
  for (const d of [startsOn, endsOn]) {
    if (d && !DAY.test(d)) return NextResponse.json({ error: "Fecha no válida" }, { status: 400 });
  }
  if (startsOn && endsOn && startsOn > endsOn) {
    return NextResponse.json({ error: "La fecha de fin es anterior a la de inicio" }, { status: 400 });
  }
  await prisma.siteImage.update({
    where: { key },
    data: {
      hidden: Boolean(hidden),
      startsOn: startsOn ? new Date(`${startsOn}T00:00:00Z`) : null,
      endsOn: endsOn ? new Date(`${endsOn}T00:00:00Z`) : null,
    },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { key } = await req.json();
  if (!SITE_IMAGE_KEYS.includes(key)) return NextResponse.json({ error: "Petición no válida" }, { status: 400 });
  await prisma.siteImage.deleteMany({ where: { key } });
  return NextResponse.json({ ok: true });
}
