-- Tracks the real Instagram publish result for a SocialPost, so the admin
-- can see whether a prepared post actually went live via the API.
ALTER TABLE "SocialPost" ADD COLUMN "instagramPostId" TEXT;
ALTER TABLE "SocialPost" ADD COLUMN "instagramPermalink" TEXT;
ALTER TABLE "SocialPost" ADD COLUMN "instagramPublishedAt" TIMESTAMP(3);
ALTER TABLE "SocialPost" ADD COLUMN "instagramPublishError" TEXT;
