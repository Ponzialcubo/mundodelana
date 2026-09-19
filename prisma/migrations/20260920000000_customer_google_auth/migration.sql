-- Customers can now sign in with Google, which never sets a password of
-- their own, so passwordHash becomes optional. googleId links the Google
-- account to a Customer row (nullable, unique for accounts never linked).
ALTER TABLE "Customer" ALTER COLUMN "passwordHash" DROP NOT NULL;
ALTER TABLE "Customer" ADD COLUMN "googleId" TEXT;
CREATE UNIQUE INDEX "Customer_googleId_key" ON "Customer"("googleId");
