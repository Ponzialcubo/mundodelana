"use client";

import { useState } from "react";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";

const THUMBS = ["frontal", "detalle cara", "en la mano", "etiqueta"];

export function ProductGallery({ productName }: { productName: string }) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      <ImagePlaceholder
        label={`${productName} — foto ${THUMBS[active]}`}
        className="h-[300px] rounded-xl md:h-[520px]"
      />
      <div className="grid grid-cols-4 gap-2.5 md:gap-3">
        {THUMBS.map((label, i) => (
          <button
            key={label}
            onClick={() => setActive(i)}
            className="overflow-hidden rounded-lg"
            style={{ border: `2px solid ${active === i ? "#4A3F3B" : "transparent"}` }}
          >
            <ImagePlaceholder label={label} className="h-[66px] md:h-[96px]" />
          </button>
        ))}
      </div>
    </div>
  );
}
