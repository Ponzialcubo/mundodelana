import { FORMATS, buildSpotPrompt } from "@/lib/image-formats";

/**
 * Prompts for editing product photos with an external image AI (Gemini,
 * ChatGPT). The owner downloads a bundle from the admin and pastes each
 * prompt next to its photo, so the text must be self-contained.
 */

export const IMAGE_FORMATS = [
  { label: "4:5 vertical (1080 × 1350 px)", use: "catálogo de la web y post de Instagram" },
  { label: "1:1 cuadrada (1080 × 1080 px)", use: "miniaturas y carrusel" },
  { label: "9:16 vertical (1080 × 1920 px)", use: "stories, reels y TikTok; deja aire arriba y abajo para texto" },
];

export function buildImageEditPrompt(caption: string | null | undefined): string {
  const context = caption?.replace(/[#@][\p{L}\p{N}_.]+/gu, "").replace(/\s+/g, " ").trim();

  return `Edita esta foto de producto para la tienda online Mundolana (crochet y amigurumis hechos a mano en Galicia).

LO MÁS IMPORTANTE
- La pieza de crochet debe quedar EXACTAMENTE igual: misma forma, colores, puntos, accesorios y proporciones. No la redibujes, no la "mejores" ni le añadas detalles.
- Solo cambia el fondo, la luz y el encuadre.

ESTILO
- Fondo liso o con un degradado muy suave en tonos cálidos de la marca: crema #F7F1EA, beige #EDE4DA o rosa empolvado #E8B4B8. Nada de fondos blancos fríos ni escenarios recargados.
- Luz natural y suave, como junto a una ventana, con una sombra ligera bajo la pieza para que no parezca recortada.
- Pieza centrada y nítida, ocupando unos dos tercios del encuadre. Que se aprecie la textura del punto.
- Aspecto de foto real de estudio, no de ilustración ni 3D.
- No añadas nada que no esté en la foto: ni otras piezas, ni bordados, estampados, texto, logos o marcas de agua.

FORMATOS (genera una imagen por formato)
${IMAGE_FORMATS.map((f) => `- ${f.label}: ${f.use}.`).join("\n")}
${context ? `\nCONTEXTO DE LA PIEZA (texto original de Instagram)\n${context}\n` : ""}`;
}

export const BUNDLE_README = `CÓMO USAR ESTE PAQUETE

1. Cada foto viene con un archivo .txt del mismo nombre: es el prompt para esa foto.
2. Abre Gemini o ChatGPT, adjunta la foto y pega el texto del .txt.
3. Revisa que la pieza no haya cambiado (colores, ojos, accesorios). Si cambia algo, pídele que lo corrija o descarta el resultado.
4. Descarga las imágenes generadas.
5. En el panel de Mundolana, entra en Fotos → «Subir fotos editadas» y súbelas todas de golpe.
   Aparecerán en «Por revisar» marcadas como IA, listas para crear productos.
`;

/** Prompt for one product photo, using the product's own name and description as context. */
export function buildProductPhotoPrompt(product: { name: string; description?: string | null }): string {
  return buildImageEditPrompt([product.name, product.description].filter(Boolean).join(". "))
    .replace("CONTEXTO DE LA PIEZA (texto original de Instagram)", "QUÉ PIEZA ES");
}

const CAMPAIGN_SCENES: Record<string, string> = {
  "san-valentin": "pétalos de rosa roja sueltos, una cinta roja de algodón, papel kraft y luz cálida de tarde sobre madera clara",
  "dia-de-la-madre": "flores frescas de primavera en tonos rosa y lila en un jarrón sencillo, un trozo de lino y papel kraft con cinta",
  "dia-del-padre": "madera clara, papel kraft, una cuerda de yute y una taza de cerámica, en tonos azul suave y beige",
  halloween: "hojas secas de otoño, calabazas pequeñas de verdad y velas encendidas, en tonos naranja y crema; acogedor, nada terrorífico",
  navidad: "ramas de abeto, piñas, luces cálidas desenfocadas al fondo, cinta roja y papel kraft sobre madera clara",
};

/** Desktop and phone prompts for a special date's banner: a generic seasonal scene, real pieces only if attached. */
export function buildCampaignBannerPrompts(campaign: { slug: string; name: string }): { desktop: string; mobile: string } {
  const scene = `${CAMPAIGN_SCENES[campaign.slug] ?? `elementos de decoración típicos de «${campaign.name}» (sin figuras de crochet)`}.`;
  const purpose = `el banner de «${campaign.name}»`;
  return {
    desktop: buildSpotPrompt({ purpose: `${purpose} (versión ordenador)`, scene, format: FORMATS.wideDesktop }),
    mobile: buildSpotPrompt({
      purpose: `${purpose} (versión móvil)`,
      scene,
      format: FORMATS.wideMobile,
      extra: "Si ya me has hecho la versión de ordenador, repite la misma escena en vertical.",
    }),
  };
}

/** Prompt for a category thumbnail: the attached piece, unchanged, on a clean generic background. */
export function buildCategoryCoverPrompt(category: { name: string; description?: string | null }): string {
  return buildSpotPrompt({
    purpose: `la miniatura de la categoría «${category.name}»`,
    scene: `la pieza de la foto que te adjunto (la más representativa de «${category.name}»), centrada y nítida, ocupando dos tercios del encuadre, sobre un fondo liso crema o beige con una sombra suave.${category.description ? ` Contexto: ${category.description}` : ""}`,
    format: FORMATS.square,
    extra: "LO MÁS IMPORTANTE: la pieza debe quedar EXACTAMENTE igual que en la foto; solo cambian el fondo y la luz.",
  });
}
