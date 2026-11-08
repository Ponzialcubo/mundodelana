import { SITE_IMAGE_GROUPS, SITE_IMAGE_SLOTS, getSiteImages } from "@/lib/site-images";
import { SiteImagesManager } from "@/components/admin/SiteImagesManager";
import { prisma } from "@/lib/prisma";

export default async function AdminImagenesWebPage() {
  const [images, settings] = await Promise.all([getSiteImages(), prisma.siteSettings.findUnique({ where: { id: 1 }, select: { heroPhrases: true } })]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 p-5 md:p-9">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-2xl font-normal">Imágenes de la web</h1>
        <p className="text-sm text-admin-ink-soft">
          Banners de la portada, fondos de las tarjetas de la tienda y fotos de las páginas. En cada una puedes subir una
          imagen directamente o pulsar «✨ Crear con IA» para copiar un prompt listo para ChatGPT o Gemini (y añadirle tu
          idea). Los cambios se guardan solos.
        </p>
      </div>
      <SiteImagesManager groups={SITE_IMAGE_GROUPS} slots={SITE_IMAGE_SLOTS} initial={images} phrases={settings?.heroPhrases ?? []} />
    </div>
  );
}
