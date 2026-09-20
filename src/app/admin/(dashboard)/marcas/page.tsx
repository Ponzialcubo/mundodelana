import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BrandRowActions } from "@/components/admin/BrandRowActions";

export default async function AdminMarcasPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { products: true } } },
  });
  const withProducts = brands.filter((b) => b._count.products > 0).length;

  return (
    <div className="flex flex-col gap-6 p-6 md:p-9">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-normal">Marcas</h1>
          <p className="text-sm text-admin-ink-soft">
            {brands.length} marcas · {withProducts} con productos publicados
          </p>
        </div>
        <Link href="/admin/marcas/nuevo" className="rounded-full bg-pink px-4 py-2.5 text-sm font-medium">
          + Nueva marca
        </Link>
      </div>

      <p className="text-xs text-admin-faint">
        Una marca es una franquicia o colección (ej. Pokémon, Dragon Ball) independiente de la categoría:
        una misma marca puede combinarse con distintas categorías de producto.
      </p>

      <div className="overflow-x-auto rounded-xl border border-admin-ink/10 bg-white">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-admin-ink/10 bg-admin-surface-soft text-left text-xs text-admin-faint">
              <th className="px-4 py-3 font-medium">Orden</th>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Productos</th>
              <th className="px-4 py-3 font-medium">En el filtro</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {brands.map((b) => {
              const visible = b._count.products > 0;
              return (
                <tr key={b.id} className="border-b border-admin-ink/6">
                  <td className="px-4 py-3 text-admin-ink-soft">
                    <span className="mr-1.5 cursor-grab">⠿</span>
                    {b.order}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium">{b.name}</span>
                      <span className="font-mono text-xs text-admin-faint">/{b.slug}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-admin-ink-soft">
                    {b._count.products === 0 ? "Sin productos" : `${b._count.products} producto${b._count.products === 1 ? "" : "s"}`}
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
                    <BrandRowActions id={b.id} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {brands.length === 0 && (
        <span className="text-xs text-admin-faint">Todavía no hay marcas creadas.</span>
      )}
    </div>
  );
}
