import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { parseMedia } from "@/lib/social/publish";
import { publishingQuota } from "@/lib/social/instagram";
import { frameStyle } from "@/lib/framing";
import { NewPostPicker, NewPostRow } from "@/components/admin/social/NewPostPicker";
import { HashtagSetsEditor } from "@/components/admin/social/HashtagSetsEditor";
import type { SocialPostStatus } from "@/generated/prisma";

const TABS = [
  { key: "publicaciones", label: "Publicaciones" },
  { key: "sin-publicar", label: "Sin publicar en Instagram" },
  { key: "hashtags", label: "Hashtags" },
] as const;

const STATUS: Record<SocialPostStatus, { label: string; style: React.CSSProperties }> = {
  BORRADOR: { label: "Borrador", style: { background: "#EDEBE8", color: "#6E6663" } },
  PROGRAMADA: { label: "Programada", style: { background: "#F6E7D3", color: "#7A5A2E" } },
  PUBLICANDO: { label: "Publicando…", style: { background: "#DCE6EC", color: "#45606E" } },
  PUBLICADA: { label: "Publicada", style: { background: "#E3EADB", color: "#4F6645" } },
  ERROR: { label: "No se pudo publicar", style: { background: "#F6E9E8", color: "#9A6360" } },
};

const when = (d: Date) => d.toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid" });

export default async function AdminRedesPage({ searchParams }: { searchParams: Promise<{ ver?: string }> }) {
  const { ver } = await searchParams;
  const tab = TABS.find((t) => t.key === ver)?.key ?? "publicaciones";

  const [posts, products, sets, quota] = await Promise.all([
    prisma.socialPost.findMany({ include: { product: { select: { name: true } } }, orderBy: [{ updatedAt: "desc" }], take: 60 }),
    prisma.product.findMany({
      where: { publicationStatus: { not: "ARCHIVADO" } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, mainImage: true, mainImageFocalX: true, mainImageFocalY: true, mainImageZoom: true, instagramUrl: true, createdAt: true,
        socialPosts: { where: { status: "PUBLICADA" }, select: { id: true } },
      },
    }),
    prisma.hashtagSet.findMany({ orderBy: { order: "asc" } }),
    publishingQuota().catch(() => null),
  ]);

  const neverPosted = products.filter((p) => !p.instagramUrl && p.socialPosts.length === 0);
  const groups: { title: string; statuses: SocialPostStatus[] }[] = [
    { title: "Necesitan atención", statuses: ["ERROR"] },
    { title: "Programadas", statuses: ["PROGRAMADA", "PUBLICANDO"] },
    { title: "Borradores", statuses: ["BORRADOR"] },
    { title: "Publicadas", statuses: ["PUBLICADA"] },
  ];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 p-5 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex max-w-2xl flex-col gap-1">
          <h1 className="font-serif text-2xl font-normal">Redes sociales</h1>
          <p className="text-sm text-admin-ink-soft">
            Prepara publicaciones de Instagram desde tus productos: las mismas fotos y encuadres que en la web, el texto y los
            hashtags. Publícalas al momento, prográmalas o descárgalas para subirlas a mano (TikTok, historias).
          </p>
          <p className="text-xs text-admin-faint">
            Cuenta conectada: @mundolana16
            {quota ? ` · hoy ${quota.used} de ${quota.total} publicaciones` : " · no se ha podido comprobar la conexión"}
          </p>
        </div>
        <NewPostPicker
          products={products.map((p) => ({
            id: p.id,
            name: p.name,
            image: p.mainImage ? { url: p.mainImage, focalX: p.mainImageFocalX, focalY: p.mainImageFocalY, zoom: p.mainImageZoom } : null,
            onInstagram: Boolean(p.instagramUrl || p.socialPosts.length),
          }))}
        />
      </div>

      <nav className="-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] md:mx-0 md:px-0">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/redes?ver=${t.key}`}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${tab === t.key ? "bg-admin-ink text-white" : "border border-admin-ink/14 bg-white"}`}
          >
            {t.label}
            {t.key === "sin-publicar" && ` (${neverPosted.length})`}
          </Link>
        ))}
      </nav>

      {tab === "publicaciones" && (
        <div className="flex flex-col gap-6">
          {posts.length === 0 && (
            <p className="rounded-2xl border border-dashed border-admin-ink/20 bg-white p-10 text-center text-sm text-admin-ink-soft">
              Todavía no has preparado ninguna publicación. Pulsa «+ Nueva publicación» o entra en «Sin publicar en Instagram».
            </p>
          )}
          {groups.map((g) => {
            const list = posts.filter((p) => g.statuses.includes(p.status));
            if (list.length === 0) return null;
            return (
              <section key={g.title} className="flex flex-col gap-2.5">
                <h2 className="text-[11px] font-medium uppercase tracking-[.14em] text-admin-faint">{g.title}</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((post) => {
                    const media = parseMedia(post.media);
                    const cover = media.find((m) => m.kind === "image");
                    return (
                      <Link key={post.id} href={`/admin/redes/${post.id}`} className="flex gap-3 rounded-2xl border border-admin-ink/10 bg-white p-3 transition hover:shadow-[0_8px_24px_rgba(31,27,26,.07)]">
                        <span className="relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-lg bg-admin-bg">
                          {cover && (
                            // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail with the post's crop
                            <img src={cover.url} alt="" className="absolute inset-0 h-full w-full object-cover" style={frameStyle(cover)} />
                          )}
                          {media.length > 1 && <span className="absolute right-1 top-1 rounded bg-black/55 px-1 text-[10px] text-white">{media.length}</span>}
                        </span>
                        <span className="flex min-w-0 flex-col gap-1">
                          <span className="w-fit rounded-full px-2 py-0.5 text-[10.5px] font-medium" style={STATUS[post.status].style}>
                            {STATUS[post.status].label}
                          </span>
                          <span className="truncate text-sm font-medium">{post.product?.name ?? "Publicación"}</span>
                          <span className="line-clamp-2 text-xs text-admin-ink-soft">{post.instagramText || "Sin texto todavía"}</span>
                          <span className="text-[11px] text-admin-faint">
                            {post.status === "PROGRAMADA" && post.scheduledFor
                              ? `Se publica el ${when(post.scheduledFor)}`
                              : post.status === "PUBLICADA" && post.instagramPublishedAt
                                ? `Publicada el ${when(post.instagramPublishedAt)}`
                                : `Editada el ${when(post.updatedAt)}`}
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {tab === "sin-publicar" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-admin-ink-soft">
            Productos de la web que todavía no tienen publicación en Instagram (los que vinieron de Instagram ya están enlazados).
          </p>
          {neverPosted.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-admin-ink/20 bg-white p-10 text-center text-sm text-admin-ink-soft">
              Todos los productos están en Instagram. 🎉
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {neverPosted.map((p) => (
                <NewPostRow key={p.id} product={{ id: p.id, name: p.name, image: p.mainImage ? { url: p.mainImage, focalX: p.mainImageFocalX, focalY: p.mainImageFocalY, zoom: p.mainImageZoom } : null, onInstagram: false }} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "hashtags" && <HashtagSetsEditor initial={sets.map((s) => ({ name: s.name, tags: s.tags }))} />}
    </div>
  );
}
