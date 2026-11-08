import { prisma } from "@/lib/prisma";

const BRAND_STYLE = `Estilo de marca Mundolana (crochet artesanal hecho a mano en Galicia): tonos cálidos y suaves (crema #F7F1EA, beige #EDE4DA, rosa empolvado #E8B4B8, verde salvia #9CAF88), luz natural de ventana, sensación acogedora y artesanal, aspecto de fotografía real profesional (no ilustración, no 3D, no plástico). Sin texto, sin logos, sin marcas de agua.`;

export type SiteImageSlot = {
  key: "hero" | "about" | "how" | "contact";
  label: string;
  where: string;
  /** Recommended output, also used for the admin preview box. */
  ratio: string;
  aspectClass: string;
  prompt: string;
};

export const SITE_IMAGE_SLOTS: SiteImageSlot[] = [
  {
    key: "hero",
    label: "Portada de la web",
    where: "Fondo de la parte de arriba de la página de inicio (sobre todo en móvil).",
    ratio: "vertical 4:5 (1080 × 1350 px) — y si puedes, otra horizontal 16:9 (1920 × 1080) para ordenador",
    aspectClass: "aspect-[4/5]",
    prompt: `Crea una fotografía de fondo para la portada de una tienda online de amigurumis y crochet hecho a mano.

ESCENA: una mesa de madera clara junto a una ventana con luz suave de mañana. Varios amigurumis de crochet (animalitos y muñequitas de algodón, con puntos visibles) agrupados de forma natural en un lado, junto a ovillos de algodón en tonos pastel, un ganchillo y unas flores de crochet. Deja la mitad superior de la imagen más despejada y desenfocada (fondo crema) para poder poner texto encima.

${BRAND_STYLE}

Si te adjunto fotos de mis piezas, úsalas como referencia de estilo y colores, pero no hace falta copiarlas exactas.

FORMATO: vertical 4:5 (1080 × 1350 px). Si puedes, genera también una versión horizontal 16:9 (1920 × 1080) con los amigurumis a la derecha y espacio libre a la izquierda.`,
  },
  {
    key: "about",
    label: "Sobre mí",
    where: "Foto principal de la página «Sobre mí» y del bloque «Sobre mí» de inicio.",
    ratio: "vertical 4:5 (1080 × 1350 px)",
    aspectClass: "aspect-[4/5]",
    prompt: `Crea una fotografía profesional y cálida de una artesana tejiendo a crochet en su taller.

ESCENA: plano medio de sus manos y torso (sin que se vea la cara, o de perfil desenfocado), tejiendo un amigurumi con ganchillo y algodón de color pastel. Alrededor, una cesta con ovillos, algún amigurumi terminado y una taza. Ambiente de taller casero y ordenado, luz natural de ventana lateral, profundidad de campo suave.

${BRAND_STYLE}

Si te adjunto una foto mía o de mi taller, mantén el parecido (pelo, ropa, espacio) y mejora solo la luz, el encuadre y el ambiente.

FORMATO: vertical 4:5 (1080 × 1350 px).`,
  },
  {
    key: "how",
    label: "Cómo funciona",
    where: "Cabecera de la página «Cómo funciona».",
    ratio: "horizontal 3:2 (1620 × 1080 px)",
    aspectClass: "aspect-[3/2]",
    prompt: `Crea una fotografía de detalle, vista cenital (desde arriba), de un proceso de crochet sobre una mesa de madera clara.

ESCENA: de izquierda a derecha, como una pequeña historia: ovillos de algodón y un boceto o foto de referencia, piezas a medio tejer (una cabecita, unas patitas), y al final un amigurumi terminado junto a una caja de regalo con papel kraft y cinta. Composición limpia y ordenada, con espacio entre los elementos.

${BRAND_STYLE}

FORMATO: horizontal 3:2 (1620 × 1080 px).`,
  },
  {
    key: "contact",
    label: "Contacto",
    where: "Cabecera de la página «Contacto».",
    ratio: "horizontal 3:2 (1620 × 1080 px)",
    aspectClass: "aspect-[3/2]",
    prompt: `Crea una fotografía cálida de un paquete listo para enviar desde un taller de crochet.

ESCENA: una caja de regalo con papel kraft, cinta y una tarjeta escrita a mano, con un amigurumi asomando entre papel de seda, sobre una mesa de madera clara; al lado un móvil y unos ovillos. Transmite cercanía: "escríbeme y te lo preparo con cariño".

${BRAND_STYLE}

FORMATO: horizontal 3:2 (1620 × 1080 px).`,
  },
];

export type SiteImages = Partial<Record<SiteImageSlot["key"], { url: string; focalX: number; focalY: number }>>;

export async function getSiteImages(): Promise<SiteImages> {
  const rows = await prisma.siteImage.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, { url: r.url, focalX: r.focalX, focalY: r.focalY }]));
}
