-- Images for fixed spots of the public site
CREATE TABLE "SiteImage" (
    "key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "focalX" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "focalY" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SiteImage_pkey" PRIMARY KEY ("key")
);

-- Yearly special dates (campaigns)
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "startMD" TEXT NOT NULL,
    "endMD" TEXT NOT NULL,
    "deadlineMD" TEXT,
    "bannerTitle" TEXT NOT NULL,
    "bannerText" TEXT NOT NULL,
    "bannerImage" TEXT,
    "bannerFocalX" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "bannerFocalY" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "accent" TEXT NOT NULL DEFAULT '#E8B4B8',
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Campaign_slug_key" ON "Campaign"("slug");

CREATE TABLE "_CampaignToProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CampaignToProduct_AB_pkey" PRIMARY KEY ("A","B")
);
CREATE INDEX "_CampaignToProduct_B_index" ON "_CampaignToProduct"("B");
ALTER TABLE "_CampaignToProduct" ADD CONSTRAINT "_CampaignToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_CampaignToProduct" ADD CONSTRAINT "_CampaignToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Default yearly dates (editable from the admin)
INSERT INTO "Campaign" ("id","slug","name","order","startMD","endMD","deadlineMD","bannerTitle","bannerText","accent","metaDescription","updatedAt") VALUES
('camp_san_valentin','san-valentin','San Valentín',1,'01-20','02-14','02-05','San Valentín tejido a mano','Corazones, rosas que no se marchitan y detalles personalizados para regalar algo que dure para siempre.','#D98A8A','Regalos de San Valentín de crochet hechos a mano: corazones, rosas y detalles personalizados. Envíos a toda España.',CURRENT_TIMESTAMP),
('camp_dia_del_padre','dia-del-padre','Día del Padre',2,'03-01','03-19','03-10','Para el mejor papá','Llaveros, muñecos personalizados y detalles hechos a mano para el 19 de marzo.','#8FA3B0','Regalos para el Día del Padre tejidos a mano: llaveros, muñecos personalizados y detalles de crochet.',CURRENT_TIMESTAMP),
('camp_dia_de_la_madre','dia-de-la-madre','Día de la Madre',3,'04-10','05-03','04-24','Un regalo tejido para mamá','Flores que no se marchitan, complementos y detalles hechos a mano con todo el cariño.','#C9A7D8','Regalos para el Día de la Madre de crochet: flores que no se marchitan, pendientes y detalles hechos a mano.',CURRENT_TIMESTAMP),
('camp_halloween','halloween','Samaín y Halloween',4,'10-01','10-31','10-20','Samaín y Halloween','Calabazas, disfraces y decoración tejida para la noche más divertida del año.','#D9A566','Decoración y disfraces de crochet para Samaín y Halloween, tejidos a mano en Galicia.',CURRENT_TIMESTAMP),
('camp_navidad','navidad','Navidad',5,'11-01','01-06','12-12','Navidad hecha a mano','Adornos, belenes y regalos de crochet para decorar la casa y sorprender a los tuyos.','#9CAF88','Adornos, belenes y regalos de Navidad de crochet tejidos a mano. Envíos a toda España.',CURRENT_TIMESTAMP);
