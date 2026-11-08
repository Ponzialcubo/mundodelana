/**
 * The public pages as the owner edits them: each page, its sections in the
 * same order as on screen, and the texts and image spots of every section.
 * Client-safe (no database): the admin builds its tabs from this.
 */
import { FORMATS, buildSpotPrompt, type ImageFormat } from "@/lib/image-formats";
import { FRAMES, type Frame } from "@/lib/framing";
import { TEXTS } from "@/lib/site-texts";

export type SpotVersion = { format: ImageFormat; frames: Frame[]; prompt: string };

export type SiteImageSlot = {
  key: string;
  label: string;
  /** What works best in this spot. */
  tips: string;
  desktop: SpotVersion;
  /** Optional vertical version for phones, saved under `${key}-m`. */
  mobile?: SpotVersion;
  /** Can be prepared ahead: switched off or shown only between dates (home banners). */
  schedulable?: boolean;
};

/** Desktop + phone versions of the same scene. */
function bannerVersions(purpose: string, scene: string, desktop: ImageFormat, mobile: ImageFormat, frames: [Frame[], Frame[]], allowPeople = false) {
  return {
    desktop: { format: desktop, frames: frames[0], prompt: buildSpotPrompt({ purpose: `${purpose} (versión ordenador)`, scene, format: desktop, allowPeople }) },
    mobile: {
      format: mobile,
      frames: frames[1],
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

/** Portrait photo shown beside a page's text: one version works on every screen. */
function portrait(purpose: string, scene: string, allowPeople = false): { desktop: SpotVersion } {
  return { desktop: { format: FORMATS.portrait, frames: FRAMES.portrait, prompt: buildSpotPrompt({ purpose, scene, format: FORMATS.portrait, allowPeople }) } };
}

const HERO_SCENES = [
  "una mesa de madera clara junto a una ventana, con ovillos de algodón en tonos pastel, un ganchillo y una cesta de mimbre.",
  "una estantería de madera clara con cestas de mimbre y ovillos de algodón ordenados por colores, con una planta pequeña y luz de tarde.",
  "un rincón de taller acogedor visto desde arriba en diagonal: manta de lino, ovillos, unas tijeras pequeñas y una taza de cerámica.",
  "papel kraft, cinta de algodón y una caja de regalo abierta con papel de seda, sobre una mesa de madera clara.",
];

const HERO_SLOTS: SiteImageSlot[] = HERO_SCENES.map((scene, i) => ({
  key: i === 0 ? "hero" : `hero-${i + 1}`,
  label: `Banner ${i + 1}`,
  tips: "Fondos amplios y tranquilos: mesa de madera, ovillos, luz de ventana. Si quieres que salgan piezas, adjunta sus fotos a ChatGPT/Gemini. El título va a la izquierda en ordenador y abajo en móvil, así que ahí no debe haber nada.",
  schedulable: true,
  ...bannerVersions("el banner principal de la portada", scene, FORMATS.heroDesktop, FORMATS.heroMobile, [FRAMES.heroDesktop, FRAMES.heroMobile]),
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
  label: s.title,
  tips: `Mejor con 1 a 3 piezas reales de este bloque (${s.examples}): adjunta sus fotos a ChatGPT/Gemini. El nombre va debajo de la imagen, así que puede ir llena.`,
  desktop: {
    format: FORMATS.card,
    frames: FRAMES.segment,
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
    label: "Foto principal",
    tips: "Lo ideal es una foto tuya real (tus manos tejiendo o tú en el taller) mejorada con IA: adjúntala y la IA solo mejora luz y fondo.",
    ...portrait(
      "la foto principal de «Sobre mí»",
      "unas manos tejiendo con ganchillo y algodón en tono pastel, en un taller casero ordenado, encuadre cerrado en manos y labor (sin cara). Si te adjunto una foto mía o de mi taller, mantén el parecido y mejora solo luz, encuadre y ambiente.",
      true,
    ),
  },
  {
    key: "about-2",
    label: "Foto del taller 1",
    tips: "Una foto real de tu taller o de tus materiales (ovillos, ganchillos, cestas).",
    ...portrait("una foto del taller en «Sobre mí»", "ovillos de algodón ordenados por colores en una cesta de mimbre y un ganchillo, sobre madera clara. Si te adjunto una foto real de mi taller, respétala y mejora solo luz y encuadre."),
  },
  {
    key: "about-3",
    label: "Foto del taller 2",
    tips: "Piezas a medio tejer o el proceso, con fotos reales tuyas.",
    ...portrait("una foto del proceso en «Sobre mí»", "piezas de crochet a medio tejer de la foto que te adjunto, sobre lino claro junto al ganchillo y el ovillo. Si no adjunto foto, solo el ovillo, el ganchillo y la tela."),
  },
  {
    key: "how",
    label: "Foto principal",
    tips: "Una escena de proceso sin piezas inventadas: ovillos, ganchillo, una libreta y una caja de envío.",
    ...portrait("la foto principal de «Cómo funciona»", "vista desde arriba de una mesa de madera clara con ovillos de algodón, un ganchillo, una libreta abierta con un boceto a lápiz (sin texto legible) y una caja de envío de kraft."),
  },
  {
    key: "contact",
    label: "Foto principal",
    tips: "Algo cercano: una caja de envío con papel de seda y ovillos.",
    ...portrait("la foto principal de «Contacto»", "una caja de envío de kraft abierta con papel de seda y cinta, junto a ovillos de algodón y un móvil boca abajo, sobre una mesa de madera clara."),
  },
];

export const SITE_IMAGE_SLOTS: SiteImageSlot[] = [...HERO_SLOTS, ...SEGMENT_SLOTS, ...PAGE_SLOTS];
export const slotByKey = (key: string) => SITE_IMAGE_SLOTS.find((s) => s.key === key);

/** Every key that can be saved: each slot plus its phone version. */
export const SITE_IMAGE_KEYS = SITE_IMAGE_SLOTS.flatMap((s) => (s.mobile ? [s.key, `${s.key}-m`] : [s.key]));

export type PageSection = {
  id: string;
  title: string;
  /** Where it is on the page, in the owner's words. */
  where: string;
  texts?: string[];
  slots?: string[];
  /** The rotating words of the home banner. */
  phrases?: boolean;
  /** Content edited elsewhere: explained with a link. */
  elsewhere?: { text: string; href: string; label: string };
};

export type SitePage = { key: string; label: string; href: string; summary: string; sections: PageSection[] };

const keys = (defs: { key: string }[], ...pick: string[]) => defs.filter((d) => pick.some((p) => d.key.endsWith(p))).map((d) => d.key);

export const SITE_PAGES: SitePage[] = [
  {
    key: "inicio",
    label: "Inicio",
    href: "/",
    summary: "La portada: lo primero que ve quien entra.",
    sections: [
      { id: "banner", title: "Banner principal", where: "Arriba del todo. Las imágenes van rotando y las frases cambian solas.", phrases: true, texts: keys(TEXTS.home, "heroText"), slots: ["hero", "hero-2", "hero-3", "hero-4"] },
      { id: "fecha", title: "Fecha especial", where: "Debajo del banner, solo mientras hay una fecha en marcha.", elsewhere: { text: "Se prepara en Fechas especiales: texto, imagen y cuándo se muestra.", href: "/admin/fechas", label: "Ir a Fechas especiales" } },
      { id: "buscando", title: "¿Qué estás buscando?", where: "Tarjetas de los bloques de la tienda.", elsewhere: { text: "Usan las mismas fotos que las tarjetas de la Tienda.", href: "/admin/imagenes-web?pagina=tienda", label: "Ir a Tienda" } },
      { id: "sobre-mi", title: "Bloque «Sobre mí»", where: "Hacia el final, junto a tu foto (la foto principal de Sobre mí).", texts: keys(TEXTS.home, "aboutTitle", "aboutText") },
    ],
  },
  {
    key: "tienda",
    label: "Tienda",
    href: "/catalogo",
    summary: "La página donde la clienta elige por bloques y categorías.",
    sections: [
      { id: "cabecera", title: "Cabecera", where: "Arriba, bajo el título «Tienda».", texts: keys(TEXTS.shop, "intro") },
      { id: "bloques", title: "Tarjetas de los bloques", where: "«Explora por categoría» (y también en Inicio). Sin foto propia, se usa la de su primera categoría.", slots: ["seg-munecos", "seg-bebe", "seg-complementos", "seg-hogar", "seg-regalos"] },
      { id: "categorias", title: "Miniaturas de categorías", where: "Los circulitos junto a cada categoría.", elsewhere: { text: "Cada categoría tiene su foto en Categorías.", href: "/admin/categorias", label: "Ir a Categorías" } },
    ],
  },
  {
    key: "sobre-mi",
    label: "Sobre mí",
    href: "/sobre-mi",
    summary: "Tu historia y cómo trabajas.",
    sections: [
      { id: "cabecera", title: "Cabecera", where: "Arriba: título, presentación y tu foto.", texts: keys(TEXTS.about, ".title", "titleHighlight", "intro"), slots: ["about"] },
      { id: "historia", title: "Mi historia", where: "Bloque «Cómo empezó todo», con dos fotos del taller.", texts: keys(TEXTS.about, "storyTitle", "story1", "story2"), slots: ["about-2", "about-3"] },
      { id: "frase", title: "Frase destacada", where: "Banda rosa en el centro de la página.", texts: keys(TEXTS.about, "quote", "quoteNote") },
    ],
  },
  {
    key: "como-funciona",
    label: "Cómo funciona",
    href: "/como-funciona",
    summary: "La página que convence para encargar.",
    sections: [
      { id: "cabecera", title: "Cabecera", where: "Arriba: título, presentación y foto.", texts: keys(TEXTS.how, ".title", "titleHighlight", "intro"), slots: ["how"] },
      { id: "preguntas", title: "Preguntas «Antes de pedir»", where: "Al final de la página.", elsewhere: { text: "Salen de tus preguntas frecuentes.", href: "/admin/ajustes?seccion=preguntas", label: "Ir a Preguntas frecuentes" } },
    ],
  },
  {
    key: "contacto",
    label: "Contacto",
    href: "/contacto",
    summary: "Dónde te escriben.",
    sections: [
      { id: "cabecera", title: "Cabecera", where: "Arriba: título, presentación y foto.", texts: keys(TEXTS.contact, ".title", "titleHighlight", "intro"), slots: ["contact"] },
      { id: "datos", title: "Teléfono, email y horario", where: "Tarjetas de contacto y horario.", elsewhere: { text: "Se cambian en Configuración.", href: "/admin/ajustes", label: "Ir a Configuración" } },
    ],
  },
];

/** Today in Madrid as YYYY-MM-DD, to compare with the banner dates. */
export const todayMadrid = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" });

/** Whether a prepared banner should be on the shop today. */
export function isLive(meta: { hidden: boolean; startsOn: string | null; endsOn: string | null }, today = todayMadrid()) {
  if (meta.hidden) return false;
  if (meta.startsOn && today < meta.startsOn) return false;
  if (meta.endsOn && today > meta.endsOn) return false;
  return true;
}
