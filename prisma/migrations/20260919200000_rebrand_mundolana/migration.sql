-- Rebrand: Mundodelana -> Mundolana (domain mundodelana.es was taken; real
-- domain is mundolana.es). Only column defaults change here — the existing
-- SiteSettings row was already updated manually with the real production
-- values (phone, email, real Instagram handle).
ALTER TABLE "SiteSettings" ALTER COLUMN "publicEmail" SET DEFAULT 'infomundolana@gmail.com';
ALTER TABLE "SiteSettings" ALTER COLUMN "instagramUrl" SET DEFAULT 'instagram.com/mundodelana16';
ALTER TABLE "SiteSettings" ALTER COLUMN "tiktokUrl" SET DEFAULT '';
ALTER TABLE "SiteSettings" ALTER COLUMN "defaultMetaTitle" SET DEFAULT 'Mundolana · crochet y amigurumis hechos a mano en España';
