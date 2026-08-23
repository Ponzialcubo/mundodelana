"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/slugify";
import { AiGenerateButton } from "@/components/admin/AiGenerateButton";

export type CategoryFormData = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  metaTitle: string;
  metaDescription: string;
  order: number;
  productCount?: number;
};

const EMPTY: CategoryFormData = {
  name: "",
  slug: "",
  description: "",
  coverImage: "",
  metaTitle: "",
  metaDescription: "",
  order: 1,
};

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/admin/redes/upload", { method: "POST", body: formData });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "No se ha podido subir la imagen");
  return json.url as string;
}

export function CategoryEditorForm({ initial }: { initial?: CategoryFormData }) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [data, setData] = useState<CategoryFormData>(initial ?? EMPTY);
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof CategoryFormData>(key: K, value: CategoryFormData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function onNameChange(name: string) {
    set("name", name);
    if (!slugTouched) set("slug", slugify(name));
  }

  async function onCoverImagePick(file: File) {
    setUploadingCover(true);
    setError("");
    try {
      const url = await uploadImage(file);
      set("coverImage", url);
    } catch {
      setError("No se ha podido subir la foto de portada.");
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  }

  async function save() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(isEdit ? `/api/admin/categorias/${initial!.id}` : "/api/admin/categorias", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      router.push("/admin/categorias");
      router.refresh();
    } catch {
      setError("No se ha podido guardar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-9">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl font-normal">{isEdit ? "Editar categoría" : "Nueva categoría"}</h1>
        <div className="flex gap-2.5">
          <button onClick={() => router.push("/admin/categorias")} className="rounded-full border border-admin-ink/16 bg-white px-4 py-2.5 text-sm font-medium">
            Cancelar
          </button>
          <button onClick={save} disabled={loading} className="rounded-full bg-pink px-4 py-2.5 text-sm font-medium disabled:opacity-60">
            {loading ? "Guardando…" : "Guardar categoría"}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-admin-danger">{error}</p>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 rounded-xl border border-admin-ink/10 bg-white p-6">
            <span className="font-serif text-base font-medium">Información</span>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-admin-ink/85">Nombre</span>
              <input
                value={data.name}
                onChange={(e) => onNameChange(e.target.value)}
                className="rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-2.5 text-sm outline-none"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-admin-ink/85">Slug</span>
              <div className="flex items-center gap-1 rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-2.5">
                <span className="font-mono text-xs text-admin-faint">mundodelana.es/categoria/</span>
                <input
                  value={data.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", e.target.value);
                  }}
                  className="flex-1 bg-transparent font-mono text-xs outline-none"
                />
              </div>
              <span className="text-xs text-admin-faint">Se genera a partir del nombre. Puedes editarlo.</span>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-admin-ink/85">Descripción</span>
              <textarea
                value={data.description}
                onChange={(e) => set("description", e.target.value)}
                rows={4}
                placeholder="Texto que aparece en la cabecera de la categoría."
                className="rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-2.5 text-sm outline-none"
              />
            </label>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-admin-ink/10 bg-white p-6">
            <span className="font-serif text-base font-medium">SEO</span>
            <label className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-admin-ink/85">Meta título</span>
                <AiGenerateButton
                  field="categoryMetaTitle"
                  context={{ name: data.name, description: data.description, metaTitle: data.metaTitle, metaDescription: data.metaDescription }}
                  onGenerated={(text) => set("metaTitle", text)}
                />
              </div>
              <input
                value={data.metaTitle}
                onChange={(e) => set("metaTitle", e.target.value)}
                placeholder="Amigurumis hechos a mano · Mundodelana"
                className="rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-2.5 text-sm outline-none"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-admin-ink/85">Meta descripción</span>
                <AiGenerateButton
                  field="categoryMetaDescription"
                  context={{ name: data.name, description: data.description, metaTitle: data.metaTitle, metaDescription: data.metaDescription }}
                  onGenerated={(text) => set("metaDescription", text)}
                />
              </div>
              <textarea
                value={data.metaDescription}
                onChange={(e) => set("metaDescription", e.target.value)}
                rows={3}
                placeholder="Hasta 155 caracteres."
                className="rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-2.5 text-sm outline-none"
              />
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-xl border border-admin-ink/10 bg-white p-6">
            <span className="font-serif text-base font-medium">Foto de portada</span>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onCoverImagePick(file);
              }}
            />
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
              className="h-32 rounded-lg bg-cover bg-center disabled:opacity-60"
              style={
                data.coverImage
                  ? { backgroundImage: `url(${data.coverImage})` }
                  : { background: "repeating-linear-gradient(45deg,#EDEBE8 0 9px,#F7F6F4 9px 18px)" }
              }
            >
              {!data.coverImage && (
                <span className="text-sm text-admin-ink-soft">{uploadingCover ? "Subiendo…" : "+ Foto de portada"}</span>
              )}
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                className="flex-1 rounded-full border border-admin-ink/16 bg-white px-3 py-2 text-sm disabled:opacity-60"
              >
                Cambiar
              </button>
              <button
                type="button"
                onClick={() => set("coverImage", "")}
                disabled={uploadingCover || !data.coverImage}
                className="flex-1 rounded-full border border-admin-ink/16 bg-white px-3 py-2 text-sm disabled:opacity-60"
              >
                Quitar
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-admin-ink/10 bg-white p-6">
            <span className="font-serif text-base font-medium">Orden en el menú</span>
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => set("order", Math.max(1, data.order - 1))} className="h-8 w-8 rounded-full border border-admin-ink/16 text-sm">−</button>
              <span className="w-8 text-center font-medium">{data.order}</span>
              <button onClick={() => set("order", data.order + 1)} className="h-8 w-8 rounded-full border border-admin-ink/16 text-sm">+</button>
            </div>
            <span className="text-xs text-admin-faint">Posición 1 = primera del menú. La categoría solo aparece si tiene productos publicados.</span>
          </div>

          {isEdit && (
            <div className="rounded-xl bg-admin-surface-soft p-5">
              <span className="text-sm text-admin-ink-soft">
                {data.productCount ?? 0} producto{(data.productCount ?? 0) === 1 ? "" : "s"} asignado{(data.productCount ?? 0) === 1 ? "" : "s"} ({data.name})
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
