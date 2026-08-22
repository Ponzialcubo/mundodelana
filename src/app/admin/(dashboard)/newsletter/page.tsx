import { prisma } from "@/lib/prisma";
import { SubscriberRowAction } from "@/components/admin/SubscriberRowAction";

export default async function AdminNewsletterPage() {
  const subs = await prisma.subscriber.findMany({ orderBy: { subscribedAt: "desc" } });
  const active = subs.filter((s) => s.state === "ACTIVO").length;
  const baja = subs.length - active;

  return (
    <div className="flex flex-col gap-6 p-6 md:p-9">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-normal">Suscriptores</h1>
          <p className="text-sm text-admin-ink-soft">{active} activas · {baja} bajas</p>
        </div>
        <div className="flex gap-2.5">
          <button className="rounded-full border border-admin-ink/16 bg-white px-4 py-2.5 text-sm font-medium">Exportar CSV</button>
          <button className="rounded-full bg-pink px-4 py-2.5 text-sm font-medium">Redactar y enviar aviso</button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-admin-ink/10 bg-white">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-admin-ink/10 bg-admin-surface-soft text-left text-xs text-admin-faint">
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Alta</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s.id} className="border-b border-admin-ink/6">
                <td className="px-4 py-3">{s.email}</td>
                <td className="px-4 py-3 text-admin-ink-soft">
                  {s.subscribedAt.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="rounded-full px-2.5 py-1 text-xs font-medium"
                    style={s.state === "ACTIVO" ? { background: "#EAF0E4", color: "#5C7245" } : { background: "#F3F1EE", color: "#8B837F" }}
                  >
                    {s.state === "ACTIVO" ? "Activo" : "Baja"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <SubscriberRowAction id={s.id} active={s.state === "ACTIVO"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
