import { prisma } from "@/lib/prisma";
import { AdminChip } from "@/components/admin/AdminFilters";
import { MediaLibrary, type LibraryGroup } from "@/components/admin/MediaLibrary";

const TABS = [
  { value: "NUEVA", label: "Por revisar" },
  { value: "USADA", label: "Ya usadas" },
  { value: "DESCARTADA", label: "Descartadas" },
] as const;

export default async function AdminFotosPage({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const { estado = "NUEVA" } = await searchParams;
  const status = TABS.find((t) => t.value === estado)?.value ?? "NUEVA";

  const [items, counts] = await Promise.all([
    prisma.libraryMedia.findMany({ where: { status }, orderBy: [{ createdAt: "asc" }] }),
    prisma.libraryMedia.groupBy({ by: ["status"], _count: true }),
  ]);

  // One group per Instagram post (carousel children together); AI-edited
  // uploads are grouped per upload day.
  const groups: LibraryGroup[] = [];
  for (const item of items) {
    const key = item.instagramPostId ?? `${item.source}-${item.createdAt.toISOString().slice(0, 10)}`;
    let group = groups.find((g) => g.key === key);
    if (!group) {
      group = {
        key,
        source: item.source,
        caption: item.caption,
        permalink: item.permalink,
        date: (item.takenAt ?? item.createdAt).toISOString(),
        items: [],
      };
      groups.push(group);
    }
    group.items.push({ id: item.id, url: item.url, mediaType: item.mediaType, posterUrl: item.posterUrl });
  }
  groups.sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 p-5 md:p-9">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-2xl font-normal">Fotos</h1>
        <p className="text-sm text-admin-ink-soft">
          Trae tus publicaciones de Instagram y conviértelas en productos de la tienda.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const count = counts.find((c) => c.status === t.value)?._count ?? 0;
          return (
            <AdminChip
              key={t.value}
              label={`${t.label} (${count})`}
              active={status === t.value}
              href={t.value === "NUEVA" ? "/admin/fotos" : `/admin/fotos?estado=${t.value}`}
            />
          );
        })}
      </div>
      <MediaLibrary groups={groups} status={status} />
    </div>
  );
}
