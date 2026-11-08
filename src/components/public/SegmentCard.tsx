import Link from "next/link";
import { frameStyle } from "@/lib/framing";
import Image from "next/image";

type Photo = { url: string; focalX: number; focalY: number; zoom?: number } | null | undefined;
type Category = { name: string; slug: string; count: number; cover: Photo };

const pos = (p: NonNullable<Photo>) => frameStyle(p);

/**
 * One shop block (Muñecos, Bebé…): its photo (4:3) with the title under it
 * and, in the shop, its categories as quick links with a small thumbnail.
 * Horizontal on phones so the shop reads as a short list, a column on desktop.
 */
export function SegmentCard({
  id,
  href,
  photo,
  title,
  subtitle,
  tint,
  categories,
  priority = false,
}: {
  id?: string;
  href: string;
  photo: Photo;
  title: string;
  subtitle?: string;
  tint: string;
  categories?: Category[];
  priority?: boolean;
}) {
  const total = categories?.reduce((n, c) => n + c.count, 0);

  return (
    <article id={id} className="group flex scroll-mt-28 gap-3.5 rounded-2xl bg-white p-2.5 shadow-[0_4px_18px_rgba(74,63,59,.05)] transition hover:shadow-[0_10px_30px_rgba(74,63,59,.09)] md:flex-col md:gap-0 md:p-0">
      <Link href={href} className="relative block aspect-square w-[34%] shrink-0 overflow-hidden rounded-xl md:aspect-[4/3] md:w-full md:rounded-b-none md:rounded-t-2xl" style={{ background: tint }}>
        {photo && (
          <Image
            src={photo.url}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1280px) 240px, (min-width: 768px) 20vw, 34vw"
            className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
            style={pos(photo)}
          />
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2 py-1 pr-1 md:p-4">
        <Link href={href} className="flex flex-col">
          <h3 className="font-serif text-[18.5px] font-normal leading-tight md:text-[19px]">{title}</h3>
          <span className="text-[12.5px] text-ink/55">{total !== undefined ? `${total} piezas` : subtitle}</span>
        </Link>
        {categories && categories.length > 0 && (
          <ul className="flex flex-col">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/categoria/${c.slug}`} className="-mx-1.5 flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-[14px] hover:bg-surface">
                  <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full" style={{ background: tint }}>
                    {c.cover && <Image src={c.cover.url} alt="" fill sizes="28px" className="object-cover" style={pos(c.cover)} />}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{c.name}</span>
                  <span className="text-[12px] text-ink/40">{c.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
