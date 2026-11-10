/**
 * Admin panel design chosen by the owner (Diseño del panel): the 4 phone bottom-bar tabs around the central
 * «Nuevo producto», the screen that opens first and which Inicio blocks show (and in what order).
 * Safe on client and server (no database here).
 */
import { ALL_ITEMS } from "@/components/admin/admin-nav";

export const BLOQUES_INICIO: { k: string; t: string }[] = [
  { k: "atajos", t: "Accesos rápidos" }, { k: "mensajes", t: "Mensajes sin leer" }, { k: "pedidos", t: "Pedidos nuevos" },
  { k: "incompletos", t: "Piezas por completar" }, { k: "cifras", t: "Cifras" }, { k: "top", t: "Lo que más gusta" },
];
export const MAX_BARRA = 4;

export type Diseno = { barra: string[]; inicio: string; bloques: { k: string; ver: boolean }[] };
export const DISENO_BASE: Diseno = {
  barra: ["/admin", "/admin/pedidos", "/admin/mensajes", "/admin/productos"], inicio: "/admin",
  bloques: BLOQUES_INICIO.map((b) => ({ k: b.k, ver: true })),
};

/** Known keys only, no repeats, every block present. */
export function normalizarDiseno(v: unknown): Diseno {
  const o = (v && typeof v === "object" ? v : {}) as Partial<Diseno>;
  const validas = new Set(ALL_ITEMS.map((i) => i.href));
  const barra = Array.isArray(o.barra) ? [...new Set(o.barra.filter((k) => typeof k === "string" && validas.has(k)))].slice(0, MAX_BARRA) : DISENO_BASE.barra;
  const inicio = typeof o.inicio === "string" && validas.has(o.inicio) ? o.inicio : "/admin";
  const vistos = new Set<string>();
  const bloques = (Array.isArray(o.bloques) ? o.bloques : []).filter((b) => b && BLOQUES_INICIO.some((x) => x.k === b.k) && !vistos.has(b.k) && vistos.add(b.k))
    .map((b) => ({ k: b.k, ver: b.ver !== false }));
  for (const b of BLOQUES_INICIO) if (!vistos.has(b.k)) bloques.push({ k: b.k, ver: true });
  return { barra: barra.length ? barra : DISENO_BASE.barra, inicio, bloques };
}
export function leerDiseno(json: string | null | undefined): Diseno {
  try { return normalizarDiseno(JSON.parse(json || "{}")); } catch { return normalizarDiseno({}); }
}
