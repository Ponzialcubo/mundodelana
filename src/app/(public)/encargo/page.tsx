import type { Metadata } from "next";
import { OrderForm } from "@/components/public/OrderForm";
import { FooterWithSettings } from "@/components/public/FooterWithSettings";
import { getSiteSettings, phoneDigits } from "@/lib/seo";

const title = "Pedir a medida";
const description =
  "Cuéntame qué pieza quieres y te respondo con precio y plazo en menos de 24 h laborables. Sin compromiso hasta que confirmes.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/encargo" },
  openGraph: { title, description, url: "/encargo" },
};

export default async function EncargoPage() {
  const { phone } = await getSiteSettings();

  return (
    <>
      <OrderForm phone={phoneDigits(phone)} />
      <FooterWithSettings />
    </>
  );
}
