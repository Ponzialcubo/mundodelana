import Image from "next/image";

type Value = { url: string; focalX: number; focalY: number };

const pos = (v: Value) => ({ objectPosition: `${v.focalX * 100}% ${v.focalY * 100}%` });

/**
 * Full-bleed background image with an optional phone version: the wide one
 * from md up and the vertical one below (or the wide one cropped if there's none).
 */
export function BannerImage({
  desktop,
  mobile,
  priority = false,
  className = "",
  desktopSizes = "100vw",
}: {
  desktop: Value;
  mobile?: Value;
  priority?: boolean;
  className?: string;
  desktopSizes?: string;
}) {
  if (!mobile) {
    return <Image src={desktop.url} alt="" fill priority={priority} sizes={`(min-width: 768px) ${desktopSizes}, 100vw`} quality={80} className={`object-cover ${className}`} style={pos(desktop)} />;
  }
  return (
    <>
      <Image src={mobile.url} alt="" fill priority={priority} sizes="(min-width: 768px) 1px, 100vw" quality={80} className={`object-cover md:hidden ${className}`} style={pos(mobile)} />
      <Image src={desktop.url} alt="" fill priority={priority} sizes={`(min-width: 768px) ${desktopSizes}, 1px`} quality={80} className={`hidden object-cover md:block ${className}`} style={pos(desktop)} />
    </>
  );
}
