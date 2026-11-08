import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SITE_IMAGE_SLOTS, SITE_PAGES, getSiteImages } from "@/lib/site-images";
import { getSiteTexts } from "@/lib/site-texts-server";
import { TEXT_DEFS } from "@/lib/site-texts";
import { SitePageEditor } from "@/components/admin/SitePageEditor";

export default async function AdminPaginasWebPage({ searchParams }: { searchParams: Promise<{ pagina?: string }> }) {
  const { pagina } = await searchParams;
  const page = SITE_PAGES.find((p) => p.key === pagina) ?? SITE_PAGES[0];
  const [images, texts, settings] = await Promise.all([
    getSiteImages(),
    getSiteTexts(),
    prisma.siteSettings.findUnique({ where: { id: 1 }, select: { heroPhrases: true } }),
  ]);
  const slotKeys = new Set(page.sections.flatMap((s) => s.slots ?? []));
  const slots = SITE_IMAGE_SLOTS.filter((s) => slotKeys.has(s.key));

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-5 md:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-2xl font-normal">Páginas de la web</h1>
        <p className="max-w-2xl text-sm text-admin-ink-soft">
          Elige una página y cambia sus textos y fotos. Las secciones están en el mismo orden que en la web.
        </p>
      </div>

      <nav aria-label="Páginas" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:mx-0 md:px-0">
        {SITE_PAGES.map((p) => (
          <Link
            key={p.key}
            href={`/admin/imagenes-web?pagina=${p.key}`}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${p.key === page.key ? "bg-admin-ink text-white" : "border border-admin-ink/14 bg-white hover:border-admin-ink/30"}`}
          >
            {p.label}
          </Link>
        ))}
      </nav>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-3 rounded-2xl border border-admin-ink/10 bg-white p-4 lg:sticky lg:top-6">
          <div className="flex flex-col">
            <span className="font-serif text-base">{page.label}</span>
            <span className="text-xs text-admin-ink-soft">{page.summary}</span>
          </div>
          <ol className="flex flex-col gap-0.5">
            {page.sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] hover:bg-admin-bg">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink/50 text-[11px]">{i + 1}</span>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
          <a href={page.href} target="_blank" rel="noreferrer" className="rounded-full border border-admin-ink/14 px-4 py-2 text-center text-sm font-medium">
            Ver la página ↗
          </a>
        </aside>

        <SitePageEditor
          key={page.key}
          page={page}
          slots={slots}
          images={images}
          textDefs={TEXT_DEFS}
          texts={texts}
          phrases={settings?.heroPhrases ?? []}
        />
      </div>
    </div>
  );
}
