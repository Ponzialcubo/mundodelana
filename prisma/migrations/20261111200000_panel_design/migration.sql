-- Admin panel design (bottom bar, first screen, home blocks) chosen by the owner. Additive only.
ALTER TABLE "SiteSettings" ADD COLUMN "panelDesign" TEXT NOT NULL DEFAULT '';
