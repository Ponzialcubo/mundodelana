import Link from "next/link";

/** Numbered pages instead of an endless list: lighter pages and images that load right away. */
export function Pagination({ page, pages, href }: { page: number; pages: number; href: (page: number) => string }) {
  if (pages <= 1) return null;
  const btn = "flex h-11 min-w-11 items-center justify-center rounded-full px-3 text-[15px]";
  return (
    <nav aria-label="Páginas" className="flex items-center justify-center gap-2 pt-10">
      {page > 1 && (
        <Link href={href(page - 1)} className={`${btn} border border-ink/16 bg-white`} aria-label="Página anterior">
          ‹
        </Link>
      )}
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <Link
          key={n}
          href={href(n)}
          aria-current={n === page ? "page" : undefined}
          className={`${btn} ${n === page ? "bg-ink text-surface" : "border border-ink/16 bg-white"}`}
        >
          {n}
        </Link>
      ))}
      {page < pages && (
        <Link href={href(page + 1)} className={`${btn} border border-ink/16 bg-white`} aria-label="Página siguiente">
          ›
        </Link>
      )}
    </nav>
  );
}
