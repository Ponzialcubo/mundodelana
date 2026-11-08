import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";

/** Replaces the hashtag groups with the edited list (in order). */
export async function PUT(req: Request) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { sets } = (await req.json()) as { sets?: { name: string; tags: string }[] };
  const clean = (sets ?? [])
    .map((s) => ({
      name: String(s.name ?? "").trim().slice(0, 40),
      tags: [...new Set(String(s.tags ?? "").split(/[\s,]+/).filter(Boolean).map((t) => `#${t.replace(/^#+/, "").toLowerCase()}`))].join(" "),
    }))
    .filter((s) => s.name && s.tags);

  await prisma.$transaction([prisma.hashtagSet.deleteMany({}), ...clean.map((s, order) => prisma.hashtagSet.create({ data: { ...s, order } }))]);
  return NextResponse.json({ ok: true });
}
