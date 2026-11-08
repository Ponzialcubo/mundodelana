-- Photo/video library imported from Instagram
CREATE TYPE "LibraryStatus" AS ENUM ('NUEVA', 'USADA', 'DESCARTADA');

CREATE TABLE "LibraryMedia" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'instagram',
    "instagramMediaId" TEXT,
    "instagramPostId" TEXT,
    "permalink" TEXT,
    "caption" TEXT,
    "takenAt" TIMESTAMP(3),
    "url" TEXT NOT NULL,
    "mediaType" "MediaType" NOT NULL DEFAULT 'IMAGE',
    "posterUrl" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "status" "LibraryStatus" NOT NULL DEFAULT 'NUEVA',
    "showInGallery" BOOLEAN NOT NULL DEFAULT false,
    "galleryTitle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LibraryMedia_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LibraryMedia_instagramMediaId_key" ON "LibraryMedia"("instagramMediaId");
CREATE INDEX "LibraryMedia_instagramPostId_idx" ON "LibraryMedia"("instagramPostId");
CREATE INDEX "LibraryMedia_status_idx" ON "LibraryMedia"("status");
