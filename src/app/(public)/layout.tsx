import { Header } from "@/components/public/Header";
import { WhatsAppFloat } from "@/components/public/WhatsAppFloat";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream text-ink">
      <Header />
      <main className="flex-1 bg-surface">{children}</main>
      <WhatsAppFloat />
    </div>
  );
}
