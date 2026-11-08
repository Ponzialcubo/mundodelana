import type { OrderState } from "@/generated/prisma";

/** Customer-facing order states, shared by the account pages. */
export const STATE_LABEL: Record<OrderState, string> = {
  NUEVO: "Recibido",
  COTIZADO: "Presupuesto enviado",
  CONFIRMADO: "Confirmado",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
};

export const STATE_HINT: Record<OrderState, string> = {
  NUEVO: "Lo he recibido, te escribo pronto",
  COTIZADO: "Tienes el precio y el plazo, falta tu confirmación",
  CONFIRMADO: "Detalles cerrados, lo estoy tejiendo",
  ENVIADO: "En camino",
  ENTREGADO: "Ya en tus manos",
};

export const STATE_DOT: Record<OrderState, string> = {
  NUEVO: "#E8B4B8",
  COTIZADO: "#D9A566",
  CONFIRMADO: "#6F8A64",
  ENVIADO: "#8FA3B0",
  ENTREGADO: "#9CAF88",
};

export const STATE_STEPS: OrderState[] = ["NUEVO", "COTIZADO", "CONFIRMADO", "ENVIADO", "ENTREGADO"];

export const formatDate = (d: Date) => d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Madrid" });
