// Day-to-day sections: always visible (sidebar on desktop, bottom tabs on mobile).
export const MAIN = [
  { href: "/admin", label: "Inicio" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/mensajes", label: "Mensajes" },
  { href: "/admin/productos", label: "Productos" },
];

// Occasional sections: grouped under "Más" so the owner isn't faced with ten options.
export const MORE = [
  { href: "/admin/fotos", label: "Fotos", hint: "Instagram y fotos editadas para crear productos" },
  { href: "/admin/categorias", label: "Categorías", hint: "Grupos del catálogo" },
  { href: "/admin/marcas", label: "Marcas", hint: "Pokémon, Dragon Ball…" },
  { href: "/admin/fechas", label: "Fechas especiales", hint: "San Valentín, Navidad… banners y avisos" },
  { href: "/admin/imagenes-web", label: "Imágenes de la web", hint: "Banners de portada, tarjetas de la tienda, páginas" },
  { href: "/admin/redes", label: "Redes sociales", hint: "Preparar y publicar posts" },
  { href: "/admin/newsletter", label: "Newsletter", hint: "Suscriptoras" },
  { href: "/admin/ajustes", label: "Configuración", hint: "Teléfono, email, redes" },
  { href: "/admin/legal", label: "Textos legales", hint: "Aviso, privacidad, cookies" },
  { href: "/admin/perfil", label: "Mi perfil", hint: "Nombre y contraseña" },
];
