/**
 * Groups the categories into a few shopper-friendly blocks for the shop
 * landing, the mobile menu and the listing breadcrumbs. Categories not listed
 * here still show up under "Más".
 */
export type Segment = { key: string; title: string; subtitle: string; slugs: string[]; tint: string; ink: string };

export const SEGMENTS: Segment[] = [
  { key: "munecos", title: "Muñecos y amigurumis", subtitle: "Personajes, animalitos y muñecas", slugs: ["amigurumis"], tint: "#F1DCDD", ink: "#7A4E52" },
  { key: "bebe", title: "Bebé y ropa", subtitle: "Sonajeros, dudús, vestiditos y conjuntos", slugs: ["bebe", "ropa"], tint: "#E3EADB", ink: "#4F6645" },
  { key: "complementos", title: "Complementos", subtitle: "Pendientes, llaveros y detalles", slugs: ["pendientes", "complementos"], tint: "#EFE3F3", ink: "#6B4F78" },
  { key: "hogar", title: "Para casa", subtitle: "Flores que no se marchitan, cojines y decoración", slugs: ["plantas-decorativas", "decoracion"], tint: "#F6E7D3", ink: "#7A5A2E" },
  { key: "regalos", title: "Regalos y fechas", subtitle: "Packs, Navidad, Samaín y más", slugs: ["packs-regalo", "navidad", "temporada"], tint: "#DCE6EC", ink: "#45606E" },
];

export function segmentOf(slug: string): Segment | undefined {
  return SEGMENTS.find((s) => s.slugs.includes(slug));
}
