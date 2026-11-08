import { prisma } from "@/lib/prisma";

const BRAND_STYLE = `Estilo de marca Mundolana (crochet artesanal hecho a mano en Galicia): tonos cálidos y suaves (crema #F7F1EA, beige #EDE4DA, rosa empolvado #E8B4B8, verde salvia #9CAF88), luz natural de ventana, sensación acogedora y artesanal, aspecto de fotografía real profesional (no ilustración, no 3D, no plástico). Sin texto, sin logos, sin marcas de agua.`;

export type SiteImageGroup = "portada" | "tienda" | "paginas";

export const SITE_IMAGE_GROUPS: { key: SiteImageGroup; title: string; text: string }[] = [
  { key: "portada", title: "Banners de la portada", text: "Van rotando en la parte de arriba de inicio, uno cada pocos segundos. Puedes poner de 1 a 4." },
  { key: "tienda", title: "Tarjetas de la tienda", text: "Fondo de cada bloque de la tienda y de «¿Qué estás buscando?» en inicio. Sin imagen, se usa la foto de su pieza más representativa." },
  { key: "paginas", title: "Páginas", text: "Fotos de «Sobre mí», «Cómo funciona» y «Contacto»." },
];

export type SiteImageSlot = {
  key: string;
  group: SiteImageGroup;
  label: string;
  where: string;
  /** Recommended output, also used for the admin preview box. */
  ratio: string;
  aspectClass: string;
  prompt: string;
};

const HERO_SCENES = [
  "un primer plano de una cesta de mimbre llena de amigurumis de crochet (osito, conejita, muñequita) asomando entre ovillos de algodón pastel",
  "una estantería de madera clara con amigurumis y flores de crochet ordenados como en una pequeña tienda de barrio, con luz de tarde",
  "manos tejiendo un amigurumi con ganchillo sobre el regazo, con ovillos y piezas terminadas alrededor, muy cálido y cercano",
];

const HERO_EXTRA: SiteImageSlot[] = HERO_SCENES.map((scene, i) => ({
  key: `hero-${i + 2}`,
  group: "portada",
  label: `Banner ${i + 2}`,
  where: "Banner que rota en la parte de arriba de inicio (opcional).",
  ratio: "horizontal 16:9 (1920 × 1080 px), con las piezas a un lado",
  aspectClass: "aspect-[16/9]",
  prompt: `Crea una fotografía de banner para la portada de una tienda online de crochet y amigurumis hechos a mano.

ESCENA: ${scene}. Coloca lo importante en el lado derecho y deja el lado izquierdo y la parte de abajo más despejados y suaves para poner texto encima.

${BRAND_STYLE}

FORMATO: horizontal 16:9 (1920 × 1080 px). Que funcione también recortada en vertical para móvil (lo importante, cerca del centro-derecha).`,
}));

const SEGMENT_SCENES: Record<string, string> = {
  munecos: "un grupo de amigurumis (animalitos y muñequitas) sentados juntos como en una foto de familia",
  bebe: "ropita de bebé tejida a crochet doblada, un sonajero amigurumi y un dudú sobre una mantita, tonos verde salvia y crema",
  complementos: "pendientes de crochet en forma de flores y frutas y unos llaveros amigurumi sobre un platito de cerámica, tonos lila y rosa",
  hogar: "flores y plantas de crochet en macetitas de barro y un cojín tejido sobre un sofá claro, tonos miel y crema",
  regalos: "una caja de regalo abierta con papel de seda y amigurumis dentro, con lazo y tarjeta, tonos azul suave y crema",
};

const SEGMENT_TITLES: Record<string, string> = {
  munecos: "Muñecos y amigurumis",
  bebe: "Bebé y ropa",
  complementos: "Complementos",
  hogar: "Para casa",
  regalos: "Regalos y fechas",
};

const SEGMENT_SLOTS: SiteImageSlot[] = Object.entries(SEGMENT_SCENES).map(([key, scene]) => ({
  key: `seg-${key}`,
  group: "tienda",
  label: SEGMENT_TITLES[key],
  where: `Tarjeta «${SEGMENT_TITLES[key]}» de la tienda y de inicio.`,
  ratio: "vertical 4:5 (1080 × 1350 px)",
  aspectClass: "aspect-[4/5]",
  prompt: `Crea una fotografía para la tarjeta «${SEGMENT_TITLES[key]}» de una tienda online de crochet hecho a mano.

ESCENA: ${scene}. Composición sencilla con un protagonista claro en la mitad superior; deja el tercio de abajo más limpio y oscuro-suave porque ahí irá el título en blanco.

${BRAND_STYLE}

Si te adjunto fotos de mis piezas, úsalas como protagonistas manteniéndolas exactamente iguales (formas, colores y detalles).

FORMATO: vertical 4:5 (1080 × 1350 px).`,
}));

export const SITE_IMAGE_SLOTS: SiteImageSlot[] = [
  {
    key: "hero",
    group: "portada",
    label: "Banner 1",
    where: "Primer banner de inicio, el que se ve nada más entrar.",
    ratio: "vertical 4:5 (1080 × 1350 px) — y si puedes, otra horizontal 16:9 (1920 × 1080) para ordenador",
    aspectClass: "aspect-[4/5]",
    prompt: `Crea una fotografía de fondo para la portada de una tienda online de amigurumis y crochet hecho a mano.

ESCENA: una mesa de madera clara junto a una ventana con luz suave de mañana. Varios amigurumis de crochet (animalitos y muñequitas de algodón, con puntos visibles) agrupados de forma natural en un lado, junto a ovillos de algodón en tonos pastel, un ganchillo y unas flores de crochet. Deja la mitad superior de la imagen más despejada y desenfocada (fondo crema) para poder poner texto encima.

${BRAND_STYLE}

Si te adjunto fotos de mis piezas, úsalas como referencia de estilo y colores, pero no hace falta copiarlas exactas.

FORMATO: vertical 4:5 (1080 × 1350 px). Si puedes, genera también una versión horizontal 16:9 (1920 × 1080) con los amigurumis a la derecha y espacio libre a la izquierda.`,
  },
  ...HERO_EXTRA,
  ...SEGMENT_SLOTS,
  {
    key: "about",
    group: "paginas",
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
    group: "paginas",
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
    group: "paginas",
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

export type SiteImageValue = { url: string; focalX: number; focalY: number };
export type SiteImages = Partial<Record<string, SiteImageValue>>;

/** Home banners in order (hero, hero-2…), only the ones uploaded. */
export function heroSlides(images: SiteImages): SiteImageValue[] {
  return ["hero", "hero-2", "hero-3", "hero-4"].map((k) => images[k]).filter((v): v is SiteImageValue => Boolean(v));
}

export async function getSiteImages(): Promise<SiteImages> {
  const rows = await prisma.siteImage.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, { url: r.url, focalX: r.focalX, focalY: r.focalY }]));
}
