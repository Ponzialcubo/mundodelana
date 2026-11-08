import Image from "next/image";
import { frameStyle } from "@/lib/framing";
import { YarnBackdrop } from "@/components/public/YarnBackdrop";

type Photo = { url: string; focalX: number; focalY: number; zoom?: number } | null | undefined;

/**
 * Page header with the text on one side and the owner's portrait photo (4:5)
 * on the other, in a rounded frame. Without a photo the frame shows the yarn
 * backdrop, so the layout never looks empty.
 */
export function SplitHero({
  eyebrow,
  title,
  text,
  photo,
  photoAlt = "",
  badge,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  text?: string;
  photo: Photo;
  photoAlt?: string;
  /** Small floating card over the photo's corner. */
  badge?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="bg-gradient-to-b from-cream to-surface px-5 pb-12 pt-8 md:px-14 md:pb-16 md:pt-14">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-9 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
        <div className="flex flex-col gap-5">
          <span className="flex items-center gap-2.5 text-[11.5px] font-medium uppercase tracking-[.2em] text-ink-soft">
            <span className="h-px w-7 bg-ink/30" />
            {eyebrow}
          </span>
          <h1 className="font-serif text-[36px] font-normal leading-[1.06] tracking-[-.015em] md:text-[54px]">{title}</h1>
          {text && <p className="max-w-xl text-[16px] font-light leading-relaxed text-ink/78 md:text-[17.5px]">{text}</p>}
          {children}
        </div>

        <figure className="relative mx-auto w-full max-w-[480px] lg:mx-0 lg:justify-self-end">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-cream shadow-[0_24px_60px_rgba(74,63,59,.14)] sm:aspect-[4/5]">
            {photo ? (
              <Image
                src={photo.url}
                alt={photoAlt}
                fill
                priority
                sizes="(min-width: 1024px) 480px, 100vw"
                quality={80}
                className="object-cover"
                style={frameStyle(photo)}
              />
            ) : (
              <YarnBackdrop />
            )}
          </div>
          {badge && <div className="absolute -bottom-5 left-4 right-4 sm:-left-6 sm:right-auto sm:max-w-[290px]">{badge}</div>}
        </figure>
      </div>
    </section>
  );
}
