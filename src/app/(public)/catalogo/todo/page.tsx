import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/public/ProductCard";
import { Pagination } from "@/components/public/Pagination";
import { SearchLauncher } from "@/components/public/SearchLauncher";
import { FooterWithSettings } from "@/components/public/FooterWithSettings";

const PAGE_SIZE = 24;
const PUBLISHED = { publicationStatus: "PUBLICADO" } as const;

export const metadata: Metadata = {
  title: "Todas las piezas",
  description: "Todas las piezas de crochet de Mundolana: amigurumis, bebé, pendientes, decoración y regalos tejidos a mano por encargo.",
  alternates: { canonical: "/catalogo/todo" },
};

export default async function TodoPage({ searchParams }: { searchParams: Promise<{ pagina?: string }> }) {
  const { pagina } = await searchParams;
  const total = await prisma.product.count({ where: PUBLISHED });
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(pages, Math.max(1, Number(pagina) || 1));

  const products = await prisma.product.findMany({
    where: PUBLISHED,
    include: { categories: { orderBy: { order: "asc" } } },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }, { id: "asc" }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return (
    <>
      <section className="flex flex-col gap-4 px-5 pb-5 pt-7 md:px-14 md:pt-12">
        <Link href="/catalogo" className="text-[13.5px] text-ink/60">‹ Categorías</Link>
        <div className="flex items-end justify-between gap-3">
          <h1 className="font-serif text-[30px] font-normal leading-tight md:text-[42px]">Todas las piezas</h1>
          <span className="pb-1.5 text-[13px] text-ink/60">{total} piezas</span>
        </div>
        <SearchLauncher />
      </section>

      <section className="px-5 pb-12 md:px-14">
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 md:gap-x-5 md:gap-y-8 xl:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard
              key={p.id}
              priority={i < 4}
              showCategory
              product={{
                slug: p.slug, name: p.name, price: p.price.toString(), priceType: p.priceType, pieceStatus: p.pieceStatus, likes: p.likes,
                categoryName: p.categories[0]?.name, mainImage: p.mainImage, mainImageFocalX: p.mainImageFocalX, mainImageFocalY: p.mainImageFocalY,
              }}
            />
          ))}
        </div>
        <Pagination page={page} pages={pages} href={(n) => (n === 1 ? "/catalogo/todo" : `/catalogo/todo?pagina=${n}`)} />
      </section>

      <FooterWithSettings />
    </>
  );
}
