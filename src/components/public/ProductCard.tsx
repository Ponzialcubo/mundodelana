import Link from "next/link";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { STATUS_BADGE, formatPrice } from "@/lib/product-status";
import type { PieceStatus, PriceType } from "@/generated/prisma";

export type ProductCardData = {
  slug: string;
  name: string;
  price: number | string;
  priceType: PriceType;
  pieceStatus: PieceStatus;
  likes: number;
  categoryName?: string;
};

export function ProductCard({ product, showCategory = false }: { product: ProductCardData; showCategory?: boolean }) {
  const badge = STATUS_BADGE[product.pieceStatus];

  return (
    <Link
      href={`/producto/${product.slug}`}
      className="flex flex-col overflow-hidden rounded-xl border border-ink/8 bg-white"
    >
      <div className="relative">
        <ImagePlaceholder label={`foto — ${product.name}`} className="h-[145px] md:h-[220px]" />
        <span
          className="absolute left-3 top-3 rounded-full px-2.5 py-1 font-mono text-[10.5px] font-medium tracking-wide"
          style={{ background: badge.bg, color: badge.fg }}
        >
          {badge.label}
        </span>
      </div>
      <div className="flex flex-col gap-1.5 p-4">
        {showCategory && product.categoryName && (
          <span className="font-mono text-[11px] tracking-wider text-ink-soft">
            {product.categoryName.toUpperCase()}
          </span>
        )}
        <span className="font-serif text-[15px] font-medium leading-tight text-ink md:text-[17px]">
          {product.name}
        </span>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-[14px] font-medium text-ink md:text-[16px]">
            {formatPrice(product.price, product.priceType)}
          </span>
          <span className="text-[12.5px] text-ink/60">♥ {product.likes}</span>
        </div>
      </div>
    </Link>
  );
}
