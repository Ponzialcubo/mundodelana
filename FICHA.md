# Mundo Lana — ficha

Tienda online de **ganchillo hecho a mano** (amigurumis, piezas por encargo) de la dueña, que también lleva el panel.
Web: https://mundolana.es · Panel: https://mundolana.es/admin (detrás de una «puerta» secreta de Caddy, ver abajo).

## Piezas
- **Next.js 16 (App Router) + React 19 + Tailwind 4 + Prisma 6 + PostgreSQL 16.** Código en `src/`, esquema en `prisma/schema.prisma`, migraciones en `prisma/migrations/` (se aplican solas al arrancar: `docker-entrypoint.sh`).
- Ojo: Next 16 tiene cambios respecto a versiones anteriores (`params` y `searchParams` son promesas, `middleware.ts` protege `/admin`). Ver `AGENTS.md`.
- Producción: `docker-compose.prod.yml` (servicios `app` y `db`; contenedores `mundodelana-app-1`, `mundodelana-db-1`). **Nunca** `docker-compose.yml` a secas: es el de desarrollo.
- Redesplegar: `cd /opt/sites/mundodelana && nohup docker compose -f docker-compose.prod.yml up -d --build > /tmp/mundolana-build.log 2>&1 &`
- Salud: `GET /api/health` (comprueba la base de datos). El contenedor tiene healthcheck con ella.
- Fotos y vídeos subidos: volumen `uploads_data` en `/app/uploads`.
- Código también en GitHub (`Ponzialcubo/mundodelana`, rama `main`). `deploy.sh` hace `git pull`: si se usa, antes revisar que no pise cambios hechos en el servidor.
- Caddy: `/opt/caddy/sites/mundolana.es.caddy`. La puerta del panel (`/admin*`, `/api/admin*`) se gestiona con `/opt/ops-mcp/puerta.sh mundolana.es url|on|off`.

## Partes visibles (dónde vive cada cosa)
- Públicas, en `src/app/(public)/`: portada (`page.tsx`), catálogo (`catalogo`, `categoria/[slug]`, `marca/[slug]` = personajes), ficha de producto (`producto/[slug]`), encargos (`encargo`), «Sobre mí» (`sobre-mi`), «Cómo funciona», preguntas frecuentes (`faq`), contacto, fechas especiales (`fechas/[slug]`), textos legales.
- Cuenta de clienta en `src/app/(cuenta)/cuenta/` (pedidos, datos, mensajes). Acceso con email y contraseña o con Google.
- Componentes en `src/components/` (públicos) y `src/components/admin/` (panel). Estilos globales y colores en `src/app/globals.css` (`--color-pink`, `--color-cream`, `--color-ink`… y los del panel `--color-admin-*`).
- **Textos de las páginas**: valores por defecto en `src/lib/site-texts.ts`. La dueña puede sobrescribirlos desde Panel → «Páginas de la web» (tabla `SiteText`). Si una clave tiene fila en `SiteText`, manda la fila y cambiar el código no se verá: en ese caso decirle que lo cambie ella en el panel o proponerle el texto.
- Panel en `src/app/admin/(dashboard)/`: Inicio, Pedidos, Mensajes, Productos, Categorías, Personajes, Fotos de Instagram, Páginas de la web, Fechas especiales, Redes sociales, Configuración, Newsletter, Textos legales, Mi perfil, **Asistente**. Menú en `src/components/admin/admin-nav.ts`.
- Regla de Next: un componente con `"use client"` no puede exportar constantes que lea una página de servidor (llegan como referencia, no como valor). Las constantes compartidas van en `src/lib/`.

## Asistente IA (9 nov 2026)
- Panel → «Asistente» (sustituye a «Ideas»; `/admin/ideas` redirige). La dueña habla con la IA y le encarga cambios; los publica el agente del servidor (`/opt/sites/agente/README.md`).
- Puente: `src/lib/asistente.ts` y `src/app/api/admin/asistente/[...ruta]/route.ts` (la clave nunca llega al navegador). Pantallas en `src/components/admin/asistente/`.
- `.env`: `AGENTE_URL`, `AGENTE_KEY` (pasados al contenedor en `docker-compose.prod.yml`).
- Lo que hace el agente aquí se ve en https://agente.sergiolab.es (Apps y tiendas → Mundo Lana). Copias previas a cada cambio: `/opt/backups/agente/mundolana/`.
- ⚠️ El agente modifica el código de esta carpeta. Antes de cambiar algo a mano, partir SIEMPRE del código del servidor.

## Arreglos
- 2026-11-09: Configuración (`/admin/ajustes`) daba error 500: las pestañas se importaban desde el formulario cliente. Movidas a `src/lib/settings-tabs.ts`.
- 2026-11-09: el `<main>` del panel usa `overflow-x-clip` (con `hidden` no funcionaban las barras fijas al hacer scroll).

## Cambios del asistente
