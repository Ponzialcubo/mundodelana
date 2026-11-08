import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";

const IDEA_AREAS = ["web", "tienda", "panel", "otra"];

export async function POST(req: Request) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json();
  const title = String(body.title ?? "").trim().slice(0, 140);
  if (!title) return NextResponse.json({ error: "Escribe un título" }, { status: 400 });
  const idea = await prisma.idea.create({
    data: {
      title,
      description: String(body.description ?? "").trim().slice(0, 4000),
      area: IDEA_AREAS.includes(body.area) ? body.area : "web",
    },
  });
  return NextResponse.json({ id: idea.id });
}
