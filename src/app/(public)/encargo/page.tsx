import type { Metadata } from "next";
import { OrderForm } from "@/components/public/OrderForm";
import { FooterWithSettings } from "@/components/public/FooterWithSettings";
import { getSiteSettings, phoneDigits } from "@/lib/seo";
import { prisma } from "@/lib/prisma";

const title = "Pedir a medida";
const description =
  "Cuéntame qué pieza quieres y te respondo con precio y plazo en menos de 24 h laborables. Sin compromiso hasta que confirmes.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/encargo" },
  openGraph: { title, description, url: "/encargo" },
};

export default async function EncargoPage({ searchParams }: { searchParams: Promise<{ producto?: string }> }) {
  const { producto } = await searchParams;
  const [{ phone }, product] = await Promise.all([
    getSiteSettings(),
    producto
      ? prisma.product.findFirst({ where: { slug: producto, publicationStatus: "PUBLICADO" }, select: { slug: true, name: true } })
      : null,
  ]);

  return (
    <>
      <OrderForm phone={phoneDigits(phone)} product={product} />
      <FooterWithSettings />
    </>
  );
}
