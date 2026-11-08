import Link from "next/link";

/** Thin bar above the header: the running special date (with its order deadline) or a general note. */
export function AnnouncementBar({ campaign }: { campaign: { name: string; slug: string; deadline: string | null; accent: string } | null }) {
  if (!campaign) {
    return (
      <div className="bg-ink px-4 py-2 text-center text-[12.5px] text-surface/90">
        Encargos abiertos · Tejido a mano en Galicia · Envíos a toda España
      </div>
    );
  }
  return (
    <Link href={`/fechas/${campaign.slug}`} className="block px-4 py-2 text-center text-[12.5px] font-medium text-ink" style={{ background: campaign.accent }}>
      {campaign.name}: {campaign.deadline ? `encarga antes del ${campaign.deadline}` : "ya puedes hacer tu encargo"} <span aria-hidden="true">›</span>
    </Link>
  );
}
