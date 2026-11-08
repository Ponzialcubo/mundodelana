// Day-to-day sections: always visible (sidebar on desktop, bottom tabs on mobile).
export const MAIN = [
  { href: "/admin", label: "Inicio" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/fotos", label: "Fotos" },
];

// Occasional sections: grouped under "Más" so the owner isn't faced with ten options.
export const MORE = [
  { href: "/admin/categorias", label: "Categorías", hint: "Grupos del catálogo" },
  { href: "/admin/marcas", label: "Marcas", hint: "Pokémon, Dragon Ball…" },
  { href: "/admin/redes", label: "Redes sociales", hint: "Preparar y publicar posts" },
  { href: "/admin/newsletter", label: "Newsletter", hint: "Suscriptoras" },
  { href: "/admin/ajustes", label: "Configuración", hint: "Teléfono, email, redes" },
  { href: "/admin/legal", label: "Textos legales", hint: "Aviso, privacidad, cookies" },
  { href: "/admin/perfil", label: "Mi perfil", hint: "Nombre y contraseña" },
];
