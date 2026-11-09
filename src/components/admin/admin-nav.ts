/**
 * Admin sections grouped by what the owner is doing: answering customers,
 * running the shop, changing the website, or settings. Same list feeds the
 * desktop sidebar and the mobile "Más" page.
 */
export type NavIcon = "home" | "orders" | "messages" | "products" | "categories" | "brands" | "photos" | "pages" | "dates" | "social" | "settings" | "newsletter" | "legal" | "profile" | "ideas" | "assistant";
export type NavItem = { href: string; label: string; hint: string; icon: NavIcon; badge?: "orders" | "messages" | "asistente" };

export const NAV_GROUPS: { title: string | null; items: NavItem[] }[] = [
  { title: null, items: [{ href: "/admin", label: "Inicio", hint: "Resumen del día", icon: "home" }] },
  {
    title: "Clientes",
    items: [
      { href: "/admin/pedidos", label: "Pedidos", hint: "Encargos y reservas", icon: "orders", badge: "orders" },
      { href: "/admin/mensajes", label: "Mensajes", hint: "Lo que te escriben", icon: "messages", badge: "messages" },
    ],
  },
  {
    title: "Tienda",
    items: [
      { href: "/admin/productos", label: "Productos", hint: "Piezas, fotos y precios", icon: "products" },
      { href: "/admin/categorias", label: "Categorías", hint: "Grupos de la tienda", icon: "categories" },
      { href: "/admin/marcas", label: "Personajes", hint: "Pokémon, Disney…", icon: "brands" },
      { href: "/admin/fotos", label: "Fotos de Instagram", hint: "Para crear productos", icon: "photos" },
    ],
  },
  {
    title: "Web",
    items: [
      { href: "/admin/imagenes-web", label: "Páginas de la web", hint: "Textos y fotos de cada página", icon: "pages" },
      { href: "/admin/fechas", label: "Fechas especiales", hint: "Navidad, San Valentín… con banner", icon: "dates" },
      { href: "/admin/redes", label: "Redes sociales", hint: "Preparar posts", icon: "social" },
    ],
  },
  {
    title: "Ajustes",
    items: [
      { href: "/admin/ajustes", label: "Configuración", hint: "Contacto, preguntas, Google", icon: "settings" },
      { href: "/admin/newsletter", label: "Newsletter", hint: "Suscriptoras", icon: "newsletter" },
      { href: "/admin/legal", label: "Textos legales", hint: "Aviso, privacidad, cookies", icon: "legal" },
      { href: "/admin/perfil", label: "Mi perfil", hint: "Nombre y contraseña", icon: "profile" },
    ],
  },
];

// The assistant (agente.sergiolab.es): she asks for changes to the web or this panel and they get done. Replaced «Ideas».
export const ASISTENTE: NavItem = { href: "/admin/asistente", label: "Asistente", hint: "Pide cambios en la web", icon: "assistant", badge: "asistente" };

/** Bottom tabs on phones; everything else lives under "Más". */
export const MOBILE_TABS = ["/admin", "/admin/pedidos", "/admin/mensajes", "/admin/productos"];

export const ALL_ITEMS = [...NAV_GROUPS.flatMap((g) => g.items), ASISTENTE];
