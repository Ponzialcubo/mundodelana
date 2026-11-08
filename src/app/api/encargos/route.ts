import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/session";
import { UPLOADS_DIR } from "@/lib/uploads";
import { randomFilename } from "@/lib/media-processing";

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

async function nextRef(prefix: "ENC" | "RES") {
  const year = new Date().getFullYear();
  const count = await prisma.order.count({
    where: { ref: { startsWith: `${prefix}-${year}-` } },
  });
  const n = (count + 1).toString().padStart(3, "0");
  return `${prefix}-${year}-${n}`;
}

/** Reference photo from the public form: shrunk and re-encoded, never cropped. */
async function saveReferencePhoto(file: File): Promise<string> {
  const input = Buffer.from(await file.arrayBuffer());
  const output = await sharp(input)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
  await mkdir(UPLOADS_DIR, { recursive: true });
  const filename = randomFilename("webp");
  await writeFile(path.join(UPLOADS_DIR, filename), output);
  return `/uploads/${filename}`;
}

export async function POST(req: Request) {
  const form = await req.formData();
  const requestText = String(form.get("requestText") ?? "").trim();
  const name = String(form.get("name") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  const productSlug = String(form.get("productSlug") ?? "");
  const photo = form.get("photo");

  if (!requestText || !name || !phone) {
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
  }

  let photoUrl: string | null = null;
  if (photo instanceof File && photo.size > 0) {
    if (!photo.type.startsWith("image/") || photo.size > MAX_PHOTO_BYTES) {
      return NextResponse.json({ error: "La foto debe ser una imagen de hasta 10 MB" }, { status: 400 });
    }
    try {
      photoUrl = await saveReferencePhoto(photo);
    } catch {
      return NextResponse.json({ error: "No se ha podido leer la foto" }, { status: 400 });
    }
  }

  const product = productSlug
    ? await prisma.product.findUnique({ where: { slug: productSlug }, select: { id: true } })
    : null;

  const ref = await nextRef("ENC");

  // Signed-in customers can follow the order from their account.
  const customerId = await getCustomerSession();
  const customer = customerId ? await prisma.customer.findUnique({ where: { id: customerId }, select: { id: true, email: true } }) : null;

  const order = await prisma.order.create({
    data: {
      ref,
      clientName: name,
      clientPhone: phone,
      requestText,
      type: "PERSONALIZADO",
      state: "NUEVO",
      productId: product?.id,
      customerId: customer?.id,
      clientEmail: customer?.email,
      referenceImages: photoUrl ? { create: [{ url: photoUrl }] } : undefined,
    },
  });

  return NextResponse.json({ ok: true, ref: order.ref });
}
