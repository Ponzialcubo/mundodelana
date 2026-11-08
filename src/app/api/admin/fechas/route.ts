import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";
import { slugify } from "@/lib/slugify";

/** New special date with sensible defaults: shown for a month from today, owner edits the rest. */
export async function POST(req: Request) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { name } = await req.json();
  const clean = String(name ?? "").trim().slice(0, 60);
  if (!clean) return NextResponse.json({ error: "Ponle un nombre" }, { status: 400 });

  let slug = slugify(clean) || "fecha";
  if (await prisma.campaign.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const md = (d: Date) => d.toISOString().slice(5, 10);
  const today = new Date();
  const max = await prisma.campaign.aggregate({ _max: { order: true } });
  const campaign = await prisma.campaign.create({
    data: {
      slug,
      name: clean,
      active: false,
      order: (max._max.order ?? 0) + 1,
      startMD: md(today),
      endMD: md(new Date(today.getTime() + 30 * 864e5)),
      bannerTitle: clean,
      bannerText: "Regalos tejidos a mano para esta fecha. Encárgalo con tiempo.",
    },
  });
  return NextResponse.json({ id: campaign.id });
}
