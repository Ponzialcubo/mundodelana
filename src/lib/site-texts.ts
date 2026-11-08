/**
 * Editable texts of the public pages, with the wording used until the owner
 * changes it. Client-safe: the admin builds its forms from this list.
 */
export type TextDef = { key: string; label: string; default: string; multiline?: boolean; hint?: string };

export const TEXTS = {
  home: [
    {
      key: "home.heroText",
      label: "Texto bajo el título",
      default: "Amigurumis, ropita de bebé, flores que no se marchitan y regalos de crochet hechos por encargo en Galicia.",
      multiline: true,
    },
    { key: "home.aboutTitle", label: "Título del bloque «Sobre mí»", default: "Soy Elvira, y cada pieza pasa por mis manos" },
    {
      key: "home.aboutText",
      label: "Texto del bloque «Sobre mí»",
      default: "Empecé tejiendo amigurumis para mi hijo y hoy tejo encargos para toda España desde mi taller en Galicia.",
      multiline: true,
    },
  ],
  shop: [{ key: "shop.intro", label: "Texto bajo «Tienda»", default: "Todo se teje a mano y por encargo, en los colores que prefieras." }],
  about: [
    { key: "about.title", label: "Título (primera parte)", default: "Soy Elvira, y cada pieza" },
    { key: "about.titleHighlight", label: "Título (parte en cursiva rosa)", default: "pasa por mis manos" },
    {
      key: "about.intro",
      label: "Presentación",
      default:
        "Empecé haciendo amigurumis para mi hijo y aquello acabó convirtiéndose en mi propio taller en Galicia. Cinco años después sigo en la misma silla, con mejor luz y bastante más lana.",
      multiline: true,
    },
    { key: "about.storyTitle", label: "Título de la historia", default: "Cómo empezó todo" },
    {
      key: "about.story1",
      label: "Historia · primer párrafo",
      default:
        "El primer amigurumi lo hice para mi hijo: un osito torcido, con un ojo más alto que el otro, que todavía duerme con él. A la semana me lo pidió una amiga, luego su madre, y así hasta hoy.",
      multiline: true,
    },
    {
      key: "about.story2",
      label: "Historia · segundo párrafo",
      default:
        "Hoy tejo encargos para toda España: muñecos a partir de una foto, ropita de bebé, flores que no se marchitan y regalos para fechas especiales. Cada pieza la hago yo, de principio a fin.",
      multiline: true,
    },
    {
      key: "about.quote",
      label: "Frase destacada",
      default: "Elegí el crochet porque es lento. Cada punto pasa por la mano, y eso obliga a pensar la pieza entera antes de empezar.",
      multiline: true,
    },
    { key: "about.quoteNote", label: "Nota bajo la frase", default: "Una figura mediana son entre uno y tres días de trabajo" },
  ],
  how: [
    { key: "how.title", label: "Título (primera parte)", default: "Tu pieza hecha a mano," },
    { key: "how.titleHighlight", label: "Título (parte en cursiva rosa)", default: "sin complicaciones" },
    {
      key: "how.intro",
      label: "Presentación",
      default:
        "Me cuentas qué quieres, te digo precio y plazo, y solo cuando estés conforme empiezo a tejer. Sin carritos y sin compromiso hasta que digas que sí.",
      multiline: true,
    },
  ],
  contact: [
    { key: "contact.title", label: "Título (primera parte)", default: "Escríbeme y" },
    { key: "contact.titleHighlight", label: "Título (parte en cursiva rosa)", default: "hablamos" },
    {
      key: "contact.intro",
      label: "Presentación",
      default: "Contesto yo, no un bot, normalmente en menos de 24 horas. Pregunta lo que quieras: presupuestos, colores, tamaños o plazos.",
      multiline: true,
    },
  ],
} satisfies Record<string, TextDef[]>;

export const TEXT_DEFS: TextDef[] = Object.values(TEXTS).flat();
export type SiteTexts = Record<string, string>;
