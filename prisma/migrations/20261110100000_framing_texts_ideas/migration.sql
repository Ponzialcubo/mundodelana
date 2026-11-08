-- Zoom for every framed image (1 = no zoom).
ALTER TABLE "Product" ADD COLUMN "mainImageZoom" DOUBLE PRECISION NOT NULL DEFAULT 1;
ALTER TABLE "ProductImage" ADD COLUMN "zoom" DOUBLE PRECISION NOT NULL DEFAULT 1;
ALTER TABLE "Category" ADD COLUMN "coverZoom" DOUBLE PRECISION NOT NULL DEFAULT 1;
ALTER TABLE "Campaign" ADD COLUMN "bannerZoom" DOUBLE PRECISION NOT NULL DEFAULT 1,
  ADD COLUMN "bannerMobileZoom" DOUBLE PRECISION NOT NULL DEFAULT 1;

-- Site images: zoom, and home banners prepared ahead (hidden or dated).
ALTER TABLE "SiteImage" ADD COLUMN "zoom" DOUBLE PRECISION NOT NULL DEFAULT 1,
  ADD COLUMN "hidden" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "startsOn" DATE,
  ADD COLUMN "endsOn" DATE;

-- Editable page texts.
CREATE TABLE "SiteText" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SiteText_pkey" PRIMARY KEY ("key")
);

-- Owner's ideas for the developers.
CREATE TYPE "IdeaStatus" AS ENUM ('NUEVA', 'EN_REVISION', 'HECHA', 'DESCARTADA');
CREATE TABLE "Idea" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "area" TEXT NOT NULL DEFAULT 'web',
    "status" "IdeaStatus" NOT NULL DEFAULT 'NUEVA',
    "reply" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Idea_pkey" PRIMARY KEY ("id")
);
