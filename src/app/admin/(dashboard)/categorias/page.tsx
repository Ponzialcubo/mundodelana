import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CategoryRowActions } from "@/components/admin/CategoryRowActions";

export default async function AdminCategoriasPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { products: true } } },
  });
  const withProducts = categories.filter((c) => c._count.products > 0).length;

  return (
    <div className="flex flex-col gap-6 p-6 md:p-9">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-normal">Categorías</h1>
          <p className="text-sm text-admin-ink-soft">
            {categories.length} categorías · {withProducts} con productos publicados
          </p>
        </div>
        <Link href="/admin/categorias/nuevo" className="rounded-full bg-pink px-4 py-2.5 text-sm font-medium">
          + Nueva categoría
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-admin-ink/10 bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-admin-ink/10 bg-admin-surface-soft text-left text-xs text-admin-faint">
              <th className="px-4 py-3 font-medium">Orden</th>
              <th className="px-4 py-3 font-medium">Portada</th>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Productos</th>
              <th className="px-4 py-3 font-medium">En el menú</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => {
              const visible = c._count.products > 0;
              return (
                <tr key={c.id} className="border-b border-admin-ink/6">
                  <td className="px-4 py-3 text-admin-ink-soft">
                    <span className="mr-1.5 cursor-grab">⠿</span>
                    {c.order}
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-10 w-10 rounded-md" style={{ background: "repeating-linear-gradient(45deg,#EDEBE8 0 6px,#F7F6F4 6px 12px)" }} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium">{c.name}</span>
                      <span className="font-mono text-xs text-admin-faint">/{c.slug}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-admin-ink-soft">
                    {c._count.products === 0 ? "Sin productos" : `${c._count.products} producto${c._count.products === 1 ? "" : "s"}`}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="rounded-full px-2.5 py-1 text-xs font-medium"
                      style={visible ? { background: "#EAF0E4", color: "#5C7245" } : { background: "#F3F1EE", color: "#6E6663" }}
                    >
                      {visible ? "Visible" : "Oculta"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <CategoryRowActions id={c.id} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <span className="text-xs text-admin-faint">Arrastra por el asa para cambiar el orden del menú público.</span>
    </div>
  );
}
