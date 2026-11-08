"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/slugify";
import { AiGenerateButton } from "@/components/admin/AiGenerateButton";
import { FocalPointEditor } from "@/components/admin/FocalPointEditor";

type Category = { id: string; name: string };
type Brand = { id: string; name: string };
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
  brandIds: string[];
  relatedIds: string[];
  mainImage: string;
  mainImageFocalX: number;
  mainImageFocalY: number;
  images: ProductImageData[];
};

// The form edits everything except media through this shape; media lives in a
// single ordered list (see `media` state) and is split back into
// mainImage + images only when saving.
type FormFields = Omit<ProductFormData, "mainImage" | "mainImageFocalX" | "mainImageFocalY" | "images">;

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
  brandIds: [],
  relatedIds: [],
  mainImage: "",
  mainImageFocalX: 0.5,
  mainImageFocalY: 0.5,
  images: [],
};

const PIECE_STATUS_OPTIONS: { value: ProductFormData["pieceStatus"]; label: string }[] = [
  { value: "DISPONIBLE", label: "Disponible" },
  { value: "TRABAJANDO_EN_ELLO", label: "Trabajando en ello" },
  { value: "RESERVADO", label: "Reservado" },
  { value: "VENDIDO", label: "Vendido" },
  { value: "VENDIDO_POR_ENCARGO", label: "Vendido por encargo" },
];

const INPUT = "rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-2.5 text-sm outline-none";
const CARD = "flex flex-col gap-4 rounded-xl border border-admin-ink/10 bg-white p-5 md:p-6";
const LABEL = "text-[13px] font-medium text-admin-ink/85";

type UploadResult = { url: string; mediaType: "image" | "video"; posterUrl?: string };

async function uploadMedia(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/admin/redes/upload", { method: "POST", body: formData });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "No se ha podido subir el archivo");
  return json as UploadResult;
}

function toMediaList(data: ProductFormData): ProductImageData[] {
  const cover: ProductImageData[] = data.mainImage
    ? [{ url: data.mainImage, mediaType: "IMAGE", focalX: data.mainImageFocalX, focalY: data.mainImageFocalY }]
    : [];
  return [...cover, ...data.images];
}

function Chips<T extends { id: string; name: string }>({
  options,
  selected,
  onToggle,
}: {
  options: T[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = selected.includes(o.id);
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onToggle(o.id)}
            className="rounded-full px-3 py-1.5 text-[13px]"
            style={on ? { background: "#1F1B1A", color: "#F7F6F4" } : { background: "#fff", border: "1px solid rgba(31,27,26,.14)" }}
          >
            {on ? "✓ " : ""}
            {o.name}
          </button>
        );
      })}
    </div>
  );
}

export function ProductEditorForm({
  initial,
  categories,
  brands,
  relatedOptions,
}: {
  initial?: ProductFormData;
  categories: Category[];
  brands: Brand[];
  relatedOptions: RelatedOption[];
}) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [data, setData] = useState<FormFields>(() => {
    const { mainImage, mainImageFocalX, mainImageFocalY, images, ...fields } = initial ?? EMPTY;
    void [mainImage, mainImageFocalX, mainImageFocalY, images]; // media is held in `media` state instead
    return fields;
  });
  const [media, setMedia] = useState<ProductImageData[]>(() => toMediaList(initial ?? EMPTY));
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [autofilling, setAutofilling] = useState(false);
  const [framing, setFraming] = useState<string | null>(null); // url of the photo being framed
  const fileInputRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof FormFields>(key: K, value: FormFields[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function toggle(key: "categoryIds" | "brandIds" | "relatedIds", id: string) {
    setData((d) => ({ ...d, [key]: d[key].includes(id) ? d[key].filter((x) => x !== id) : [...d[key], id] }));
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
      brands: brands.filter((b) => data.brandIds.includes(b.id)).map((b) => b.name),
      price: data.price,
      priceType: data.priceType,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
    }),
    [data.name, data.shortDescription, data.description, data.materials, data.categoryIds, data.brandIds, data.price, data.priceType, data.metaTitle, data.metaDescription, categories, brands]
  );

  // Uploads one file at a time: each one is re-encoded server side (sharp /
  // ffmpeg), and doing several in parallel spikes the VPS memory.
  async function onFilesPick(files: FileList) {
    const list = Array.from(files);
    setError("");
    setUploadProgress({ done: 0, total: list.length });
    let failed = 0;
    for (const [index, file] of list.entries()) {
      try {
        const u = await uploadMedia(file);
        setMedia((m) => [
          ...m,
          {
            url: u.url,
            mediaType: u.mediaType === "video" ? "VIDEO" : "IMAGE",
            posterUrl: u.posterUrl,
            focalX: 0.5,
            focalY: 0.5,
          },
        ]);
      } catch {
        failed++;
      }
      setUploadProgress({ done: index + 1, total: list.length });
    }
    setUploadProgress(null);
    if (failed) setError(`No se ${failed === 1 ? "ha podido subir 1 archivo" : `han podido subir ${failed} archivos`}.`);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeMedia(url: string) {
    setMedia((m) => m.filter((i) => i.url !== url));
  }

  function setFocal(url: string, focalX: number, focalY: number) {
    setMedia((m) => m.map((i) => (i.url === url ? { ...i, focalX, focalY } : i)));
  }

  function moveMedia(index: number, target: number) {
    if (target < 0 || target >= media.length) return;
    setMedia((m) => {
      const next = [...m];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  }

  // Asks the AI to write the sheet from the photos. Only empty fields are
  // filled, so nothing the owner already typed is overwritten.
  async function autofill() {
    setAutofilling(true);
    setError("");
    try {
      const res = await fetch("/api/admin/productos/autorrellenar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrls: media.filter((m) => m.mediaType === "IMAGE").map((m) => m.url) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData((d) => {
        const name = d.name || json.name;
        return {
          ...d,
          name,
          slug: slugTouched || d.slug ? d.slug : slugify(name),
          shortDescription: d.shortDescription || json.shortDescription,
          description: d.description || json.description,
          materials: d.materials || json.materials,
          metaTitle: d.metaTitle || json.metaTitle,
          metaDescription: d.metaDescription || json.metaDescription,
          categoryIds: d.categoryIds.length ? d.categoryIds : json.categoryIds,
        };
      });
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "No se ha podido rellenar con IA.");
    } finally {
      setAutofilling(false);
    }
  }

  // The cover is the first photo in the list (videos can't be a cover).
  const coverIndex = media.findIndex((i) => i.mediaType === "IMAGE");

  async function save(publicationStatus?: ProductFormData["publicationStatus"]) {
    if (!data.name.trim()) {
      setError("Ponle un nombre al producto antes de guardar.");
      return;
    }
    setLoading(true);
    setError("");
    const cover = coverIndex >= 0 ? media[coverIndex] : null;
    const payload: ProductFormData = {
      ...data,
      publicationStatus: publicationStatus ?? data.publicationStatus,
      mainImage: cover?.url ?? "",
      mainImageFocalX: cover?.focalX ?? 0.5,
      mainImageFocalY: cover?.focalY ?? 0.5,
      images: media.filter((_, i) => i !== coverIndex),
    };
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

  const uploading = uploadProgress !== null;
  const saveButtons = (
    <>
      <button
        type="button"
        onClick={() => save("BORRADOR")}
        disabled={loading || uploading || autofilling}
        className="flex-1 rounded-full border border-admin-ink/16 bg-white px-4 py-2.5 text-sm font-medium disabled:opacity-60 md:flex-none"
      >
        Guardar borrador
      </button>
      <button
        type="button"
        onClick={() => save("PUBLICADO")}
        disabled={loading || uploading || autofilling}
        className="flex-1 rounded-full bg-pink px-4 py-2.5 text-sm font-medium disabled:opacity-60 md:flex-none"
      >
        {loading ? "Guardando…" : data.publicationStatus === "PUBLICADO" ? "Guardar y publicar" : "Publicar"}
      </button>
    </>
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 p-5 md:p-9">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col">
          <h1 className="font-serif text-2xl font-normal">{isEdit ? "Editar producto" : "Nuevo producto"}</h1>
          {isEdit && (
            <span className="text-xs text-admin-ink-soft">
              {{ PUBLICADO: "Publicado en la tienda", BORRADOR: "Borrador · no se ve en la tienda", ARCHIVADO: "Archivado" }[data.publicationStatus]}
            </span>
          )}
        </div>
        <div className="hidden gap-2.5 md:flex">{saveButtons}</div>
      </div>

      {error && <p className="rounded-lg bg-admin-accent-soft px-4 py-3 text-sm text-admin-danger">{error}</p>}

      {/* 1. Photos */}
      <div className={CARD}>
        <div className="flex flex-col gap-0.5">
          <span className="font-serif text-base font-medium">Fotos y vídeos</span>
          <span className="text-xs text-admin-faint">
            La primera foto es la portada del catálogo. Toca una foto para ajustar qué parte se ve en la tienda.
          </span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) onFilesPick(e.target.files);
          }}
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {media.map((item, index) => (
            <div key={item.url} className="relative flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => setFraming(item.url)}
                className="relative aspect-[4/5] overflow-hidden rounded-lg bg-admin-bg"
                aria-label="Ajustar encuadre"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- admin preview with the shop's exact crop */}
                <img
                  src={item.mediaType === "VIDEO" ? item.posterUrl ?? item.url : item.url}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{ objectPosition: `${item.focalX * 100}% ${item.focalY * 100}%` }}
                />
                {item.mediaType === "IMAGE" && (
                  <span className="absolute bottom-1.5 left-1.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-admin-ink">
                    Encuadre
                  </span>
                )}
              </button>
              {index === coverIndex && (
                <span className="pointer-events-none absolute left-1.5 top-1.5 rounded-full bg-pink px-2 py-0.5 text-[10px] font-medium text-admin-ink">
                  Portada
                </span>
              )}
              {item.mediaType === "VIDEO" && (
                <span className="pointer-events-none absolute left-1.5 top-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
                  Vídeo
                </span>
              )}
              <button
                type="button"
                onClick={() => removeMedia(item.url)}
                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-sm text-white"
                aria-label="Quitar"
              >
                ×
              </button>
              <div className="flex items-center justify-between gap-1">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveMedia(index, index - 1)}
                    disabled={index === 0}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-admin-ink/14 text-sm disabled:opacity-30"
                    aria-label="Mover antes"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => moveMedia(index, index + 1)}
                    disabled={index === media.length - 1}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-admin-ink/14 text-sm disabled:opacity-30"
                    aria-label="Mover después"
                  >
                    ›
                  </button>
                </div>
                {item.mediaType === "IMAGE" && index !== coverIndex && (
                  <button
                    type="button"
                    onClick={() => moveMedia(index, 0)}
                    className="text-[11px] font-medium text-admin-link underline"
                  >
                    Hacer portada
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-[4/5] flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-admin-ink/25 text-sm text-admin-ink-soft disabled:opacity-60"
          >
            {uploading ? (
              <span>
                Subiendo {Math.min(uploadProgress.done + 1, uploadProgress.total)} de {uploadProgress.total}…
              </span>
            ) : (
              <>
                <span className="text-2xl leading-none">+</span>
                <span>{media.length ? "Añadir más" : "Añadir fotos"}</span>
              </>
            )}
          </button>
        </div>

        {media.some((m) => m.mediaType === "IMAGE") && (
          <button
            type="button"
            onClick={autofill}
            disabled={autofilling || uploading}
            className="flex items-center justify-center gap-2 rounded-lg border border-pink/50 bg-admin-accent-soft px-4 py-3 text-sm font-medium disabled:opacity-60"
          >
            {autofilling ? "Mirando las fotos…" : "✨ Rellenar la ficha a partir de las fotos"}
          </button>
        )}
      </div>

      {/* 2. Basics */}
      <div className={CARD}>
        <label className="flex flex-col gap-1.5">
          <span className={LABEL}>Nombre</span>
          <input
            value={data.name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Osito Lucas"
            className={INPUT}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className={LABEL}>Frase corta</span>
            <AiGenerateButton field="shortDescription" context={aiContext} onGenerated={(text) => set("shortDescription", text)} />
          </div>
          <input
            value={data.shortDescription}
            onChange={(e) => set("shortDescription", e.target.value)}
            placeholder="Una línea que aparece debajo de la foto en el catálogo"
            className={INPUT}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className={LABEL}>Descripción</span>
            <AiGenerateButton field="description" context={aiContext} onGenerated={(text) => set("description", text)} />
          </div>
          <textarea
            value={data.description}
            onChange={(e) => set("description", e.target.value)}
            rows={5}
            placeholder="Cuéntale a la clienta cómo es la pieza: tamaño, detalles, para quién es ideal…"
            className={INPUT}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={LABEL}>Materiales</span>
          <textarea
            value={data.materials}
            onChange={(e) => set("materials", e.target.value)}
            rows={3}
            placeholder={"Un material por línea:\nAlgodón 100 %\nRelleno antialérgico"}
            className={INPUT}
          />
        </label>
      </div>

      {/* 3. Price */}
      <div className={CARD}>
        <span className="font-serif text-base font-medium">Precio</span>
        <div className="flex rounded-full bg-admin-bg p-1">
          {(
            [
              ["STOCK", "Pieza hecha"],
              ["PERSONALIZADO", "Por encargo"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => set("priceType", value)}
              className="flex-1 rounded-full py-2 text-sm font-medium"
              style={data.priceType === value ? { background: "#fff" } : {}}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-2.5">
            <input
              type="number"
              inputMode="decimal"
              value={data.price}
              onChange={(e) => set("price", e.target.value)}
              placeholder="0"
              className="flex-1 bg-transparent text-sm outline-none"
            />
            <span className="text-sm text-admin-faint">€</span>
          </div>
          <span className="text-xs text-admin-faint">
            {data.priceType === "PERSONALIZADO"
              ? `Se hace a medida. En la tienda aparece como «desde ${data.price || "…"} €».`
              : "Ya está hecha y lista para enviar. Precio cerrado."}
          </span>
        </label>
      </div>

      {/* 4. Category + status */}
      <div className={CARD}>
        <div className="flex flex-col gap-2">
          <span className="font-serif text-base font-medium">Categoría</span>
          <Chips options={categories} selected={data.categoryIds} onToggle={(id) => toggle("categoryIds", id)} />
          {data.categoryIds.length === 0 && (
            <span className="text-xs text-admin-faint">Sin categoría no aparecerá en los filtros del catálogo.</span>
          )}
        </div>
        <label className="flex flex-col gap-1.5">
          <span className={LABEL}>¿Cómo está la pieza?</span>
          <select
            value={data.pieceStatus}
            onChange={(e) => set("pieceStatus", e.target.value as ProductFormData["pieceStatus"])}
            className={INPUT}
          >
            {PIECE_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2.5 text-sm text-admin-ink/85">
          <input
            type="checkbox"
            checked={data.featured}
            onChange={(e) => set("featured", e.target.checked)}
            className="h-4 w-4 accent-pink"
          />
          Destacar en la portada de la tienda
        </label>
      </div>

      {/* 5. Advanced: everything here has a sensible automatic default */}
      <details className="group rounded-xl border border-admin-ink/10 bg-white">
        <summary className="flex cursor-pointer list-none items-center justify-between p-5 md:p-6">
          <span className="flex flex-col">
            <span className="font-serif text-base font-medium">Opciones avanzadas</span>
            <span className="text-xs text-admin-faint">Marca, enlace, Google, relacionados y redes. Opcional.</span>
          </span>
          <span className="text-admin-ink-soft transition group-open:rotate-90">›</span>
        </summary>

        <div className="flex flex-col gap-6 border-t border-admin-ink/8 p-5 md:p-6">
          <div className="flex flex-col gap-2">
            <span className={LABEL}>Marca o colección</span>
            {brands.length ? (
              <Chips options={brands} selected={data.brandIds} onToggle={(id) => toggle("brandIds", id)} />
            ) : (
              <span className="text-xs text-admin-faint">No hay marcas creadas (Más → Marcas).</span>
            )}
          </div>

          <label className="flex flex-col gap-1.5">
            <span className={LABEL}>Dirección de la página</span>
            <div className="flex items-center gap-1 rounded-lg border border-admin-ink/14 bg-admin-bg px-4 py-2.5">
              <span className="font-mono text-xs text-admin-faint">mundolana.es/producto/</span>
              <input
                value={data.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", e.target.value);
                }}
                className="min-w-0 flex-1 bg-transparent font-mono text-xs outline-none"
              />
            </div>
            <span className="text-xs text-admin-faint">
              {slugTouched ? "Editada a mano." : "Se crea sola a partir del nombre."}
            </span>
          </label>

          <div className="flex flex-col gap-4">
            <span className={LABEL}>Cómo aparece en Google</span>
            <label className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-admin-ink-soft">Título (hasta 60 caracteres)</span>
                <AiGenerateButton field="productMetaTitle" context={aiContext} onGenerated={(text) => set("metaTitle", text)} />
              </div>
              <input
                value={data.metaTitle}
                onChange={(e) => set("metaTitle", e.target.value)}
                placeholder="Si lo dejas vacío se usa el nombre del producto"
                className={INPUT}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-admin-ink-soft">Descripción (hasta 155 caracteres)</span>
                <AiGenerateButton field="productMetaDescription" context={aiContext} onGenerated={(text) => set("metaDescription", text)} />
              </div>
              <textarea
                value={data.metaDescription}
                onChange={(e) => set("metaDescription", e.target.value)}
                rows={3}
                placeholder="Si lo dejas vacío se usa la frase corta"
                className={INPUT}
              />
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <span className={LABEL}>También te puede gustar</span>
            <Chips options={relatedOptions} selected={data.relatedIds} onToggle={(id) => toggle("relatedIds", id)} />
            <span className="text-xs text-admin-faint">Piezas que se muestran al final de la ficha.</span>
          </div>

          <div className="flex flex-col gap-3">
            <span className={LABEL}>Esta pieza en redes</span>
            <input
              value={data.instagramUrl}
              onChange={(e) => set("instagramUrl", e.target.value)}
              placeholder="Enlace del post de Instagram"
              className={INPUT}
            />
            <input
              value={data.tiktokUrl}
              onChange={(e) => set("tiktokUrl", e.target.value)}
              placeholder="Enlace del vídeo de TikTok"
              className={INPUT}
            />
          </div>

          {isEdit && data.publicationStatus !== "ARCHIVADO" && (
            <button
              type="button"
              onClick={() => save("ARCHIVADO")}
              disabled={loading || uploading}
              className="self-start text-sm font-medium text-admin-danger disabled:opacity-60"
            >
              Archivar producto (deja de verse en la tienda)
            </button>
          )}
        </div>
      </details>

      {framing && (() => {
        const item = media.find((m) => m.url === framing);
        if (!item || item.mediaType !== "IMAGE") return null;
        return (
          <FocalPointEditor
            src={item.url}
            focalX={item.focalX}
            focalY={item.focalY}
            onChange={(x, y) => setFocal(item.url, x, y)}
            onClose={() => setFraming(null)}
          />
        );
      })()}

      {/* Mobile sticky save bar, above the bottom tabs */}
      <div className="fixed inset-x-0 bottom-[calc(57px+env(safe-area-inset-bottom))] z-20 flex gap-2.5 border-t border-admin-ink/10 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        {saveButtons}
      </div>
      <div className="h-16 md:hidden" />
    </div>
  );
}
