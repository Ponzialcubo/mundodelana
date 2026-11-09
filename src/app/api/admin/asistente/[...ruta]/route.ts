import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { agente, asistenteActivo } from "@/lib/asistente";

export const dynamic = "force-dynamic";

// Only these agent routes can be reached from the panel.
const PERMITIDAS = /^\/conversaciones(\/\d+(\/(mensajes|encargo|valorar|restaurar|propuestas\/\d+\/(confirmar|descartar)))?)?$/;

async function pasar(req: Request, { params }: { params: Promise<{ ruta: string[] }> }) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Tu sesión ha caducado. Vuelve a entrar." }, { status: 401 });
  if (!asistenteActivo()) return NextResponse.json({ error: "El asistente no está activado en esta tienda." }, { status: 503 });
  const sub = "/" + (await params).ruta.join("/");
  if (!PERMITIDAS.test(sub)) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  const metodo = req.method;
  try {
    const r = await agente(sub + new URL(req.url).search, {
      method: metodo,
      body: metodo === "POST" || metodo === "PATCH" ? await req.text() : undefined,
    });
    return new NextResponse(await r.text(), { status: r.status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "El asistente no responde ahora mismo. Prueba en un momento." }, { status: 503 });
  }
}

export const GET = pasar;
export const POST = pasar;
export const PATCH = pasar;
export const DELETE = pasar;
