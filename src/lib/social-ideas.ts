/**
 * Fixed prompts for the "banco de ideas" panel. Selecting one feeds the angle
 * into the AI prompt, so the wording doubles as instruction text.
 */
export const CONTENT_IDEAS = [
  {
    id: "proceso",
    label: "Foto de proceso",
    description: "La pieza a medio tejer, con la aguja y el ovillo todavía en la mano.",
  },
  {
    id: "timelapse",
    label: "Vídeo time-lapse",
    description: "El montaje acelerado desde el primer punto hasta la pieza acabada.",
  },
  {
    id: "acabado",
    label: "Foto de acabado",
    description: "La pieza terminada, con buena luz y fondo limpio.",
  },
  {
    id: "detalle",
    label: "Detalle macro",
    description: "Primer plano de la puntada, la costura o el remate que no se ve de lejos.",
  },
  {
    id: "escala",
    label: "Pieza en contexto",
    description: "La pieza en la mano o en su sitio real, para que se entienda el tamaño.",
  },
  {
    id: "materiales",
    label: "Los materiales",
    description: "Los ovillos de DMC Baby Cotton y las agujas antes de empezar.",
  },
  {
    id: "taller",
    label: "Rincón del taller",
    description: "El espacio de trabajo en Galicia, la luz, la silla de siempre.",
  },
  {
    id: "antes-despues",
    label: "Antes y después",
    description: "El ovillo de partida junto a la pieza acabada, en la misma imagen.",
  },
  {
    id: "encargo",
    label: "Encargo personalizado",
    description: "Una pieza hecha a medida y qué pidió la clienta.",
  },
  {
    id: "packaging",
    label: "Preparando el envío",
    description: "El empaquetado a mano, listo para salir hacia su destino.",
  },
] as const;

export type ContentIdeaId = (typeof CONTENT_IDEAS)[number]["id"];
