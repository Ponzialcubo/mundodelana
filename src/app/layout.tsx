import type { Metadata } from "next";
import { Lora, Work_Sans } from "next/font/google";
import { SITE_URL, SITE_NAME, getSiteSettings, phoneDigits } from "@/lib/seo";
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
    default: "Mundodelana · crochet y amigurumis hechos a mano en España",
    template: "%s · Mundodelana",
  },
  description:
    "Amigurumis, decoración y piezas de bebé tejidas a mano por encargo, con algodón 100 % de alta calidad. Envíos a toda España desde Galicia.",
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "Mundodelana",
  },
};

function absoluteSocialUrl(url: string) {
  return url.startsWith("http") ? url : `https://${url}`;
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { phone, publicEmail, instagramUrl, tiktokUrl } = await getSiteSettings();

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    email: publicEmail,
    telephone: `+${phoneDigits(phone)}`,
    sameAs: [absoluteSocialUrl(instagramUrl), absoluteSocialUrl(tiktokUrl)],
  };

  return (
    <html lang="es" className={`${lora.variable} ${workSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
