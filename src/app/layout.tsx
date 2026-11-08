import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";

// Self-hosted (variable, latin subset) so builds never depend on reaching Google Fonts.
const lora = localFont({
  variable: "--font-lora",
  src: [
    { path: "./fonts/Lora-normal.woff2", weight: "400 700", style: "normal" },
    { path: "./fonts/Lora-italic.woff2", weight: "400 700", style: "italic" },
  ],
  display: "swap",
});

const workSans = localFont({
  variable: "--font-work-sans",
  src: [{ path: "./fonts/WorkSans-normal.woff2", weight: "300 600", style: "normal" }],
  display: "swap",
});

// Explicit viewport: default width/scale, zoom allowed (accessibility) —
// this alone doesn't fix mobile layout shift, it just stops the browser
// from guessing. The real fix for "misaligned on zoom" is any element wider
// than 100vw, which forces the whole viewport to scale down to fit it.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

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
