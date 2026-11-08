/**
 * How a photo is framed inside a fixed box: which point stays put (focal) and
 * how much it's zoomed in. The admin editor and every public image use this
 * same style, so what the owner sees while framing is exactly what the shop shows.
 */
export type Framing = { focalX: number; focalY: number; zoom?: number | null };

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 3;

export function frameStyle({ focalX, focalY, zoom }: Framing): React.CSSProperties {
  const origin = `${focalX * 100}% ${focalY * 100}%`;
  const z = zoom && zoom > 1 ? zoom : 1;
  // Scaling around the same point used for object-position keeps that point fixed on screen.
  return z > 1 ? { objectPosition: origin, transform: `scale(${z})`, transformOrigin: origin } : { objectPosition: origin };
}

/** A place where an image is shown, with its exact proportion (width / height). */
export type Frame = { label: string; aspect: number; round?: boolean };

/** Every kind of image and the boxes it's cropped into on the shop. */
export const FRAMES = {
  product: [{ label: "Tienda, ficha y buscador", aspect: 4 / 5 }],
  categoryCover: [
    { label: "Tarjeta del bloque · ordenador", aspect: 4 / 3 },
    { label: "Tarjeta del bloque · móvil", aspect: 1 },
    { label: "Miniatura redonda", aspect: 1, round: true },
  ],
  heroDesktop: [{ label: "Inicio · ordenador", aspect: 16 / 7 }],
  heroMobile: [{ label: "Inicio · móvil", aspect: 2 / 3 }],
  campaignDesktop: [
    { label: "Inicio y página de la fecha", aspect: 3 },
    { label: "Tienda", aspect: 4 },
  ],
  campaignMobile: [
    { label: "Inicio y página de la fecha · móvil", aspect: 4 / 5 },
    { label: "Tienda · móvil", aspect: 1 },
  ],
  segment: [
    { label: "Tarjeta · ordenador", aspect: 4 / 3 },
    { label: "Tarjeta · móvil", aspect: 1 },
  ],
  portrait: [
    { label: "Ordenador", aspect: 4 / 5 },
    { label: "Móvil", aspect: 4 / 3 },
  ],
} satisfies Record<string, Frame[]>;
