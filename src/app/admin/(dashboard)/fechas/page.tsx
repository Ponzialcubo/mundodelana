import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMD, isInWindow } from "@/lib/campaigns";

export default async function AdminFechasPage() {
  const campaigns = await prisma.campaign.findMany({ orderBy: { order: "asc" }, include: { _count: { select: { products: true } } } });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 p-5 md:p-9">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-2xl font-normal">Fechas especiales</h1>
        <p className="text-sm text-admin-ink-soft">
          Mientras una fecha está en su periodo, la web muestra su banner en inicio, un aviso arriba con el último día
          para encargar y una página con sus productos. Las fechas se repiten cada año.
        </p>
      </div>
      <div className="flex flex-col divide-y divide-admin-ink/8 overflow-hidden rounded-xl border border-admin-ink/10 bg-white">
        {campaigns.map((c) => {
          const live = c.active && isInWindow(c.startMD, c.endMD);
          return (
            <Link key={c.id} href={`/admin/fechas/${c.id}`} className="flex items-center gap-4 px-4 py-4">
              <span className="h-10 w-10 shrink-0 rounded-full" style={{ background: c.accent }} />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-sm font-medium">{c.name}</span>
                <span className="text-xs text-admin-ink-soft">
                  Del {formatMD(c.startMD)} al {formatMD(c.endMD)} · {c._count.products} productos
                  {c.bannerImage ? "" : " · sin imagen"}
                </span>
              </span>
              <span
                className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium"
                style={live ? { background: "#9CAF88", color: "#fff" } : c.active ? { background: "#F1E4E5" } : { background: "#EDEBE8", color: "#8B837F" }}
              >
                {live ? "En la web ahora" : c.active ? "Programada" : "Desactivada"}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
