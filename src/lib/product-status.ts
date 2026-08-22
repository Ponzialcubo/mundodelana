import { PieceStatus } from "@/generated/prisma";

export const STATUS_LABEL: Record<PieceStatus, string> = {
  DISPONIBLE: "Disponible",
  TRABAJANDO_EN_ELLO: "Trabajando en ello",
  RESERVADO: "Reservado",
  VENDIDO: "Vendido",
  VENDIDO_POR_ENCARGO: "Vendido por encargo",
};

export const STATUS_BADGE: Record<PieceStatus, { label: string; bg: string; fg: string }> = {
  DISPONIBLE: { label: "DISPONIBLE", bg: "#9CAF88", fg: "#ffffff" },
  TRABAJANDO_EN_ELLO: { label: "TRABAJANDO EN ELLO", bg: "#E8B4B8", fg: "#4A3F3B" },
  RESERVADO: { label: "A MEDIDA", bg: "#E8B4B8", fg: "#4A3F3B" },
  VENDIDO: { label: "VENDIDO", bg: "#EFE7DE", fg: "#8A7A72" },
  VENDIDO_POR_ENCARGO: { label: "VENDIDO POR ENCARGO", bg: "#EFE7DE", fg: "#8A7A72" },
};

export const STATUS_DOT: Record<PieceStatus, string> = {
  DISPONIBLE: "#9CAF88",
  TRABAJANDO_EN_ELLO: "#E8B4B8",
  RESERVADO: "#D9A566",
  VENDIDO: "#8B837F",
  VENDIDO_POR_ENCARGO: "#8FA3B0",
};

export const STATUS_CTA: Record<PieceStatus, { cta: string; note: string }> = {
  DISPONIBLE: {
    cta: "Reservar esto",
    note: "Pieza única ya tejida. Se envía en 24-72 h tras la reserva.",
  },
  TRABAJANDO_EN_ELLO: {
    cta: "Reservar esto",
    note: "En el taller ahora mismo. Te enseño fotos del avance antes de enviar.",
  },
  RESERVADO: {
    cta: "Pedir personalizado",
    note: "Empezamos con una conversación: colores, tamaño y fecha. Plazo habitual, 1-2 semanas.",
  },
  VENDIDO: {
    cta: "Pedir uno igual",
    note: "Esta unidad ya tiene dueño, pero puedo tejer otra igual por encargo.",
  },
  VENDIDO_POR_ENCARGO: {
    cta: "Pedir personalizado",
    note: "Se tejió para una clienta. Puedo hacer una versión adaptada a lo que buscas.",
  },
};

export function formatPrice(price: number | string, priceType: "STOCK" | "PERSONALIZADO"): string {
  const n = typeof price === "string" ? parseFloat(price) : price;
  const formatted = `${n.toFixed(0)} €`;
  return priceType === "PERSONALIZADO" ? `desde ${formatted}` : formatted;
}
