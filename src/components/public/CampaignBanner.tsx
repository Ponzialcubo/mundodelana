import Link from "next/link";
import { BannerImage } from "@/components/public/BannerImage";

type Campaign = {
  slug: string;
  name: string;
  bannerTitle: string;
  bannerText: string;
  accent: string;
  bannerImage: string | null;
  bannerFocalX: number;
  bannerFocalY: number;
  bannerZoom: number;
  bannerImageMobile: string | null;
  bannerMobileFocalX: number;
  bannerMobileFocalY: number;
  bannerMobileZoom: number;
};

/** Yarn balls on the right, for dates that don't have their banner image yet. */
function SeasonalDecor({ accent }: { accent: string }) {
  const balls = [
    { cx: 82, cy: 30, r: 16, c: accent },
    { cx: 64, cy: 62, r: 10, c: "#F7F1EA" },
    { cx: 93, cy: 72, r: 8, c: accent },
    { cx: 70, cy: 18, r: 5, c: "#ffffff" },
  ];
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMaxYMid slice" aria-hidden="true" className="absolute inset-y-0 right-0 h-full w-[60%] opacity-90 md:w-[45%]">
      <path d="M30 90 C 45 70, 55 85, 64 62 S 80 40, 82 30" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth=".7" strokeDasharray=".6 2.2" strokeLinecap="round" />
      {balls.map((b) => (
        <g key={`${b.cx}-${b.cy}`}>
          <circle cx={b.cx} cy={b.cy} r={b.r} fill={b.c} stroke="#fff" strokeOpacity=".5" strokeWidth=".4" />
          {[-0.45, 0, 0.45].map((k) => (
            <path
              key={k}
              d={`M ${b.cx - b.r * 0.85} ${b.cy + b.r * k} Q ${b.cx} ${b.cy + b.r * (k - 0.4)} ${b.cx + b.r * 0.85} ${b.cy + b.r * k}`}
              fill="none"
              stroke="#fff"
              strokeOpacity=".55"
              strokeWidth={b.r / 12}
              strokeLinecap="round"
            />
          ))}
        </g>
      ))}
    </svg>
  );
}

/**
 * Seasonal banner: the date's AI scene (wide on computers, vertical on phones)
 * with the text over its clean side. Until the owner uploads one it shows the
 * campaign colour with a yarn decoration — never cropped product photos.
 */
export function CampaignBanner({ campaign, deadline, compact = false }: { campaign: Campaign; deadline: string | null; compact?: boolean }) {
  const desktop = campaign.bannerImage ? { url: campaign.bannerImage, focalX: campaign.bannerFocalX, focalY: campaign.bannerFocalY, zoom: campaign.bannerZoom } : null;
  const mobile = campaign.bannerImageMobile
    ? { url: campaign.bannerImageMobile, focalX: campaign.bannerMobileFocalX, focalY: campaign.bannerMobileFocalY, zoom: campaign.bannerMobileZoom }
    : undefined;

  return (
    <Link
      href={`/fechas/${campaign.slug}`}
      className={`group relative isolate flex overflow-hidden rounded-3xl ${
        compact ? "aspect-square items-end md:aspect-[4/1] md:items-center" : "aspect-[4/5] items-end md:aspect-[3/1] md:items-center"
      }`}
      style={{ background: `linear-gradient(120deg, #F7F1EA 0%, ${campaign.accent} 100%)` }}
    >
      {desktop ? (
        <>
          <span className="absolute inset-0 -z-10 transition duration-700 group-hover:scale-[1.02]">
            <BannerImage desktop={desktop} mobile={mobile} desktopSizes="1240px" />
          </span>
          <span aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-[#2f2623]/75 via-[#2f2623]/25 to-transparent md:bg-gradient-to-r md:from-[#2f2623]/65 md:via-[#2f2623]/20" />
        </>
      ) : (
        <span className="absolute inset-0 -z-10">
          <SeasonalDecor accent={campaign.accent} />
        </span>
      )}

      <span className={`flex max-w-xl flex-col gap-2 ${compact ? "p-5 md:px-9" : "p-6 md:px-12"} ${desktop ? "text-white" : "text-ink"}`}>
        <span className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[.18em] opacity-85">
          <span className="h-px w-6 bg-current opacity-60" />
          Fecha especial
        </span>
        <span className={`font-serif leading-[1.08] ${compact ? "text-[26px] md:text-[32px]" : "text-[30px] md:text-[44px]"}`}>{campaign.bannerTitle}</span>
        {!compact && <span className="max-w-md text-[14.5px] font-light leading-relaxed opacity-90 md:text-[15.5px]">{campaign.bannerText}</span>}
        <span className="mt-1.5 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-4 py-2.5 text-[13.5px] font-medium ${desktop ? "bg-white text-ink" : "bg-ink text-surface"}`}>Ver regalos</span>
          {deadline && <span className={`rounded-full px-3.5 py-2 text-[12.5px] font-medium ${desktop ? "bg-white/20 text-white backdrop-blur" : "bg-white/75 text-ink"}`}>Encarga antes del {deadline}</span>}
        </span>
      </span>
    </Link>
  );
}
