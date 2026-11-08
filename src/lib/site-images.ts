import { prisma } from "@/lib/prisma";
import { FORMATS, buildSpotPrompt, type ImageFormat } from "@/lib/image-formats";

export type SiteImageGroup = "portada" | "tienda" | "paginas";

export const SITE_IMAGE_GROUPS: { key: SiteImageGroup; title: string; text: string }[] = [
  {
    key: "portada",
    title: "Banners de la portada",
    text: "Lo primero que se ve al entrar en la web. Van rotando cada pocos segundos. Puedes poner de 1 a 4; con uno ya queda bien.",
  },
  {
    key: "tienda",
    title: "Tarjetas de la tienda",
    text: "La foto de cada bloque en «Tienda» y en «¿Qué estás buscando?» de inicio. Sin imagen, se usa la portada de su primera categoría.",
  },
  {
    key: "paginas",
    title: "Cabeceras de páginas",
    text: "La imagen de arriba de «Sobre mí», «Cómo funciona» y «Contacto».",
  },
];

export type SpotVersion = { format: ImageFormat; prompt: string };

export type SiteImageSlot = {
  key: string;
  group: SiteImageGroup;
  label: string;
  /** Page and position, in the owner's words. */
  where: string;
  /** Link to see it on the shop. */
  href: string;
  /** What works best in this spot. */
  tips: string;
  desktop: SpotVersion;
  /** Optional vertical version for phones, saved under `${key}-m`. */
  mobile?: SpotVersion;
};

/** Desktop + phone versions of the same scene. */
function bannerVersions(purpose: string, scene: string, desktop: ImageFormat, mobile: ImageFormat, allowPeople = false) {
  return {
    desktop: { format: desktop, prompt: buildSpotPrompt({ purpose: `${purpose} (versión ordenador)`, scene, format: desktop, allowPeople }) },
    mobile: {
      format: mobile,
      prompt: buildSpotPrompt({
        purpose: `${purpose} (versión móvil)`,
        scene,
        format: mobile,
        allowPeople,
        extra: "Si ya me has hecho la versión de ordenador, repite la misma escena en vertical.",
      }),
    },
  };
}

const HERO_SCENES = [
  "una mesa de madera clara junto a una ventana, con ovillos de algodón en tonos pastel, un ganchillo y una cesta de mimbre.",
  "una estantería de madera clara con cestas de mimbre y ovillos de algodón ordenados por colores, con una planta pequeña y luz de tarde.",
  "un rincón de taller acogedor visto desde arriba en diagonal: manta de lino, ovillos, unas tijeras pequeñas y una taza de cerámica.",
  "papel kraft, cinta de algodón y una caja de regalo abierta con papel de seda, sobre una mesa de madera clara.",
];

const HERO_SLOTS: SiteImageSlot[] = HERO_SCENES.map((scene, i) => ({
  key: i === 0 ? "hero" : `hero-${i + 1}`,
  group: "portada",
  label: `Banner ${i + 1}`,
  where: i === 0 ? "Inicio · arriba del todo (el primero que se ve)" : "Inicio · arriba del todo (rota con los demás)",
  href: "/",
  tips:
    "Fondos amplios y tranquilos: mesa de madera, ovillos, luz de ventana. Si quieres que salgan piezas, adjunta sus fotos a ChatGPT/Gemini. El título va a la izquierda en ordenador y abajo en móvil, así que ahí no debe haber nada.",
  ...bannerVersions("el banner principal de la portada", scene, FORMATS.heroDesktop, FORMATS.heroMobile),
}));

const SEGMENTS: { key: string; title: string; examples: string; background: string }[] = [
  { key: "munecos", title: "Muñecos y amigurumis", examples: "un amigurumi o una muñeca", background: "fondo liso rosa empolvado muy suave con una tela de lino" },
  { key: "bebe", title: "Bebé y ropa", examples: "un sonajero, un dudú o una prenda de bebé", background: "fondo liso verde salvia muy suave sobre una mantita de algodón" },
  { key: "complementos", title: "Complementos", examples: "unos pendientes o un llavero", background: "fondo liso lila muy suave con un platito de cerámica" },
  { key: "hogar", title: "Para casa", examples: "una flor en maceta o un cojín", background: "fondo liso color miel muy suave sobre madera clara" },
  { key: "regalos", title: "Regalos y fechas", examples: "una pieza de regalo o de temporada", background: "fondo liso azul grisáceo muy suave con papel kraft y cinta" },
];

const SEGMENT_SLOTS: SiteImageSlot[] = SEGMENTS.map((s) => ({
  key: `seg-${s.key}`,
  group: "tienda",
  label: s.title,
  where: `Tienda · tarjeta «${s.title}» — e Inicio · «¿Qué estás buscando?»`,
  href: "/catalogo",
  tips: `Mejor con 1 a 3 piezas reales de este bloque (${s.examples}): adjunta sus fotos a ChatGPT/Gemini. El nombre va debajo de la imagen, así que puede ir llena.`,
  desktop: {
    format: FORMATS.card,
    prompt: buildSpotPrompt({
      purpose: `la tarjeta «${s.title}» de la tienda`,
      scene: `las piezas de las fotos que te adjunto (${s.examples}), protagonistas y centradas, sobre un ${s.background}. Sencillo, limpio y ordenado, como una foto de catálogo.`,
      format: FORMATS.card,
    }),
  },
}));

const PAGE_SLOTS: SiteImageSlot[] = [
  {
    key: "about",
    group: "paginas",
    label: "Sobre mí",
    where: "Sobre mí · cabecera — e Inicio · bloque «Soy Elvira»",
    href: "/sobre-mi",
    tips: "Lo ideal es una foto tuya real (manos tejiendo o tu taller) mejorada con IA: adjúntala y la IA solo mejora luz y fondo. El texto va encima a la izquierda (ordenador) o abajo (móvil).",
    ...bannerVersions(
      "la cabecera de «Sobre mí»",
      "unas manos tejiendo con ganchillo y algodón en tono pastel, en un taller casero ordenado, encuadre cerrado en manos y labor (sin cara). Si te adjunto una foto mía o de mi taller, mantén el parecido y mejora solo luz, encuadre y ambiente.",
      FORMATS.wideDesktop,
      FORMATS.wideMobile,
      true,
    ),
  },
  {
    key: "how",
    group: "paginas",
    label: "Cómo funciona",
    where: "Cómo funciona · cabecera",
    href: "/como-funciona",
    tips: "Una escena de proceso sin piezas inventadas: ovillos, ganchillo, una libreta y una caja de envío.",
    ...bannerVersions(
      "la cabecera de «Cómo funciona»",
      "vista desde arriba de una mesa de madera clara con ovillos de algodón, un ganchillo, una libreta abierta con un boceto a lápiz (sin texto legible) y una caja de envío de kraft, en orden de izquierda a derecha.",
      FORMATS.wideDesktop,
      FORMATS.wideMobile,
    ),
  },
  {
    key: "contact",
    group: "paginas",
    label: "Contacto",
    where: "Contacto · encima del formulario",
    href: "/contacto",
    tips: "Algo cercano: una caja de envío con papel de seda y ovillos. Va en una franja horizontal, sin texto encima.",
    desktop: {
      format: { ...FORMATS.wideDesktop, textZone: "none" },
      prompt: buildSpotPrompt({
        purpose: "la imagen de la página de «Contacto»",
        scene: "una caja de envío de kraft abierta con papel de seda y cinta, junto a ovillos de algodón y un móvil boca abajo, sobre una mesa de madera clara.",
        format: { ...FORMATS.wideDesktop, textZone: "none" },
      }),
    },
  },
];

export const SITE_IMAGE_SLOTS: SiteImageSlot[] = [...HERO_SLOTS, ...SEGMENT_SLOTS, ...PAGE_SLOTS];

/** Every key that can be saved: each slot plus its phone version. */
export const SITE_IMAGE_KEYS = SITE_IMAGE_SLOTS.flatMap((s) => (s.mobile ? [s.key, `${s.key}-m`] : [s.key]));

export type SiteImageValue = { url: string; focalX: number; focalY: number };
export type SiteImages = Partial<Record<string, SiteImageValue>>;
/** A spot with its optional phone version. */
export type ResponsiveImage = { desktop: SiteImageValue; mobile?: SiteImageValue };

export function responsive(images: SiteImages, key: string): ResponsiveImage | undefined {
  const desktop = images[key];
  return desktop ? { desktop, mobile: images[`${key}-m`] } : undefined;
}

/** Home banners in order, only the ones uploaded. */
export function heroSlides(images: SiteImages): ResponsiveImage[] {
  return ["hero", "hero-2", "hero-3", "hero-4"].map((k) => responsive(images, k)).filter((v): v is ResponsiveImage => Boolean(v));
}

export async function getSiteImages(): Promise<SiteImages> {
  const rows = await prisma.siteImage.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, { url: r.url, focalX: r.focalX, focalY: r.focalY }]));
}
