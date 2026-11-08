import { SITE_IMAGE_SLOTS, getSiteImages } from "@/lib/site-images";
import { SiteImagesManager } from "@/components/admin/SiteImagesManager";

export default async function AdminImagenesWebPage() {
  const images = await getSiteImages();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 p-5 md:p-9">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-2xl font-normal">Imágenes de la web</h1>
        <p className="text-sm text-admin-ink-soft">
          Las fotos de portada, «Sobre mí», «Cómo funciona» y «Contacto». Pulsa «✨ Crear con IA» para copiar un prompt
          listo para ChatGPT o Gemini y subir el resultado. Los cambios se guardan solos.
        </p>
      </div>
      <SiteImagesManager slots={SITE_IMAGE_SLOTS} initial={images} />
    </div>
  );
}
