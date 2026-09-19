"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/slugify";
import { AiGenerateButton } from "@/components/admin/AiGenerateButton";
import { FocalPointPicker } from "@/components/admin/FocalPointPicker";

type Category = { id: string; name: string };
type RelatedOption = { id: string; name: string };
export type ProductImageData = {
  url: string;
  mediaType: "IMAGE" | "VIDEO";
  posterUrl?: string | null;
  focalX: number;
  focalY: number;
};

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
  mainImageFocalX: number;
  mainImageFocalY: number;
  images: ProductImageData[];
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
  mainImageFocalX: 0.5,
  mainImageFocalY: 0.5,
  images: [],
};

type UploadResult = { url: string; mediaType: "image" | "video"; posterUrl?: string };

async function uploadMedia(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/admin/redes/upload", { method: "POST", body: formData });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "No se ha podido subir el archivo");
  return json as UploadResult;
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

  const aiContext = useMemo(
    () => ({
      name: data.name,
      shortDescription: data.shortDescription,
      description: data.description,
      materials: data.materials,
      categories: categories.filter((c) => data.categoryIds.includes(c.id)).map((c) => c.name),
      price: data.price,
      priceType: data.priceType,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
    }),
    [data.name, data.shortDescription, data.description, data.materials, data.categoryIds, data.price, data.priceType, data.metaTitle, data.metaDescription, categories]
  );

  const sideSummary = useMemo(() => {
    const pubLabel = { PUBLICADO: "Publicado", BORRADOR: "Borrador", ARCHIVADO: "Archivado" }[data.publicationStatus];
    const catLabel = categories.filter((c) => data.categoryIds.includes(c.id)).map((c) => c.name).join(", ") || "sin categoría";
    return `${pubLabel} · ${data.priceType === "STOCK" ? "stock" : "personalizado"} · ${catLabel}`;
  }, [data.publicationStatus, data.priceType, data.categoryIds, categories]);

  async function onMainImagePick(file: File) {
    setUploadingMain(true);
    setError("");
    try {
      const { url } = await uploadMedia(file);
      set("mainImage", url);
    } catch {
      setError("No se ha podido subir la foto de portada.");
    } finally {
      setUploadingMain(false);
      if (mainInputRef.current) mainInputRef.current.value = "";
    }
  }

  async function onGalleryFilesPick(files: FileList) {
    setUploadingGallery(true);
    setError("");
    try {
      const uploaded = await Promise.all(Array.from(files).map(uploadMedia));
      set("images", [
        ...data.images,
        ...uploaded.map((u) => ({
          url: u.url,
          mediaType: u.mediaType === "video" ? ("VIDEO" as const) : ("IMAGE" as const),
          posterUrl: u.posterUrl,
          focalX: 0.5,
          focalY: 0.5,
        })),
      ]);
    } catch {
      setError("No se ha podido subir alguno de los archivos.");
    } finally {
      setUploadingGallery(false);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  }

  function removeGalleryItem(url: string) {
    set(
      "images",
      data.images.filter((i) => i.url !== url)
    );
  }

  function setGalleryFocal(url: string, focalX: number, focalY: number) {
    set(
      "images",
      data.images.map((i) => (i.url === url ? { ...i, focalX, focalY } : i))
    );
  }

  // Swaps a gallery photo with the current cover — nothing is lost, the
  // previous cover just becomes part of the gallery instead.
  function makeMainImage(item: ProductImageData) {
    if (item.mediaType !== "IMAGE") return;
    const rest = data.images.filter((i) => i.url !== item.url);
    setData((d) => ({
      ...d,
      mainImage: item.url,
      mainImageFocalX: item.focalX,
      mainImageFocalY: item.focalY,
      images: d.mainImage
        ? [{ url: d.mainImage, mediaType: "IMAGE", focalX: d.mainImageFocalX, focalY: d.mainImageFocalY }, ...rest]
        : rest,
    }));
  }

  function moveGalleryItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= data.images.length) return;
    const next = [...data.images];
    [next[index], next[target]] = [next[target], next[index]];
    set("images", next);
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
                <span className="font-mono text-xs text-admin-faint">mundolana.es/producto/</span>
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
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-admin-ink/85">Descripción corta</span>
                <AiGenerateButton field="shortDescription" context={aiContext} onGenerated={(text) => set("shortDescription", text)} />
              </div>
              <input
                value={data.shortDescription}
                onChange={(e) => set("shortDescription", e.target.value)}
                placeholder="Una línea que aparece en las tarjetas del catálogo"
                className="rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-2.5 text-sm outline-none"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-admin-ink/85">Descripción</span>
                <AiGenerateButton field="description" context={aiContext} onGenerated={(text) => set("description", text)} />
              </div>
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
            <span className="font-serif text-base font-medium">Fotos y vídeos</span>

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
            {data.mainImage ? (
              <FocalPointPicker
                src={data.mainImage}
                focalX={data.mainImageFocalX}
                focalY={data.mainImageFocalY}
                onChange={(x, y) => {
                  set("mainImageFocalX", x);
                  set("mainImageFocalY", y);
                }}
                className="aspect-[4/5] max-h-80"
              />
            ) : (
              <button
                type="button"
                onClick={() => mainInputRef.current?.click()}
                disabled={uploadingMain}
                className="aspect-[4/5] max-h-80 rounded-lg bg-cover bg-center disabled:opacity-60"
                style={{ background: "repeating-linear-gradient(45deg,#EDEBE8 0 9px,#F7F6F4 9px 18px)" }}
              >
                <span className="text-sm text-admin-ink-soft">{uploadingMain ? "Subiendo…" : "+ Foto de portada"}</span>
              </button>
            )}
            {data.mainImage && (
              <button
                type="button"
                onClick={() => mainInputRef.current?.click()}
                disabled={uploadingMain}
                className="self-start text-xs font-medium text-admin-ink/70 underline disabled:opacity-60"
              >
                {uploadingMain ? "Subiendo…" : "Cambiar foto de portada"}
              </button>
            )}

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) onGalleryFilesPick(e.target.files);
              }}
            />
            <div className="grid grid-cols-3 gap-3">
              {data.images.map((item, index) => (
                <div key={item.url} className="group relative flex flex-col gap-1">
                  <FocalPointPicker
                    src={item.mediaType === "VIDEO" ? item.posterUrl ?? item.url : item.url}
                    focalX={item.focalX}
                    focalY={item.focalY}
                    onChange={(x, y) => setGalleryFocal(item.url, x, y)}
                    className="h-20"
                    hint={false}
                  />
                  {item.mediaType === "VIDEO" && (
                    <span className="pointer-events-none absolute left-1 top-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-white">
                      Vídeo
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeGalleryItem(item.url)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-xs text-white opacity-0 group-hover:opacity-100"
                  >
                    ×
                  </button>
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex gap-0.5">
                      <button
                        type="button"
                        onClick={() => moveGalleryItem(index, -1)}
                        disabled={index === 0}
                        className="flex h-5 w-5 items-center justify-center rounded border border-admin-ink/14 text-[10px] disabled:opacity-30"
                        title="Mover antes"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={() => moveGalleryItem(index, 1)}
                        disabled={index === data.images.length - 1}
                        className="flex h-5 w-5 items-center justify-center rounded border border-admin-ink/14 text-[10px] disabled:opacity-30"
                        title="Mover después"
                      >
                        ›
                      </button>
                    </div>
                    {item.mediaType === "IMAGE" && (
                      <button
                        type="button"
                        onClick={() => makeMainImage(item)}
                        className="text-[10px] font-medium text-admin-link underline"
                      >
                        Hacer portada
                      </button>
                    )}
                  </div>
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
            <span className="text-xs text-admin-faint">
              La foto de portada es la que se ve en el catálogo — pulsa &ldquo;Hacer portada&rdquo; en cualquier foto de la
              galería para cambiarla. El orden aquí es el orden en la ficha; fotos y vídeos se agrupan solos en pestañas.
            </span>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-admin-ink/10 bg-white p-6">
            <span className="font-serif text-base font-medium">SEO</span>
            <label className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-admin-ink/85">Meta título</span>
                <AiGenerateButton field="productMetaTitle" context={aiContext} onGenerated={(text) => set("metaTitle", text)} />
              </div>
              <input
                value={data.metaTitle}
                onChange={(e) => set("metaTitle", e.target.value)}
                placeholder="Osito Lucas · amigurumi de algodón hecho a mano"
                className="rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-2.5 text-sm outline-none"
              />
              <span className="text-xs text-admin-faint">Recomendado: hasta 60 caracteres.</span>
            </label>
            <label className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-admin-ink/85">Meta descripción</span>
                <AiGenerateButton field="productMetaDescription" context={aiContext} onGenerated={(text) => set("metaDescription", text)} />
              </div>
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
                placeholder="tiktok.com/@mundolana/video/…"
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
