import { notFound, redirect } from "next/navigation";
import { AsistenteChat } from "@/components/admin/asistente/AsistenteChat";
import { asistenteActivo } from "@/lib/asistente";

export const dynamic = "force-dynamic";

export default async function AdminAsistenteTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  if (!asistenteActivo()) redirect("/admin/asistente");
  return <AsistenteChat key={id} id={Number(id)} />;
}
