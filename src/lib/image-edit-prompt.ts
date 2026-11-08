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
- Aspecto de foto real de estudio, no de ilustración ni 3D. Sin texto, logos ni marcas de agua.

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
