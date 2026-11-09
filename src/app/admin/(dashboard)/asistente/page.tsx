import { AsistenteLista } from "@/components/admin/asistente/AsistenteLista";
import { asistenteActivo } from "@/lib/asistente";

export const dynamic = "force-dynamic";

export default async function AdminAsistentePage({ searchParams }: { searchParams: Promise<{ vista?: string }> }) {
  const { vista } = await searchParams;
  return <AsistenteLista activo={asistenteActivo()} vistaInicial={vista} />;
}
