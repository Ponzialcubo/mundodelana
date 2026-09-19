-- Gallery images can now be photos or videos (with an optional poster frame
-- for video thumbnails), needed to group them into Photos/Videos tabs.
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

ALTER TABLE "ProductImage" ADD COLUMN "mediaType" "MediaType" NOT NULL DEFAULT 'IMAGE';
ALTER TABLE "ProductImage" ADD COLUMN "posterUrl" TEXT;
