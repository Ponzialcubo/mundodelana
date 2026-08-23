"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/slugify";

type Category = { id: string; name: string };
type RelatedOption = { id: string; name: string };

export type ProductFormData = {
  id?: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  materials: string;
  metaTitle: string;
  metaDescription: string;
  publicationStatus: "PUBLICADO" | "BORRADOR" | "ARCHIVADO";
  pieceStatus: "DISPONIBLE" | "TRABAJANDO_EN_ELLO" | "RESERVADO" | "VENDIDO" | "VENDIDO_POR_ENCARGO";
  featured: boolean;
  priceType: "STOCK" | "PERSONALIZADO";
  price: string;
  instagramUrl: string;
  tiktokUrl: string;
  categoryIds: string[];
  relatedIds: string[];
  mainImage: string;
  images: string[];
};

const EMPTY: ProductFormData = {
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  materials: "",
  metaTitle: "",
  metaDescription: "",
  publicationStatus: "BORRADOR",
  pieceStatus: "DISPONIBLE",
  featured: false,
  priceType: "STOCK",
  price: "",
  instagramUrl: "",
  tiktokUrl: "",
  categoryIds: [],
  relatedIds: [],
  mainImage: "",
  images: [],
};

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/admin/redes/upload", { method: "POST", body: formData });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "No se ha podido subir la imagen");
  return json.url as string;
}

export function ProductEditorForm({
  initial,
  categories,
  relatedOptions,
}: {
  initial?: ProductFormData;
  categories: Category[];
  relatedOptions: RelatedOption[];
}) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [data, setData] = useState<ProductFormData>(initial ?? EMPTY);
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [sideOpen, setSideOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const mainInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function onNameChange(name: string) {
    set("name", name);
    if (!slugTouched) set("slug", slugify(name));
  }

  const sideSummary = useMemo(() => {
    const pubLabel = { PUBLICADO: "Publicado", BORRADOR: "Borrador", ARCHIVADO: "Archivado" }[data.publicationStatus];
    const catLabel = categories.filter((c) => data.categoryIds.includes(c.id)).map((c) => c.name).join(", ") || "sin categoría";
    return `${pubLabel} · ${data.priceType === "STOCK" ? "stock" : "personalizado"} · ${catLabel}`;
  }, [data.publicationStatus, data.priceType, data.categoryIds, categories]);

  async function onMainImagePick(file: File) {
    setUploadingMain(true);
    setError("");
    try {
      const url = await uploadImage(file);
      set("mainImage", url);
    } catch {
      setError("No se ha podido subir la foto de portada.");
    } finally {
      setUploadingMain(false);
      if (mainInputRef.current) mainInputRef.current.value = "";
    }
  }

  async function onGalleryImagesPick(files: FileList) {
    setUploadingGallery(true);
    setError("");
    try {
      const urls = await Promise.all(Array.from(files).map(uploadImage));
      set("images", [...data.images, ...urls]);
    } catch {
      setError("No se ha podido subir alguna de las fotos.");
    } finally {
      setUploadingGallery(false);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  }

  function removeGalleryImage(url: string) {
    set(
      "images",
      data.images.filter((i) => i !== url)
    );
  }

  async function save(publicationStatus?: ProductFormData["publicationStatus"]) {
    setLoading(true);
    setError("");
    const payload = { ...data, publicationStatus: publicationStatus ?? data.publicationStatus };
    try {
      const res = await fetch(isEdit ? `/api/admin/productos/${initial!.id}` : "/api/admin/productos", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      router.push("/admin/productos");
      router.refresh();
    } catch {
      setError("No se ha podido guardar. Revisa los campos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-9">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-normal">{isEdit ? "Editar producto" : "Nuevo producto"}</h1>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={() => save("BORRADOR")}
            disabled={loading}
            className="rounded-full border border-admin-ink/16 bg-white px-4 py-2.5 text-sm font-medium disabled:opacity-60"
          >
            Guardar borrador
          </button>
          <button
            onClick={() => save("PUBLICADO")}
            disabled={loading}
            className="rounded-full bg-pink px-4 py-2.5 text-sm font-medium disabled:opacity-60"
          >
            Publicar cambios
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-admin-danger">{error}</p>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 rounded-xl border border-admin-ink/10 bg-white p-6">
            <span className="font-serif text-base font-medium">Información básica</span>
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
                <span className="font-mono text-xs text-admin-faint">mundodelana.es/producto/</span>
                <input
                  value={data.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", e.target.value);
                  }}
                  className="flex-1 bg-transparent font-mono text-xs outline-none"
                />
              </div>
              <span className="text-xs text-admin-faint">
                {slugTouched ? "Editado a mano. No cambiará al renombrar el producto." : "Se genera solo a partir del nombre. Puedes editarlo."}
              </span>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-admin-ink/85">Descripción corta</span>
              <input
                value={data.shortDescription}
                onChange={(e) => set("shortDescription", e.target.value)}
                placeholder="Una línea que aparece en las tarjetas del catálogo"
                className="rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-2.5 text-sm outline-none"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-admin-ink/85">Descripción</span>
              <textarea
                value={data.description}
                onChange={(e) => set("description", e.target.value)}
                rows={6}
                placeholder="Descripción completa que se ve en la ficha de producto."
                className="rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-2.5 text-sm outline-none"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-admin-ink/85">Materiales</span>
              <textarea
                value={data.materials}
                onChange={(e) => set("materials", e.target.value)}
                rows={4}
                placeholder="Un material por línea: algodón 100 % DMC Baby Cotton, relleno antialérgico…"
                className="rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-2.5 text-sm outline-none"
              />
              <span className="text-xs text-admin-faint">Se muestran como lista en la ficha.</span>
            </label>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-admin-ink/10 bg-white p-6">
            <span className="font-serif text-base font-medium">Fotos</span>

            <input
              ref={mainInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onMainImagePick(file);
              }}
            />
            <button
              type="button"
              onClick={() => mainInputRef.current?.click()}
              disabled={uploadingMain}
              className="h-40 rounded-lg bg-cover bg-center disabled:opacity-60"
              style={
                data.mainImage
                  ? { backgroundImage: `url(${data.mainImage})` }
                  : { background: "repeating-linear-gradient(45deg,#EDEBE8 0 9px,#F7F6F4 9px 18px)" }
              }
            >
              {!data.mainImage && (
                <span className="text-sm text-admin-ink-soft">{uploadingMain ? "Subiendo…" : "+ Foto de portada"}</span>
              )}
            </button>

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) onGalleryImagesPick(e.target.files);
              }}
            />
            <div className="grid grid-cols-3 gap-3">
              {data.images.map((url) => (
                <div key={url} className="group relative h-20 rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${url})` }}>
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(url)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-xs text-white opacity-0 group-hover:opacity-100"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={uploadingGallery}
                className="flex h-20 items-center justify-center rounded-lg border border-dashed border-admin-ink/25 text-sm text-admin-ink-soft disabled:opacity-60"
              >
                {uploadingGallery ? "Subiendo…" : "+ Añadir"}
              </button>
            </div>
            <span className="text-xs text-admin-faint">La foto de portada es la que se ve en el catálogo.</span>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-admin-ink/10 bg-white p-6">
            <span className="font-serif text-base font-medium">SEO</span>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-admin-ink/85">Meta título</span>
              <input
                value={data.metaTitle}
                onChange={(e) => set("metaTitle", e.target.value)}
                placeholder="Osito Lucas · amigurumi de algodón hecho a mano"
                className="rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-2.5 text-sm outline-none"
              />
              <span className="text-xs text-admin-faint">Recomendado: hasta 60 caracteres.</span>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-admin-ink/85">Meta descripción</span>
              <textarea
                value={data.metaDescription}
                onChange={(e) => set("metaDescription", e.target.value)}
                rows={3}
                placeholder="Resumen que aparece en Google, hasta 155 caracteres."
                className="rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-2.5 text-sm outline-none"
              />
            </label>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-admin-ink/10 bg-white p-6">
            <span className="font-serif text-base font-medium">También te puede gustar</span>
            <span className="text-xs text-admin-faint">{data.relatedIds.length} seleccionados · se muestran al final de la ficha</span>
            <div className="flex flex-wrap gap-2">
              {relatedOptions.map((r) => {
                const on = data.relatedIds.includes(r.id);
                return (
                  <button
                    key={r.id}
                    onClick={() =>
                      set("relatedIds", on ? data.relatedIds.filter((id) => id !== r.id) : [...data.relatedIds, r.id])
                    }
                    className="rounded-full px-3 py-1.5 text-[13px]"
                    style={on ? { background: "#1F1B1A", color: "#F7F6F4" } : { background: "#fff", border: "1px solid rgba(31,27,26,.14)" }}
                  >
                    {on ? "✓ " : ""}
                    {r.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-xl border border-admin-ink/10 bg-white p-6">
            <button onClick={() => setSideOpen((v) => !v)} className="flex items-center justify-between">
              <span className="font-serif text-base font-medium">Publicación</span>
              <span className="text-sm text-admin-ink-soft">{sideOpen ? "–" : "+"}</span>
            </button>
            {sideOpen && (
              <>
                <span className="text-xs text-admin-faint">{sideSummary}</span>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-medium text-admin-ink/85">Estado de publicación</span>
                  <select
                    value={data.publicationStatus}
                    onChange={(e) => set("publicationStatus", e.target.value as ProductFormData["publicationStatus"])}
                    className="rounded-lg border border-admin-ink/14 bg-admin-bg px-3 py-2.5 text-sm outline-none"
                  >
                    <option value="PUBLICADO">Publicado</option>
                    <option value="BORRADOR">Borrador</option>
                    <option value="ARCHIVADO">Archivado</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-medium text-admin-ink/85">Estado de la pieza</span>
                  <select
                    value={data.pieceStatus}
                    onChange={(e) => set("pieceStatus", e.target.value as ProductFormData["pieceStatus"])}
                    className="rounded-lg border border-admin-ink/14 bg-admin-bg px-3 py-2.5 text-sm outline-none"
                  >
                    <option value="DISPONIBLE">Disponible</option>
                    <option value="TRABAJANDO_EN_ELLO">Trabajando en ello</option>
                    <option value="RESERVADO">Reservado</option>
                    <option value="VENDIDO">Vendido</option>
                    <option value="VENDIDO_POR_ENCARGO">Vendido por encargo</option>
                  </select>
                </label>
                <label className="flex items-center gap-2 text-[13px] text-admin-ink/85">
                  <input
                    type="checkbox"
                    checked={data.featured}
                    onChange={(e) => set("featured", e.target.checked)}
                    className="accent-pink"
                  />
                  Destacar en la home
                </label>
              </>
            )}
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-admin-ink/10 bg-white p-6">
            <span className="font-serif text-base font-medium">Precio y tipo</span>
            <div className="flex rounded-full bg-admin-bg p-1">
              <button
                onClick={() => set("priceType", "STOCK")}
                className="flex-1 rounded-full py-2 text-sm font-medium"
                style={data.priceType === "STOCK" ? { background: "#fff" } : {}}
              >
                Stock
              </button>
              <button
                onClick={() => set("priceType", "PERSONALIZADO")}
                className="flex-1 rounded-full py-2 text-sm font-medium"
                style={data.priceType === "PERSONALIZADO" ? { background: "#fff" } : {}}
              >
                Personalizado
              </button>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-admin-ink/85">
                {data.priceType === "PERSONALIZADO" ? "Precio base (se mostrará como «desde»)" : "Precio"}
              </span>
              <div className="flex items-center gap-2 rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-2.5">
                <input
                  type="number"
                  value={data.price}
                  onChange={(e) => set("price", e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none"
                />
                <span className="text-sm text-admin-faint">€</span>
              </div>
              <span className="text-xs text-admin-faint">
                {data.priceType === "PERSONALIZADO" ? `En la ficha aparece como «desde ${data.price || "32"} €».` : "Precio cerrado de la pieza en stock."}
              </span>
            </label>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-admin-ink/10 bg-white p-6">
            <span className="font-serif text-base font-medium">Categorías</span>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const on = data.categoryIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() =>
                      set("categoryIds", on ? data.categoryIds.filter((id) => id !== c.id) : [...data.categoryIds, c.id])
                    }
                    className="rounded-full px-3 py-1.5 text-[13px]"
                    style={on ? { background: "#1F1B1A", color: "#F7F6F4" } : { background: "#fff", border: "1px solid rgba(31,27,26,.14)" }}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
            <span className="text-xs text-admin-faint">
              {data.categoryIds.length
                ? `Seleccionadas: ${categories.filter((c) => data.categoryIds.includes(c.id)).map((c) => c.name).join(", ")}`
                : "Sin categoría: no aparecerá en los filtros del catálogo."}
            </span>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-admin-ink/10 bg-white p-6">
            <span className="font-serif text-base font-medium">Redes de esta pieza</span>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-admin-ink/85">Enlace de Instagram</span>
              <input
                value={data.instagramUrl}
                onChange={(e) => set("instagramUrl", e.target.value)}
                placeholder="instagram.com/p/…"
                className="rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-2.5 text-sm outline-none"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-admin-ink/85">Enlace de TikTok</span>
              <input
                value={data.tiktokUrl}
                onChange={(e) => set("tiktokUrl", e.target.value)}
                placeholder="tiktok.com/@mundodelana/video/…"
                className="rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-2.5 text-sm outline-none"
              />
            </label>
            <span className="text-xs text-admin-faint">Si están vacíos, los iconos no aparecen en la ficha.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
