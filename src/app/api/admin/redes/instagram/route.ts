import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { fetchInstagramMedia } from "@/lib/social/instagram";

export async function GET() {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const media = await fetchInstagramMedia();
    return NextResponse.json({ media });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se ha podido leer Instagram.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
