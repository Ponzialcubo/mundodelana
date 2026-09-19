/**
 * Brand voice for Mundolana's catalog copy (product and category text
 * fields). Separate from social-prompt.ts, which targets Instagram/TikTok
 * captions with a different tone and length.
 */
export const CONTENT_BRAND_SYSTEM_PROMPT = `Eres quien redacta las fichas del catálogo de Mundolana, una marca gallega de crochet artesanal.

SOBRE LA MARCA
- Elvira teje a mano, pieza a pieza, desde su taller en Galicia. Lleva cinco años en ello: empezó haciendo amigurumis para su hijo.
- Material principal: algodón DMC Baby Cotton, 100% algodón de alta calidad, apto para pieles delicadas y para bebés. Menciónalo de forma natural solo cuando encaje (por ejemplo si el campo de materiales lo incluye o el contexto es de bebé/piel delicada); no lo fuerces en cada texto.
- Todo es hecho a mano y por encargo. No hay producción en serie: cada pieza lleva horas de trabajo.
- Valores: paciencia, oficio, cercanía, cuidado por el detalle, hecho en España.

TONO DE VOZ: profesional y cercano a la vez
- Cercano, pero cuidado: sin exceso de diminutivos ni exclamaciones, sin sonar a folleto publicitario ni a vendedor agresivo.
- Español de España. Ortografía impecable, con todas las tildes y la ñ.
- Nunca inventes datos que no estén en el contexto que te doy (materiales, precio, plazos, categorías). Si un dato no aparece, no lo menciones.
- Nada de "¡Descubre ya!", "No te lo pierdas", "producto único e irrepetible" ni fórmulas de anuncio. Evita los emojis en este contenido.

Vas a recibir el contexto de una ficha (producto o categoría) y el nombre de UN campo concreto que debes redactar. Genera solo el contenido de ese campo, ajustado a su función:
- shortDescription: una sola línea (hasta ~90 caracteres) que resume la pieza para las tarjetas del catálogo.
- description o categoryDescription: descripción completa para la ficha de producto o de categoría, 2 a 4 frases, puede mencionar el proceso o para quién es la pieza.
- productMetaTitle o categoryMetaTitle: título SEO, hasta 60 caracteres, incluye el nombre y opcionalmente "Mundolana".
- productMetaDescription o categoryMetaDescription: meta descripción SEO, hasta 155 caracteres, resume la pieza o categoría de forma atractiva para un resultado de Google.

A veces recibirás también unas "indicaciones" de Elvira: pueden ser una guía a seguir (por ejemplo, "que mencione que es ideal para regalo de cumpleaños") o simplemente ideas sueltas. Si las hay, redacta ajustándote a ellas, sin ignorarlas ni contradecirlas. Si no hay indicaciones, redacta igualmente a partir del resto del contexto — nunca dejes el campo sin generar por falta de indicaciones.`;

type ProductContext = {
  name?: string;
  shortDescription?: string | null;
  description?: string | null;
  materials?: string | null;
  categories?: string[];
  price?: string | null;
  priceType?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
};

type CategoryContext = {
  name?: string;
  description?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
};

export const CONTENT_FIELDS = [
  "shortDescription",
  "description",
  "productMetaTitle",
  "productMetaDescription",
  "categoryDescription",
  "categoryMetaTitle",
  "categoryMetaDescription",
] as const;

export type ContentField = (typeof CONTENT_FIELDS)[number];

const FIELD_LABELS: Record<ContentField, string> = {
  shortDescription: "shortDescription",
  description: "description",
  productMetaTitle: "productMetaTitle",
  productMetaDescription: "productMetaDescription",
  categoryDescription: "description",
  categoryMetaTitle: "categoryMetaTitle",
  categoryMetaDescription: "categoryMetaDescription",
};

export function buildProductContentPrompt(field: ContentField, product: ProductContext, notes?: string): string {
  const lines = ["<producto>"];
  if (product.name) lines.push(`Nombre: ${product.name}`);
  if (product.shortDescription) lines.push(`Descripción corta actual: ${product.shortDescription}`);
  if (product.description) lines.push(`Descripción actual: ${product.description}`);
  if (product.materials) lines.push(`Materiales:\n${product.materials}`);
  if (product.categories?.length) lines.push(`Categorías: ${product.categories.join(", ")}`);
  if (product.price) {
    lines.push(`Precio: ${product.priceType === "PERSONALIZADO" ? `desde ${product.price} €` : `${product.price} €`}`);
  }
  if (product.metaTitle) lines.push(`Meta título actual: ${product.metaTitle}`);
  if (product.metaDescription) lines.push(`Meta descripción actual: ${product.metaDescription}`);
  lines.push("</producto>");

  if (notes?.trim()) lines.push("", "<indicaciones_de_elvira>", notes.trim(), "</indicaciones_de_elvira>");

  lines.push("", `Redacta únicamente el campo "${FIELD_LABELS[field]}" para esta ficha de producto. Devuelve solo el texto de ese campo, sin comillas ni explicaciones.`);

  return lines.join("\n");
}

export function buildCategoryContentPrompt(field: ContentField, category: CategoryContext, notes?: string): string {
  const lines = ["<categoria>"];
  if (category.name) lines.push(`Nombre: ${category.name}`);
  if (category.description) lines.push(`Descripción actual: ${category.description}`);
  if (category.metaTitle) lines.push(`Meta título actual: ${category.metaTitle}`);
  if (category.metaDescription) lines.push(`Meta descripción actual: ${category.metaDescription}`);
  lines.push("</categoria>");

  if (notes?.trim()) lines.push("", "<indicaciones_de_elvira>", notes.trim(), "</indicaciones_de_elvira>");

  lines.push("", `Redacta únicamente el campo "${FIELD_LABELS[field]}" para esta categoría del catálogo. Devuelve solo el texto de ese campo, sin comillas ni explicaciones.`);

  return lines.join("\n");
}

export const CONTENT_OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    text: {
      type: "string",
      description: "El texto generado para el campo solicitado, listo para usar tal cual.",
    },
  },
  required: ["text"],
  additionalProperties: false,
} as const;
