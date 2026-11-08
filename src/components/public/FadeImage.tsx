"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

/**
 * next/image with a soft shimmer until the photo has loaded, so shoppers see
 * that something is coming instead of an empty box.
 */
export function FadeImage({ className = "", ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && <span aria-hidden="true" className="shimmer absolute inset-0" />}
      <Image
        {...props}
        alt={props.alt}
        onLoad={() => setLoaded(true)}
        className={`${className} transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </>
  );
}
