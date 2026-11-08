import Link from "next/link";
import Image from "next/image";

type Photo = { url: string; focalX: number; focalY: number } | null | undefined;

/**
 * Shop card: full-bleed photo (AI background or the most representative
 * piece) with the title over a soft dark fade. Without a photo it falls back to
 * the segment colour so it never looks broken.
 */
export function PhotoCard({
  href,
  photo,
  title,
  subtitle,
  eyebrow,
  tint = "#EDE4DA",
  ink = "#4A3F3B",
  sizes = "(min-width: 768px) 25vw, 50vw",
  className = "",
  large = false,
}: {
  href: string;
  photo: Photo;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  tint?: string;
  ink?: string;
  sizes?: string;
  className?: string;
  large?: boolean;
}) {
  return (
    <Link href={href} className={`group relative isolate flex flex-col justify-end overflow-hidden rounded-2xl md:rounded-3xl ${className}`} style={{ background: tint }}>
      {photo ? (
        <>
          <Image
            src={photo.url}
            alt=""
            fill
            sizes={sizes}
            className="-z-10 object-cover transition duration-700 ease-out group-hover:scale-[1.05]"
            style={{ objectPosition: `${photo.focalX * 100}% ${photo.focalY * 100}%` }}
          />
          <span aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-[#2f2623]/80 via-[#2f2623]/20 to-transparent" />
        </>
      ) : (
        <span aria-hidden="true" className="absolute -right-8 -top-8 -z-10 h-32 w-32 rounded-full border-[14px] opacity-20" style={{ borderColor: ink }} />
      )}
      <span className={`flex items-end justify-between gap-3 ${large ? "p-5 md:p-7" : "p-4 md:p-5"}`} style={photo ? { color: "#fff" } : { color: ink }}>
        <span className="flex min-w-0 flex-col">
          {eyebrow && <span className="mb-0.5 text-[10.5px] font-medium uppercase tracking-[.16em] opacity-80">{eyebrow}</span>}
          <span className={`font-serif leading-[1.1] ${large ? "text-[26px] md:text-[34px]" : "text-[19px] md:text-[23px]"}`}>{title}</span>
          {subtitle && <span className="mt-1 text-[12.5px] opacity-85 md:text-[13.5px]">{subtitle}</span>}
        </span>
        <span
          aria-hidden="true"
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[15px] transition group-hover:translate-x-0.5 ${photo ? "bg-white/90 text-ink" : "bg-white/70"}`}
        >
          →
        </span>
      </span>
    </Link>
  );
}
