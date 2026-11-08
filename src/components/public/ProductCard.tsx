import Link from "next/link";
import Image from "next/image";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { formatPrice, hasPrice, productAction } from "@/lib/product-status";
import type { PieceStatus, PriceType } from "@/generated/prisma";

export type ProductCardData = {
  slug: string;
  name: string;
  price: number | string;
  priceType: PriceType;
  pieceStatus: PieceStatus;
  likes: number;
  categoryName?: string;
  mainImage?: string | null;
  mainImageFocalX?: number;
  mainImageFocalY?: number;
};

export function ProductCard({
  product,
  showCategory = false,
  priority = false,
}: {
  product: ProductCardData;
  showCategory?: boolean;
  /** Set on the first cards of a page so the browser fetches them first (LCP). */
  priority?: boolean;
}) {
  const { badge } = productAction(product.pieceStatus, product.priceType);
  const priced = hasPrice(product.price);

  return (
    <Link href={`/producto/${product.slug}`} className="group flex flex-col gap-2.5">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-cream">
        {product.mainImage ? (
          <Image
            src={product.mainImage}
            alt={product.name}
            fill
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 48vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            style={{ objectPosition: `${(product.mainImageFocalX ?? 0.5) * 100}% ${(product.mainImageFocalY ?? 0.5) * 100}%` }}
            priority={priority}
          />
        ) : (
          <ImagePlaceholder label={product.name} className="h-full w-full" />
        )}
        {badge && (
          <span
            className="absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[10.5px] font-medium tracking-wide"
            style={{ background: badge.bg, color: badge.fg }}
          >
            {badge.label.charAt(0) + badge.label.slice(1).toLowerCase()}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-0.5 px-0.5">
        {showCategory && product.categoryName && (
          <span className="text-[11px] uppercase tracking-[.12em] text-ink-soft">{product.categoryName}</span>
        )}
        <span className="line-clamp-2 font-serif text-[15px] font-medium leading-snug text-ink md:text-[16.5px]">
          {product.name}
        </span>
        <span className={priced ? "text-[14px] font-medium text-ink md:text-[15px]" : "text-[13px] text-ink-soft"}>
          {formatPrice(product.price, product.priceType)}
        </span>
      </div>
    </Link>
  );
}
