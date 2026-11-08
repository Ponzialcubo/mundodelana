-- Instagram publishing from the web: multi-photo posts with status and scheduling.
CREATE TYPE "SocialPostStatus" AS ENUM ('BORRADOR', 'PROGRAMADA', 'PUBLICANDO', 'PUBLICADA', 'ERROR');

ALTER TABLE "SocialPost" DROP CONSTRAINT "SocialPost_productId_fkey";
ALTER TABLE "SocialPost" ALTER COLUMN "productId" DROP NOT NULL;
ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "SocialPost" ADD COLUMN "status" "SocialPostStatus" NOT NULL DEFAULT 'BORRADOR',
  ADD COLUMN "media" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN "hashtags" TEXT;

DROP INDEX IF EXISTS "SocialPost_scheduledFor_idx";
CREATE INDEX "SocialPost_status_scheduledFor_idx" ON "SocialPost"("status", "scheduledFor");

-- Hashtag groups, with a starting set the owner can edit.
CREATE TABLE "HashtagSet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "HashtagSet_pkey" PRIMARY KEY ("id")
);

INSERT INTO "HashtagSet" ("id", "name", "tags", "order") VALUES
  ('hs_marca', 'Marca', '#mundolana #mundolanacrochet #hechoamano #handmade', 1),
  ('hs_crochet', 'Crochet', '#crochet #ganchillo #crochetlove #crocheting #tejidoamano #crochetaddict', 2),
  ('hs_amigurumi', 'Amigurumis', '#amigurumi #amigurumis #amigurumilove #amigurumidoll #crochettoys #muñecosdeganchillo', 3),
  ('hs_bebe', 'Bebé', '#ropadebebe #regalobebe #bebe #reciennacido #crochetbaby #canastilla', 4),
  ('hs_complementos', 'Complementos', '#pendientesdeganchillo #pendienteshechosamano #crochetearrings #llaveros #complementos', 5),
  ('hs_casa', 'Casa y flores', '#floresdeganchillo #crochetflowers #decoracion #decoracionhogar #plantasdeganchillo', 6),
  ('hs_galicia', 'Galicia y España', '#hechoengalicia #galicia #crochetespaña #artesaniaespañola #compralocal', 7),
  ('hs_regalo', 'Regalos', '#regalooriginal #regalohechoamano #regalospersonalizados #ideasderegalo', 8);
