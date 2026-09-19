import type { Metadata } from "next";
import { Lora, Work_Sans } from "next/font/google";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Mundolana · crochet y amigurumis hechos a mano en España",
    template: "%s · Mundolana",
  },
  description:
    "Amigurumis, decoración y piezas de bebé tejidas a mano por encargo, con algodón 100 % de alta calidad. Envíos a toda España desde Galicia.",
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "Mundolana",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${lora.variable} ${workSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
