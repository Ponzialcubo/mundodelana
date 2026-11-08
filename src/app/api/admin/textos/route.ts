import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";
import { TEXT_DEFS } from "@/lib/site-texts";

const KEYS = new Set(TEXT_DEFS.map((d) => d.key));

/** Saves some page texts at once. An empty value goes back to the default wording. */
export async function PUT(req: Request) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { values } = (await req.json()) as { values?: Record<string, string> };
  const entries = Object.entries(values ?? {}).filter(([key, value]) => KEYS.has(key) && typeof value === "string");
  if (entries.length === 0) return NextResponse.json({ error: "Nada que guardar" }, { status: 400 });

  await prisma.$transaction(
    entries.map(([key, value]) =>
      value.trim()
        ? prisma.siteText.upsert({ where: { key }, create: { key, value: value.trim().slice(0, 2000) }, update: { value: value.trim().slice(0, 2000) } })
        : prisma.siteText.deleteMany({ where: { key } }),
    ),
  );
  return NextResponse.json({ ok: true });
}
