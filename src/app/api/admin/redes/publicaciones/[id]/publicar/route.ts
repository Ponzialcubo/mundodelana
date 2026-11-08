import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { publishSocialPost } from "@/lib/social/publish";

// Carousels with videos wait for Instagram to process each one.
export const maxDuration = 300;

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!process.env.INSTAGRAM_PAGE_ACCESS_TOKEN) return NextResponse.json({ error: "Instagram no está conectado." }, { status: 500 });

  const { id } = await params;
  const result = await publishSocialPost(id);
  return result.ok ? NextResponse.json(result) : NextResponse.json({ error: result.error }, { status: 502 });
}
