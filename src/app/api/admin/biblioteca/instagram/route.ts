import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { importFromInstagram } from "@/lib/library";

export async function POST() {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    return NextResponse.json(await importFromInstagram());
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: `No se ha podido conectar con Instagram: ${message}` }, { status: 502 });
  }
}
