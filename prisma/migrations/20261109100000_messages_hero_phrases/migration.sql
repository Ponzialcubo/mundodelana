-- Contact messages linked to customer accounts, with the owner's reply.
ALTER TABLE "ContactMessage" ADD COLUMN "customerId" TEXT,
  ADD COLUMN "readAt" TIMESTAMP(3),
  ADD COLUMN "reply" TEXT,
  ADD COLUMN "repliedAt" TIMESTAMP(3),
  ADD COLUMN "replySeenAt" TIMESTAMP(3);
CREATE INDEX "ContactMessage_customerId_idx" ON "ContactMessage"("customerId");
ALTER TABLE "ContactMessage" ADD CONSTRAINT "ContactMessage_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Rotating words of the home banner.
ALTER TABLE "SiteSettings" ADD COLUMN "heroPhrases" TEXT[] DEFAULT ARRAY['pensado para ti', 'para regalar', 'con mucho cariño', 'a tu medida', 'en Galicia']::TEXT[];
