-- Vertical banner for phones, next to the wide one.
ALTER TABLE "Campaign" ADD COLUMN "bannerImageMobile" TEXT,
  ADD COLUMN "bannerMobileFocalX" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
  ADD COLUMN "bannerMobileFocalY" DOUBLE PRECISION NOT NULL DEFAULT 0.5;
