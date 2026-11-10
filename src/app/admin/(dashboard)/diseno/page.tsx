import { prisma } from "@/lib/prisma";
import { leerDiseno } from "@/lib/panel-diseno";
import { PanelDesignForm } from "@/components/admin/PanelDesignForm";

export const dynamic = "force-dynamic";

export default async function AdminDisenoPage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 }, select: { panelDesign: true } });
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 p-5 md:p-9">
      <div>
        <h1 className="font-serif text-2xl font-normal md:text-3xl">Diseño del panel</h1>
        <p className="mt-1 text-sm text-admin-ink-soft">Elige qué tienes a mano en el móvil y qué ves al entrar.</p>
      </div>
      <PanelDesignForm inicial={leerDiseno(settings?.panelDesign)} />
    </div>
  );
}
