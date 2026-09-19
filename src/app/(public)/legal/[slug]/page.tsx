import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FooterWithSettings } from "@/components/public/FooterWithSettings";
import { prisma } from "@/lib/prisma";
import { parseLegalContent } from "@/lib/legal-content";
import { getSiteSettings } from "@/lib/seo";

const NAV = [
  { slug: "aviso", label: "Aviso legal" },
  { slug: "privacidad", label: "Política de privacidad" },
  { slug: "cookies", label: "Política de cookies" },
];

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await prisma.legalPage.findUnique({ where: { slug }, select: { title: true } });
  if (!page) return { title: "Página no encontrada" };
  return {
    title: page.title,
    alternates: { canonical: `/legal/${slug}` },
    robots: { index: false, follow: true },
  };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [page, { publicEmail }] = await Promise.all([
    prisma.legalPage.findUnique({ where: { slug } }),
    getSiteSettings(),
  ]);
  if (!page) notFound();

  const blocks = parseLegalContent(page.content);

  return (
    <>
      <section className="grid grid-cols-1 gap-8 px-5 py-8 md:grid-cols-[220px_1fr] md:px-14 md:py-10">
        <aside className="flex flex-row gap-2 overflow-auto md:sticky md:top-6 md:flex-col md:gap-1.5 md:self-start">
          {NAV.map((item) => (
            <Link
              key={item.slug}
              href={`/legal/${item.slug}`}
              className="rounded-lg px-3.5 py-2.5 text-sm whitespace-nowrap"
              style={
                item.slug === slug
                  ? { background: "#fff", border: "1px solid rgba(74,63,59,.14)", fontWeight: 500 }
                  : { color: "rgba(74,63,59,.7)" }
              }
            >
              {item.label}
            </Link>
          ))}
          <p className="mt-3 hidden max-w-[200px] text-xs text-ink/55 md:block">
            ¿Dudas sobre tus datos? Escríbeme a {publicEmail} y te contesto yo.
          </p>
        </aside>

        <article className="flex max-w-2xl flex-col gap-6">
          <h1 className="font-serif text-[28px] font-normal md:text-[34px]">{page.title}</h1>
          {blocks.length === 0 && (
            <p className="text-[14.5px] font-light leading-relaxed text-ink/70">
              Esta web todavía no usa cookies propias ni de terceros. En cuanto se incorpore alguna (por ejemplo,
              analítica o redes sociales), esta página se actualizará antes de activarla.
            </p>
          )}
          {blocks.map((block, i) => {
            if (block.type === "heading") {
              return (
                <h2 key={i} className="font-serif text-lg font-medium">
                  {block.text}
                </h2>
              );
            }
            if (block.type === "list") {
              return (
                <ul key={i} className="ml-4 list-disc text-[14.5px] font-light leading-relaxed text-ink/80">
                  {block.items.map((li) => (
                    <li key={li}>{li}</li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={i} className="text-[14.5px] font-light leading-relaxed text-ink/80">
                {block.text}
              </p>
            );
          })}
        </article>
      </section>

      <FooterWithSettings />
    </>
  );
}
