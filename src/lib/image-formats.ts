/**
 * Exact sizes for every image spot of the shop, and the rules every AI image
 * prompt shares. Client-safe (no database access): the admin uses it to show
 * the real crop and the public pages use the same aspect ratios, so what the
 * owner generates is what fits.
 */

export type TextZone = "left" | "bottom" | "none";

export type ImageFormat = {
  width: number;
  height: number;
  ratio: string;
  /** Tailwind class with the same proportion, for previews. */
  aspectClass: string;
  /** Where the website writes text over the image. */
  textZone: TextZone;
};

export const FORMATS = {
  /** Home banner on computers. */
  heroDesktop: { width: 2400, height: 1050, ratio: "16:7", aspectClass: "aspect-[16/7]", textZone: "left" },
  /** Home banner on phones (the whole first screen). */
  heroMobile: { width: 1080, height: 1620, ratio: "2:3", aspectClass: "aspect-[2/3]", textZone: "bottom" },
  /** Special date banners on computers. */
  wideDesktop: { width: 2400, height: 800, ratio: "3:1", aspectClass: "aspect-[3/1]", textZone: "left" },
  /** Special date banners on phones. */
  wideMobile: { width: 1080, height: 1350, ratio: "4:5", aspectClass: "aspect-[4/5]", textZone: "bottom" },
  /** Shop block cards (title goes under the image). */
  card: { width: 1200, height: 900, ratio: "4:3", aspectClass: "aspect-[4/3]", textZone: "none" },
  /** Page headers and story photos (shown beside the text, never under it). */
  portrait: { width: 1080, height: 1350, ratio: "4:5", aspectClass: "aspect-[4/5]", textZone: "none" },
  /** Category thumbnails. */
  square: { width: 1080, height: 1080, ratio: "1:1", aspectClass: "aspect-square", textZone: "none" },
} satisfies Record<string, ImageFormat>;

export const formatLabel = (f: ImageFormat) => `${f.width} × ${f.height} px (${f.ratio})`;

const ZONE_TEXT: Record<TextZone, string> = {
  left: "La web escribe el título encima, en la MITAD IZQUIERDA: deja esa zona limpia, lisa y algo desenfocada, sin objetos. Coloca todo en el tercio derecho.",
  bottom: "La web escribe el título encima, en el 45 % DE ABAJO: deja esa zona limpia, lisa y suave, sin objetos. Coloca todo en la parte de arriba.",
  none: "Composición centrada con margen generoso alrededor: en algunos tamaños se recorta un poco por los bordes.",
};

const PIECES_RULE = `PIEZAS DE CROCHET
- No inventes figuras, muñecos ni piezas de crochet.
- Si te adjunto fotos de mis piezas, colócalas en la escena EXACTAMENTE iguales (forma, colores, puntos, ojos y accesorios); solo cambian la luz y el fondo.
- Si no te adjunto fotos, no pongas ninguna pieza: solo el fondo y los elementos genéricos.`;

const STYLE = `ESTILO
- Fotografía realista y profesional, luz natural suave de ventana, poca profundidad de campo.
- Tonos cálidos de la marca: crema #F7F1EA, beige #EDE4DA, rosa empolvado #E8B4B8, verde salvia #9CAF88.
- Elementos genéricos permitidos: madera clara, lino, ovillos de algodón, ganchillo, papel kraft, cinta, ramitas o flores secas, cerámica sencilla.`;

const forbidden = (allowPeople: boolean) =>
  `PROHIBIDO
- Texto, letras, números, logos, marcas de agua o marcos.
- Bordados, estampados, patrones o gráficos dibujados encima de la imagen.
${allowPeople ? "" : "- Personas o manos.\n"}- Aspecto de ilustración, 3D o plástico.`;

/** Full prompt for one image spot: size, text zone, scene and the shared rules. */
export function buildSpotPrompt({
  purpose,
  scene,
  format,
  allowPeople = false,
  extra,
}: {
  purpose: string;
  scene: string;
  format: ImageFormat;
  allowPeople?: boolean;
  extra?: string;
}): string {
  return `Crea una imagen para ${purpose} de Mundolana, una tienda online de crochet y amigurumis hechos a mano en Galicia.

MEDIDAS EXACTAS: ${formatLabel(format)}.
${ZONE_TEXT[format.textZone]}

ESCENA: ${scene}
${extra ? `\n${extra}\n` : ""}
${PIECES_RULE}

${STYLE}

${forbidden(allowPeople)}`;
}
