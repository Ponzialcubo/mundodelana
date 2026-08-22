import "dotenv/config";
import { PrismaClient, PieceStatus, PriceType, PublicationStatus, OrderType, OrderState, SubscriberState } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ---------- Admin ----------
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error(
      "ADMIN_EMAIL y ADMIN_PASSWORD son obligatorias para el seed. Defínelas en .env antes de ejecutar `npm run db:seed`."
    );
  }
  if (adminPassword.length < 12) {
    throw new Error("ADMIN_PASSWORD debe tener al menos 12 caracteres.");
  }
  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      name: "Elvira",
    },
  });

  // ---------- Categorías ----------
  const categoriesData = [
    { name: "Amigurumis", slug: "amigurumis", order: 1, description: "Muñecos y animales, con o sin retrato" },
    { name: "Decoración", slug: "decoracion", order: 2, description: "Tapices, cojines y móviles para pared" },
    { name: "Bebé", slug: "bebe", order: 3, description: "Mantas, patucos y regalos de nacimiento" },
    { name: "Complementos", slug: "complementos", order: 4, description: "Bolsos, gorros y bufandas de temporada" },
    { name: "Plantas decorativas", slug: "plantas-decorativas", order: 5, description: "Plantas de crochet para decorar sin regar" },
    { name: "Packs regalo", slug: "packs-regalo", order: 6, description: "Sets pensados para regalar" },
    { name: "Ropa", slug: "ropa", order: 7, description: "Prendas tejidas a medida" },
    { name: "Temporada", slug: "temporada", order: 8, description: "Piezas de edición limitada" },
  ];

  const categories: Record<string, { id: string }> = {};
  for (const c of categoriesData) {
    categories[c.name] = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  // ---------- Productos ----------
  const productsData = [
    {
      name: "Osito Lucas",
      slug: "osito-lucas",
      cat: "Amigurumis",
      price: 32,
      priceType: PriceType.STOCK,
      pieceStatus: PieceStatus.DISPONIBLE,
      publicationStatus: PublicationStatus.PUBLICADO,
      featured: true,
      likes: 128,
      views: 186,
      shortDescription: "Osito de 28 cm tejido en punto bajo apretado.",
      description:
        "Osito de 28 cm tejido en punto bajo apretado, con articulaciones cosidas para que se siente solo. Se puede tejer en cualquier color y añadir un jersey con iniciales bordadas.",
      materials:
        "Algodón 100 % DMC Baby Cotton\nRelleno antialérgico siliconado\nOjos de seguridad con anclaje interno\nHilo DMC para los detalles bordados\nLavable a mano en frío, seca plano\nApto desde 0 años (sin piezas sueltas)",
    },
    {
      name: "Conejita Nube",
      slug: "conejita-nube",
      cat: "Amigurumis",
      price: 30,
      priceType: PriceType.STOCK,
      pieceStatus: PieceStatus.RESERVADO,
      publicationStatus: PublicationStatus.PUBLICADO,
      featured: false,
      likes: 74,
      views: 112,
      shortDescription: "Conejita suave en algodón crudo.",
      description: "Conejita amigurumi de orejas largas, tejida en algodón crudo con detalles bordados.",
      materials: "Algodón 100 % DMC Baby Cotton\nRelleno antialérgico siliconado\nOjos de seguridad con anclaje interno",
    },
    {
      name: "Zorro Uve",
      slug: "zorro-uve",
      cat: "Amigurumis",
      price: 38,
      priceType: PriceType.PERSONALIZADO,
      pieceStatus: PieceStatus.TRABAJANDO_EN_ELLO,
      publicationStatus: PublicationStatus.BORRADOR,
      featured: false,
      likes: 63,
      views: 40,
      shortDescription: "Zorrito personalizable por colores.",
      description: "Zorro amigurumi personalizable en los colores que prefieras, con cola tupida tejida a mano.",
      materials: "Algodón 100 % DMC Baby Cotton\nRelleno antialérgico siliconado",
    },
    {
      name: "Tapiz Salvia",
      slug: "tapiz-salvia",
      cat: "Decoración",
      price: 54,
      priceType: PriceType.PERSONALIZADO,
      pieceStatus: PieceStatus.VENDIDO_POR_ENCARGO,
      publicationStatus: PublicationStatus.PUBLICADO,
      featured: true,
      likes: 71,
      views: 98,
      shortDescription: "Tapiz de pared en tonos salvia.",
      description: "Tapiz de pared tejido en macramé y crochet combinados, en tonos verdes y crudos.",
      materials: "Algodón de mercería\nVarilla de madera natural",
    },
    {
      name: "Cojín trenzado",
      slug: "cojin-trenzado",
      cat: "Decoración",
      price: 42,
      priceType: PriceType.STOCK,
      pieceStatus: PieceStatus.TRABAJANDO_EN_ELLO,
      publicationStatus: PublicationStatus.PUBLICADO,
      featured: false,
      likes: 38,
      views: 51,
      shortDescription: "Cojín con textura de trenza.",
      description: "Cojín de 40x40 cm con relieve trenzado, funda extraíble y lavable.",
      materials: "Algodón grueso\nRelleno de fibra hueca siliconada",
    },
    {
      name: "Manta nube personalizada",
      slug: "manta-nube",
      cat: "Bebé",
      price: 68,
      priceType: PriceType.PERSONALIZADO,
      pieceStatus: PieceStatus.TRABAJANDO_EN_ELLO,
      publicationStatus: PublicationStatus.PUBLICADO,
      featured: true,
      likes: 96,
      views: 154,
      shortDescription: "Manta de bebé personalizable en colores.",
      description: "Manta nube personalizada para bebé, tejida en algodón suave con iniciales bordadas a elegir.",
      materials: "Algodón 100 % DMC Baby Cotton\nHilo DMC para los detalles bordados\nLavable a mano en frío, seca plano",
    },
    {
      name: "Patucos primera puesta",
      slug: "patucos-primera-puesta",
      cat: "Bebé",
      price: 19,
      priceType: PriceType.STOCK,
      pieceStatus: PieceStatus.VENDIDO,
      publicationStatus: PublicationStatus.ARCHIVADO,
      featured: false,
      likes: 52,
      views: 60,
      shortDescription: "Patucos de primera puesta.",
      description: "Patucos de primera puesta tejidos en algodón suave, con cierre de cordón.",
      materials: "Algodón 100 % DMC Baby Cotton",
    },
    {
      name: "Sonajero de aro",
      slug: "sonajero-de-aro",
      cat: "Bebé",
      price: 18,
      priceType: PriceType.STOCK,
      pieceStatus: PieceStatus.VENDIDO,
      publicationStatus: PublicationStatus.PUBLICADO,
      featured: false,
      likes: 29,
      views: 35,
      shortDescription: "Sonajero en forma de aro.",
      description: "Sonajero de aro de madera forrado en crochet, con cascabel interno certificado.",
      materials: "Algodón 100 % DMC Baby Cotton\nAro de madera natural",
    },
    {
      name: "Bolso de rafia trenzada",
      slug: "bolso-rafia",
      cat: "Complementos",
      price: 45,
      priceType: PriceType.STOCK,
      pieceStatus: PieceStatus.DISPONIBLE,
      publicationStatus: PublicationStatus.PUBLICADO,
      featured: true,
      likes: 54,
      views: 70,
      shortDescription: "Bolso de rafia trenzada a mano.",
      description: "Bolso tejido en rafia trenzada, con asas reforzadas y forro interior de algodón.",
      materials: "Rafia sintética\nForro de algodón",
    },
    {
      name: "Gorro de canalé",
      slug: "gorro-de-canale",
      cat: "Complementos",
      price: 24,
      priceType: PriceType.STOCK,
      pieceStatus: PieceStatus.DISPONIBLE,
      publicationStatus: PublicationStatus.PUBLICADO,
      featured: false,
      likes: 31,
      views: 44,
      shortDescription: "Gorro de punto canalé.",
      description: "Gorro de invierno en punto canalé, con doble grosor para más abrigo.",
      materials: "Lana merino",
    },
    {
      name: "Monstera en maceta",
      slug: "monstera-maceta",
      cat: "Plantas decorativas",
      price: 36,
      priceType: PriceType.PERSONALIZADO,
      pieceStatus: PieceStatus.DISPONIBLE,
      publicationStatus: PublicationStatus.PUBLICADO,
      featured: false,
      likes: 88,
      views: 131,
      shortDescription: "Planta de crochet que no necesita agua.",
      description: "Monstera tejida a mano en maceta de cerámica, ideal para decorar sin mantenimiento.",
      materials: "Algodón de mercería\nAlambre floral para las hojas\nMaceta de cerámica",
    },
    {
      name: "Suculentas (set de 3)",
      slug: "suculentas-set-3",
      cat: "Plantas decorativas",
      price: 28,
      priceType: PriceType.STOCK,
      pieceStatus: PieceStatus.DISPONIBLE,
      publicationStatus: PublicationStatus.PUBLICADO,
      featured: false,
      likes: 45,
      views: 58,
      shortDescription: "Set de 3 suculentas de crochet.",
      description: "Set de 3 suculentas tejidas a mano en macetas de barro mini.",
      materials: "Algodón de mercería\nMacetas de barro",
    },
    {
      name: "Pack nacimiento",
      slug: "pack-nacimiento",
      cat: "Packs regalo",
      price: 84,
      priceType: PriceType.PERSONALIZADO,
      pieceStatus: PieceStatus.TRABAJANDO_EN_ELLO,
      publicationStatus: PublicationStatus.BORRADOR,
      featured: false,
      likes: 60,
      views: 77,
      shortDescription: "Set completo para regalo de nacimiento.",
      description: "Pack de nacimiento con manta, patucos y sonajero a juego, personalizable en colores.",
      materials: "Algodón 100 % DMC Baby Cotton\nRelleno antialérgico siliconado",
    },
    {
      name: "Pack cesta de invierno",
      slug: "pack-cesta-invierno",
      cat: "Packs regalo",
      price: 72,
      priceType: PriceType.STOCK,
      pieceStatus: PieceStatus.VENDIDO,
      publicationStatus: PublicationStatus.PUBLICADO,
      featured: false,
      likes: 22,
      views: 30,
      shortDescription: "Cesta de regalo de temporada.",
      description: "Cesta con gorro, bufanda y manoplas a juego, ideal para regalo de invierno.",
      materials: "Lana merino",
    },
  ];

  const products: Record<string, { id: string }> = {};
  for (const p of productsData) {
    const { cat, ...data } = p;
    products[p.slug] = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...data,
        categories: { connect: [{ id: categories[cat].id }] },
      },
    });
  }

  // Relacionados: cada producto se relaciona con 3 de la misma categoría (o de otras si no hay suficientes)
  for (const p of productsData) {
    const related = productsData.filter((x) => x.cat === p.cat && x.slug !== p.slug).slice(0, 4);
    if (related.length) {
      await prisma.product.update({
        where: { slug: p.slug },
        data: { relatedTo: { connect: related.map((r) => ({ slug: r.slug })) } },
      });
    }
  }

  // ---------- Testimonios ----------
  const testimonials = [
    {
      text: 'Quería un accesorio diferente y le pedí unos pendientes en forma de donut. Son súper originales, no pesan absolutamente nada y el detalle de los colores y el "glaseado" es increíble. Cada vez que me los pongo alguien me pregunta por ellos.',
      author: "Ana G.",
      origin: "Madrid · Pendientes Donut personalizados",
      visible: true,
      order: 1,
    },
    {
      text: "Le encargué un amigurumi de Lucario para un regalo y el resultado me dejó sin palabras. Es un personaje complejo, pero el nivel de detalle y las proporciones son de otro mundo. Una obra de arte en hilo.",
      author: "Carlos M.",
      origin: "Zaragoza · Figura Lucario (amigurumi)",
      visible: true,
      order: 2,
    },
    {
      text: "Me hizo un conjunto de top y falda a medida y me queda como un guante, porque tuvo en cuenta mis medidas al milímetro. El algodón es de primera: ya lo he lavado varias veces y mantiene la forma, la suavidad y el color.",
      author: "Silvia T.",
      origin: "Málaga · Conjunto top y falda a medida",
      visible: true,
      order: 3,
    },
    {
      text: "Repetiré seguro, el acabado es impecable.",
      author: "Elena V.",
      origin: null,
      visible: false,
      order: 4,
    },
  ];
  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }

  // ---------- FAQs ----------
  const faqs = [
    {
      question: "¿Cuánto tarda un encargo personalizado?",
      answer:
        "Entre una y dos semanas, siempre según la dificultad del encargo y la carga de trabajo que tenga en ese momento. Una vez me pongo con tu figura, tardo de 1 a 3 días según lo complicada que sea. Si tienes una fecha límite, dímela al escribirme y te confirmo antes de empezar si llego a tiempo.",
      order: 1,
    },
    {
      question: "¿Qué materiales usáis?",
      answer:
        "En amigurumis, siempre algodón 100 %: trabajo sobre todo con DMC Baby Cotton. A eso se suma relleno antialérgico siliconado, ojos de seguridad con anclaje o broche interno (nunca pegados) e hilo DMC para los detalles bordados. Todo apto para bebés y lavable a mano en frío.",
      order: 2,
    },
    {
      question: "¿Hacéis envíos a toda España?",
      answer:
        "Sí, península, Baleares y Canarias. El envío estándar cuesta 4,50 € y es gratis a partir de 60 €. Sale del taller en 24-72 h desde que la pieza está lista y siempre te paso el número de seguimiento.",
      order: 3,
    },
    {
      question: "¿Puedo cambiar algo del pedido una vez confirmado?",
      answer:
        "Sí, mientras la pieza no esté cosida. Te aviso por WhatsApp en cuanto llegue el punto sin vuelta atrás. Si el cambio afecta al precio (más tamaño, más detalle), te lo digo antes de seguir.",
      order: 4,
    },
    {
      question: "¿Cómo pago?",
      answer:
        "Por Bizum o transferencia bancaria. En encargos de más de 50 € pagas la mitad al empezar y el resto cuando te enseño la pieza terminada. Lo acordado te queda siempre por escrito en el chat.",
      order: 5,
    },
    {
      question: "¿Hacéis devoluciones?",
      answer:
        "No se aceptan devoluciones: cada pieza se teje a mano y es única. Justo por eso validamos colores, tamaño y avance con fotos en cada paso, para que lo que recibas sea lo que esperabas. Si algo llega defectuoso o dañado en el envío, lo reparo o lo rehago sin coste.",
      order: 6,
    },
    {
      question: "¿Puedo pedir algo que no esté en el catálogo?",
      answer:
        "Es la mitad de lo que hago. Mándame una foto de referencia o descríbeme la idea y te digo si es viable, cuánto costaría y cuándo lo tendrías. Presupuestar no cuesta nada.",
      order: 7,
    },
  ];
  for (const f of faqs) {
    await prisma.faq.create({ data: f });
  }

  // ---------- Configuración del sitio ----------
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  // ---------- Pedidos de ejemplo ----------
  const orders = [
    {
      ref: "ENC-2026-084",
      clientName: "María García",
      clientPhone: "600 111 222",
      requestText:
        "Un amigurumi de mi perro, un teckel marrón con collar rojo, de unos 25 cm. Es para el cumpleaños de mi madre, el 14 de octubre. Si se puede, me gustaría que llevara una chapita con su nombre, Nala.",
      type: OrderType.PERSONALIZADO,
      state: OrderState.NUEVO,
      targetDate: new Date("2026-10-14"),
      productSlug: "osito-lucas",
    },
    {
      ref: "ENC-2026-083",
      clientName: "Lucía Ferrer",
      clientPhone: "600 333 444",
      requestText: "Manta nube en azul y crema para regalo de nacimiento.",
      type: OrderType.PERSONALIZADO,
      state: OrderState.NUEVO,
      productSlug: "manta-nube",
    },
    {
      ref: "RES-2026-041",
      clientName: "Ana Ruiz",
      clientPhone: "600 555 666",
      requestText: "Reserva del bolso de rafia trenzada que tenéis publicado.",
      type: OrderType.RESERVA_STOCK,
      state: OrderState.COTIZADO,
      productSlug: "bolso-rafia",
    },
    {
      ref: "ENC-2026-079",
      clientName: "Nuria Peris",
      clientPhone: "600 777 888",
      requestText: "Pack de nacimiento completo en tonos verdes.",
      type: OrderType.PERSONALIZADO,
      state: OrderState.CONFIRMADO,
      productSlug: "pack-nacimiento",
    },
    {
      ref: "RES-2026-038",
      clientName: "Cristina Roca",
      clientPhone: "600 999 000",
      requestText: "Reserva de los patucos de primera puesta.",
      type: OrderType.RESERVA_STOCK,
      state: OrderState.ENVIADO,
      productSlug: "patucos-primera-puesta",
    },
    {
      ref: "ENC-2026-071",
      clientName: "Laura Molina",
      clientPhone: "611 222 333",
      requestText: "Osito con jersey bordado con iniciales L.M.",
      type: OrderType.PERSONALIZADO,
      state: OrderState.ENTREGADO,
      productSlug: "osito-lucas",
    },
    {
      ref: "ENC-2026-068",
      clientName: "Sara Benítez",
      clientPhone: "611 444 555",
      requestText: "Tapiz salvia de 60 cm para el salón.",
      type: OrderType.PERSONALIZADO,
      state: OrderState.CONFIRMADO,
      productSlug: "tapiz-salvia",
    },
    {
      ref: "RES-2026-030",
      clientName: "Elena Vidal",
      clientPhone: "611 666 777",
      requestText: "Reserva de la Conejita Nube.",
      type: OrderType.RESERVA_STOCK,
      state: OrderState.ENTREGADO,
      productSlug: "conejita-nube",
    },
  ];
  for (const o of orders) {
    const { productSlug, ...data } = o;
    await prisma.order.upsert({
      where: { ref: o.ref },
      update: {},
      create: {
        ...data,
        productId: products[productSlug]?.id,
      },
    });
  }

  // ---------- Suscriptores ----------
  const subs = [
    { email: "maria.garcia@correo.com", state: SubscriberState.ACTIVO },
    { email: "lucia.ferrer@correo.com", state: SubscriberState.ACTIVO },
    { email: "ana.ruiz@correo.com", state: SubscriberState.ACTIVO },
    { email: "nuria.peris@correo.com", state: SubscriberState.BAJA },
    { email: "cristina.roca@correo.com", state: SubscriberState.ACTIVO },
    { email: "laura.molina@correo.com", state: SubscriberState.ACTIVO },
    { email: "sara.benitez@correo.com", state: SubscriberState.BAJA },
    { email: "elena.vidal@correo.com", state: SubscriberState.ACTIVO },
  ];
  for (const s of subs) {
    await prisma.subscriber.upsert({ where: { email: s.email }, update: {}, create: s });
  }

  // ---------- Clienta de ejemplo ----------
  const demoCustomer = await prisma.customer.upsert({
    where: { email: "maria@correo.com" },
    update: {},
    create: {
      name: "María García",
      email: "maria@correo.com",
      phone: "600 111 222",
      passwordHash: await bcrypt.hash("mariagarcia", 10),
      newsletterOptIn: true,
    },
  });
  await prisma.order.updateMany({
    where: { ref: { in: ["ENC-2026-084", "ENC-2026-083"] } },
    data: { customerId: demoCustomer.id },
  });

  console.log("Seed completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
