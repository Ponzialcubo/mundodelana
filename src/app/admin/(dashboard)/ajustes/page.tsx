import { prisma } from "@/lib/prisma";
import { SETTINGS_TABS, SettingsForm, type SettingsTab } from "@/components/admin/SettingsForm";

export default async function AdminAjustesPage({ searchParams }: { searchParams: Promise<{ seccion?: string }> }) {
  const { seccion } = await searchParams;
  const initialTab = (SETTINGS_TABS.find((t) => t.key === seccion)?.key ?? "contacto") as SettingsTab;
  const [settings, faqs, testimonials] = await Promise.all([
    prisma.siteSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } }),
    prisma.faq.findMany({ orderBy: { order: "asc" } }),
    prisma.testimonial.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <SettingsForm
      initialSettings={{
        phone: settings.phone,
        publicEmail: settings.publicEmail,
        hoursWeekday: settings.hoursWeekday,
        hoursSaturday: settings.hoursSaturday,
        hoursSunday: settings.hoursSunday,
        instagramUrl: settings.instagramUrl,
        tiktokUrl: settings.tiktokUrl,
        defaultMetaTitle: settings.defaultMetaTitle,
        defaultMetaDescription: settings.defaultMetaDescription,
      }}
      initialFaqs={faqs}
      initialTestimonials={testimonials}
      initialTab={initialTab}
    />
  );
}
