import Image from "next/image";
import { YarnBackdrop } from "@/components/public/YarnBackdrop";

/** Page header over the owner's image for that page (or the yarn backdrop until she uploads one). */
export function PageHero({
  eyebrow,
  title,
  text,
  image,
  children,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  image?: { url: string; focalX: number; focalY: number };
  children?: React.ReactNode;
}) {
  return (
    <section className="relative flex min-h-[52svh] items-end overflow-hidden md:min-h-[440px]">
      {image ? (
        <Image
          src={image.url}
          alt=""
          fill
          priority
          sizes="100vw"
          quality={80}
          className="object-cover"
          style={{ objectPosition: `${image.focalX * 100}% ${image.focalY * 100}%` }}
        />
      ) : (
        <YarnBackdrop />
      )}
      {image && <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#3d322e]/85 via-[#3d322e]/35 to-transparent" />}
      <div className={`relative flex max-w-2xl flex-col gap-3 px-5 pb-9 pt-20 md:px-14 md:pb-14 ${image ? "text-white" : "text-ink"}`}>
        <span className="text-[11.5px] uppercase tracking-[.18em] opacity-80">{eyebrow}</span>
        <h1 className="font-serif text-[34px] font-normal leading-[1.08] md:text-[52px]">{title}</h1>
        {text && <p className="max-w-lg text-[15.5px] font-light leading-relaxed opacity-90 md:text-[17px]">{text}</p>}
        {children}
      </div>
    </section>
  );
}
