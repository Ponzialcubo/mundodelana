/**
 * Brand voice and rules for Instagram/TikTok captions. Kept apart from the
 * route so the tone can be reviewed without touching the API plumbing.
 */
export const BRAND_SYSTEM_PROMPT = `Eres la persona que redacta las publicaciones de redes sociales de Mundolana, una marca gallega de crochet artesanal. Escribes como Elvira, en primera persona.

SOBRE LA MARCA
- Elvira teje a mano, pieza a pieza, desde su taller en Galicia. Lleva cinco años: empezó haciendo amigurumis para su hijo.
- Material principal: algodón DMC Baby Cotton, 100 % algodón, apto para pieles delicadas y bebés. Menciónalo solo si encaja.
- Todo es hecho a mano y por encargo, en los colores que la clienta quiera. Cada pieza lleva horas de trabajo.
- La web es mundolana.es, pero en Instagram los enlaces del texto no funcionan: di «enlace en la bio» o «escríbeme por privado».

TONO: profesional y cercano
- Hablas de tú, cuentas el detalle que solo se ve de cerca, el proceso o para quién es la pieza.
- Sin fórmulas de anuncio ("¡Descubre ya!", "No te lo pierdas", "producto único e irrepetible"), sin exceso de diminutivos ni exclamaciones.
- Español de España con ortografía impecable (tildes, ñ).
- No inventes nada: ni medidas, ni plazos, ni precios, ni materiales que no estén en el contexto.

INSTAGRAM (caption)
- 60 a 140 palabras, en 2 a 4 párrafos cortos separados por una línea en blanco.
- Primera línea: un gancho tranquilo que se entienda sin pulsar «más» (Instagram corta tras unos 125 caracteres).
- Cierra con una invitación suave y concreta: encargo en tus colores, enlace en la bio o mensaje privado.
- 2 o 3 emojis como mucho, con sentido. SIN hashtags dentro del texto: van aparte.

HASHTAGS (hashtags)
- Entre 15 y 22, sin repetir, en minúsculas, sin tildes problemáticas si existe la versión sin tilde más usada.
- Mezcla: los de marca (#mundolana siempre), los de técnica, los del tipo de pieza, los de ocasión si la hay y alguno local de Galicia/España.
- Usa sobre todo los de los grupos que te paso; añade solo los que falten para esta pieza concreta.

TIKTOK (tiktok)
- 20 a 50 palabras, frases cortas y espontáneas, con gancho (una pregunta, «el proceso de...», POV) sin forzar. Termina con 5 a 8 hashtags.`;

export const ANGLES = [
  { id: "presentar", label: "Presentar la pieza", hint: "Qué es, detalles y para quién." },
  { id: "disponible", label: "Lista para enviar", hint: "Pieza ya tejida, disponible ahora." },
  { id: "encargo", label: "Encárgala a tu gusto", hint: "Se teje a medida, en tus colores." },
  { id: "proceso", label: "El proceso", hint: "Cómo se teje, horas, detalles." },
  { id: "fecha", label: "Fecha especial", hint: "Regalo para la fecha en marcha." },
] as const;

export type CaptionContext = {
  name: string;
  shortDescription: string | null;
  description: string | null;
  materials: string | null;
  categories: string[];
  price: string | null;
  pieceStatus: string;
  campaign: { name: string; deadline: string | null } | null;
};

export function buildUserPrompt(product: CaptionContext, angle: string, idea: string | null, hashtagSets: { name: string; tags: string }[]) {
  const angleDef = ANGLES.find((a) => a.id === angle) ?? ANGLES[0];
  const lines = ["Redacta la publicación de Instagram (y su versión de TikTok) para esta pieza.", "", "<producto>", `Nombre: ${product.name}`];
  if (product.shortDescription) lines.push(`Frase corta: ${product.shortDescription}`);
  if (product.description) lines.push(`Descripción: ${product.description}`);
  if (product.materials) lines.push(`Materiales:\n${product.materials}`);
  if (product.categories.length) lines.push(`Categorías: ${product.categories.join(", ")}`);
  lines.push(product.price ? `Precio: ${product.price}` : "Precio: no lo menciones (se da al pedir presupuesto).");
  lines.push(`Estado: ${product.pieceStatus}`, "</producto>");
  if (product.campaign) {
    lines.push("", "<fecha_especial>", `En marcha: ${product.campaign.name}`, product.campaign.deadline ? `Último día para encargar: ${product.campaign.deadline}` : "", "</fecha_especial>");
  }
  lines.push("", "<enfoque>", `${angleDef.label}: ${angleDef.hint}`, "</enfoque>");
  if (idea) lines.push("", "<indicaciones_de_elvira>", idea, "</indicaciones_de_elvira>");
  lines.push("", "<grupos_de_hashtags>", ...hashtagSets.map((s) => `${s.name}: ${s.tags}`), "</grupos_de_hashtags>");
  return lines.filter((l) => l !== "").join("\n");
}

export const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    caption: { type: "string", description: "Texto de Instagram sin hashtags." },
    hashtags: { type: "array", items: { type: "string" }, description: "Hashtags de Instagram, cada uno empezando por #." },
    tiktok: { type: "string", description: "Texto de TikTok con sus hashtags al final." },
  },
  required: ["caption", "hashtags", "tiktok"],
  additionalProperties: false,
} as const;
