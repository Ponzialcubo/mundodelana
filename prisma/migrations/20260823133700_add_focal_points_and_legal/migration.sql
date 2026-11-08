-- Focal point for cover/main images (used to control crop position instead of a blind center-crop)
ALTER TABLE "Category" ADD COLUMN "coverFocalX" DOUBLE PRECISION NOT NULL DEFAULT 0.5;
ALTER TABLE "Category" ADD COLUMN "coverFocalY" DOUBLE PRECISION NOT NULL DEFAULT 0.5;

ALTER TABLE "Product" ADD COLUMN "mainImageFocalX" DOUBLE PRECISION NOT NULL DEFAULT 0.5;
ALTER TABLE "Product" ADD COLUMN "mainImageFocalY" DOUBLE PRECISION NOT NULL DEFAULT 0.5;

ALTER TABLE "ProductImage" ADD COLUMN "focalX" DOUBLE PRECISION NOT NULL DEFAULT 0.5;
ALTER TABLE "ProductImage" ADD COLUMN "focalY" DOUBLE PRECISION NOT NULL DEFAULT 0.5;

-- Legal pages (aviso legal / privacidad / cookies), editable from the admin
CREATE TABLE "LegalPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalPage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LegalPage_slug_key" ON "LegalPage"("slug");
