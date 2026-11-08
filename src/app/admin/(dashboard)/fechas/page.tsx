import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { daysUntil, formatMD, isInWindow } from "@/lib/campaign-dates";
import { frameStyle } from "@/lib/framing";
import { NewCampaignButton } from "@/components/admin/NewCampaignButton";

/** Status in words: running now, coming up in N days, or off. */
function status(c: { active: boolean; startMD: string; endMD: string }) {
  if (!c.active) return { label: "Desactivada", hint: "No se mostrará hasta que la actives", style: { background: "#EDEBE8", color: "#8B837F" }, rank: 2 };
  if (isInWindow(c.startMD, c.endMD)) return { label: "En la web ahora", hint: `Hasta el ${formatMD(c.endMD)}`, style: { background: "#9CAF88", color: "#fff" }, rank: 0 };
  const days = daysUntil(c.startMD);
  return { label: "Programada", hint: days === 1 ? "Empieza mañana" : `Empieza en ${days} días`, style: { background: "#F6E7D3", color: "#7A5A2E" }, rank: 1, days };
}

export default async function AdminFechasPage() {
  const campaigns = await prisma.campaign.findMany({ include: { _count: { select: { products: true } } } });
  const rows = campaigns
    .map((c) => ({ ...c, status: status(c) }))
    // Running first, then the next ones to come, then the switched-off ones.
    .sort((a, b) => a.status.rank - b.status.rank || daysUntil(a.startMD) - daysUntil(b.startMD));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 p-5 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex max-w-2xl flex-col gap-1">
          <h1 className="font-serif text-2xl font-normal">Fechas especiales</h1>
          <p className="text-sm text-admin-ink-soft">
            Prepara cada fecha con tiempo: el banner, sus productos y cuándo se muestra. El día de inicio aparece sola en la
            web (banner en inicio y tienda, aviso arriba y su página) y desaparece sola al terminar. Se repiten cada año.
          </p>
        </div>
        <NewCampaignButton />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {rows.map((c) => (
          <Link key={c.id} href={`/admin/fechas/${c.id}`} className="group flex flex-col overflow-hidden rounded-2xl border border-admin-ink/10 bg-white transition hover:shadow-[0_10px_30px_rgba(31,27,26,.08)]">
            <span className="relative block aspect-[3/1] overflow-hidden" style={{ background: `linear-gradient(120deg,#F7F1EA,${c.accent})` }}>
              {c.bannerImage && (
                // eslint-disable-next-line @next/next/no-img-element -- admin preview with the shop's exact crop
                <img src={c.bannerImage} alt="" className="absolute inset-0 h-full w-full object-cover" style={frameStyle({ focalX: c.bannerFocalX, focalY: c.bannerFocalY, zoom: c.bannerZoom })} />
              )}
              <span className="absolute inset-0 bg-gradient-to-r from-black/45 to-transparent" />
              <span className="absolute bottom-3 left-4 font-serif text-[19px] text-white drop-shadow">{c.bannerTitle}</span>
              <span className="absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-medium" style={c.status.style}>
                {c.status.label}
              </span>
            </span>
            <span className="flex items-center justify-between gap-3 p-4">
              <span className="flex flex-col">
                <span className="font-medium">{c.name}</span>
                <span className="text-xs text-admin-ink-soft">
                  {formatMD(c.startMD)} → {formatMD(c.endMD)} · {c._count.products} productos
                </span>
              </span>
              <span className="shrink-0 text-right text-xs text-admin-ink-soft">
                {c.status.hint}
                {!c.bannerImage && <span className="block text-admin-danger">Falta la imagen</span>}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
