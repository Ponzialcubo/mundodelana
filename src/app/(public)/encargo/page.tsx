import type { Metadata } from "next";
import { OrderForm } from "@/components/public/OrderForm";
import { FooterWithSettings } from "@/components/public/FooterWithSettings";
import { getSiteSettings, phoneDigits } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/session";

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
  const [{ phone }, customerId, product] = await Promise.all([
    getSiteSettings(),
    getCustomerSession(),
    producto
      ? prisma.product.findFirst({ where: { slug: producto, publicationStatus: "PUBLICADO" }, select: { slug: true, name: true } })
      : null,
  ]);

  const customer = customerId ? await prisma.customer.findUnique({ where: { id: customerId }, select: { name: true, phone: true } }) : null;

  return (
    <>
      <OrderForm phone={phoneDigits(phone)} product={product} customer={customer} />
      <FooterWithSettings />
    </>
  );
}
