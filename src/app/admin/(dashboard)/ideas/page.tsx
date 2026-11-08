import { prisma } from "@/lib/prisma";
import { IdeasBoard } from "@/components/admin/IdeasBoard";

export default async function AdminIdeasPage() {
  const ideas = await prisma.idea.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 p-5 md:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-2xl font-normal">💡 Ideas</h1>
        <p className="max-w-2xl text-sm text-admin-ink-soft">
          Apunta aquí cualquier idea, cambio de diseño o cosa que te gustaría en la web o en este panel. Las revisamos y te
          contestamos aquí mismo. Puedes editarlas o borrarlas cuando quieras.
        </p>
      </div>
      <IdeasBoard
        ideas={ideas.map((i) => ({
          id: i.id,
          title: i.title,
          description: i.description,
          area: i.area,
          status: i.status,
          reply: i.reply,
          createdAt: i.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
