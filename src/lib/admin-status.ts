import { PieceStatus, PublicationStatus } from "@/generated/prisma";

export const PIECE_STATUS_LABEL: Record<PieceStatus, string> = {
  DISPONIBLE: "Disponible",
  TRABAJANDO_EN_ELLO: "Trabajando en ello",
  RESERVADO: "Reservado",
  VENDIDO: "Vendido",
  VENDIDO_POR_ENCARGO: "Vendido por encargo",
};

export const PIECE_STATUS_DOT: Record<PieceStatus, string> = {
  DISPONIBLE: "#9CAF88",
  TRABAJANDO_EN_ELLO: "#E8B4B8",
  RESERVADO: "#D9A566",
  VENDIDO: "#8B837F",
  VENDIDO_POR_ENCARGO: "#8FA3B0",
};

export const PUBLICATION_LABEL: Record<PublicationStatus, string> = {
  PUBLICADO: "Publicado",
  BORRADOR: "Borrador",
  ARCHIVADO: "Archivado",
};

export const PUBLICATION_BADGE: Record<PublicationStatus, { bg: string; fg: string }> = {
  PUBLICADO: { bg: "#EAF0E4", fg: "#5C7245" },
  BORRADOR: { bg: "#F3F1EE", fg: "#6E6663" },
  ARCHIVADO: { bg: "#F6E9E8", fg: "#9A6360" },
};
