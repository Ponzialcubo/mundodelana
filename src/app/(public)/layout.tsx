import { Header } from "@/components/public/Header";
import { WhatsAppFloat } from "@/components/public/WhatsAppFloat";
import { getSiteSettings, phoneDigits } from "@/lib/seo";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const { phone } = await getSiteSettings();

  return (
    <div className="flex min-h-screen flex-col bg-cream text-ink">
      <Header />
      <main className="flex-1 bg-surface">{children}</main>
      <WhatsAppFloat phone={phoneDigits(phone)} />
    </div>
  );
}
