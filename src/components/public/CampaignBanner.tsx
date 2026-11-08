import Link from "next/link";
import Image from "next/image";

type Photo = { url: string; focalX: number; focalY: number };

const pos = (p: Photo) => ({ objectPosition: `${p.focalX * 100}% ${p.focalY * 100}%` });

/**
 * Seasonal banner: text on the campaign colour next to its banner image. Until
 * the owner uploads one, a collage of the campaign's own pieces fills the spot.
 */
export function CampaignBanner({
  campaign,
  photos,
  deadline,
  compact = false,
}: {
  campaign: { slug: string; name: string; bannerTitle: string; bannerText: string; accent: string; bannerImage: string | null; bannerFocalX: number; bannerFocalY: number };
  /** Product photos for the collage fallback. */
  photos: Photo[];
  deadline: string | null;
  compact?: boolean;
}) {
  const banner = campaign.bannerImage ? { url: campaign.bannerImage, focalX: campaign.bannerFocalX, focalY: campaign.bannerFocalY } : null;
  const collage = photos.slice(0, 3);

  return (
    <Link
      href={`/fechas/${campaign.slug}`}
      className="group grid overflow-hidden rounded-3xl shadow-[0_10px_40px_rgba(74,63,59,.10)] md:grid-cols-[1fr_1.15fr]"
      style={{ background: `linear-gradient(140deg, ${campaign.accent} 0%, #F7F1EA 130%)` }}
    >
      <div className={`relative order-1 md:order-2 ${compact ? "aspect-[16/9] md:aspect-auto md:min-h-[260px]" : "aspect-[4/3] md:aspect-auto md:min-h-[380px]"}`}>
        {banner ? (
          <Image src={banner.url} alt="" fill sizes="(min-width: 768px) 55vw, 100vw" className="object-cover transition duration-700 group-hover:scale-[1.03]" style={pos(banner)} />
        ) : collage.length > 0 ? (
          <div className="absolute inset-0 grid grid-cols-[1.4fr_1fr] grid-rows-2 gap-1.5 p-1.5 md:gap-2 md:p-2">
            {collage.map((p, i) => (
              <span key={p.url} className={`relative overflow-hidden rounded-2xl bg-white/40 ${i === 0 ? "row-span-2" : ""} ${collage.length === 2 && i === 1 ? "row-span-2" : ""}`}>
                <Image src={p.url} alt="" fill sizes="(min-width: 768px) 30vw, 60vw" className="object-cover transition duration-700 group-hover:scale-[1.04]" style={pos(p)} />
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className={`order-2 flex flex-col justify-center gap-2.5 md:order-1 ${compact ? "p-6 md:p-9" : "p-6 md:p-12"}`}>
        <span className="flex items-center gap-2 text-[11.5px] font-medium uppercase tracking-[.18em] text-ink/70">
          <span className="h-px w-6 bg-ink/40" />
          Fecha especial
        </span>
        <span className={`font-serif leading-[1.08] text-ink ${compact ? "text-[28px] md:text-[34px]" : "text-[32px] md:text-[48px]"}`}>{campaign.bannerTitle}</span>
        <span className="max-w-md text-[15px] font-light leading-relaxed text-ink/80">{campaign.bannerText}</span>
        <span className="mt-2 flex flex-wrap items-center gap-2.5">
          <span className="rounded-full bg-ink px-5 py-3 text-[14px] font-medium text-surface">Ver regalos de {campaign.name}</span>
          {deadline && <span className="rounded-full bg-white/80 px-3.5 py-2 text-[13px] font-medium text-ink">Encarga antes del {deadline}</span>}
        </span>
      </div>
    </Link>
  );
}
