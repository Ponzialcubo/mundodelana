---
name: catalogar-instagram
description: Convertir las publicaciones de Instagram de Mundolana (ya importadas en la pestaña Fotos) en productos en borrador del catálogo, revisando las fotos a mano y redactando las fichas. Usar cuando el usuario pida catalogar, rellenar productos o aprovechar las publicaciones de Instagram.
---

# Catalogar publicaciones de Instagram

El trabajo de catalogar lo hace Claude mirando las fotos. **No** se usa el botón «✨ Rellenar la ficha»: ese botón es para Elvira cuando suba piezas nuevas desde el móvil.

## Reglas

- Se crea con `priceType: PERSONALIZADO` (por encargo) y precio 0. Desde 2026-11-08 el usuario prefiere **publicar directamente**: el precio 0 se ve como «Consultar precio» y Elvira lo revisa en admin → «Pendiente de revisar». Pregunta si sigue siendo así antes de publicar.
- **Nunca inventes datos.** Ni medidas, ni plazos, ni marcas de hilo: solo lo que se ve en la foto o lo que dice el texto del post. Si no sabes el material, pon «Algodón».
- Voz de marca: la de `BRAND_VOICE` en `src/lib/content-prompt.ts`. Español de España, sin emojis, cercano pero profesional, en primera persona de Elvira cuando cuente la historia de la pieza.
- **Una pieza = un producto**, aunque salga en varias publicaciones (por ejemplo Alicia, en 5 posts de proceso). Los pendientes van uno por diseño.
- Antes de crear nada, compara con los productos que ya existen. Si la pieza ya está, marca sus fotos como usadas y **no toques el producto**.
- Las fotos de grupo (20 vacas, 7 pingüinos…) van a la galería «Trabajos hechos» (`showInGallery`), no a un producto.
- Se descartan los procesos (cabezas a medio hacer), los libros, el logo y las portadas con solo texto.
- Personajes con licencia: usa el nombre real (Cenicienta, Frida, Playmobil…) y asígnale la marca correspondiente (Disney, Frida Kahlo, Playmobil, Pokémon). El usuario lo ha aceptado.

## Pasos

Trabaja en una carpeta del scratchpad (`$W`). Los scripts están en `scripts/`.

1. **Importar lo nuevo**: botón «Traer de Instagram» en Fotos, o el API `POST /api/admin/biblioteca/instagram` en bucle hasta `remaining: 0`.
2. **Exportar datos** (solo lo que está por revisar):
   ```bash
   docker exec mundodelana-db-1 sh -c 'psql -U $POSTGRES_USER -d $POSTGRES_DB -tAc "select json_agg(t) from (select id, \"instagramPostId\" as post, \"mediaType\" as type, url, \"posterUrl\" as poster, caption, \"takenAt\" as date, permalink from \"LibraryMedia\" where status = '"'"'NUEVA'"'"' order by \"takenAt\" desc, \"createdAt\") t"' > $W/library.json
   ```
   Además: `meta.txt` (línea 1 con el JSON `{nombre de categoría: id}`, línea 2 con el JSON de los slugs existentes) y la lista de productos actuales. Ver las consultas en `plan-ejemplo-2026-11-08.py` y en el historial.
3. **Hojas de contacto**: `node scripts/sheets.js $W/library.json /var/lib/docker/volumes/mundodelana_uploads_data/_data $W`. Genera `sheet-NN.jpg` (12 posts por hoja, numerados) e `index.json` con los textos. Lee todas las hojas con Read. Si un post no está claro, amplía su foto.
4. **Plan**: escribe `$W/plan.py` con `PRODUCTS`, `EXISTING`, `GALLERY` y `DISCARD`, siguiendo el formato del ejemplo. Cada producto lleva `posts` (el primer post aporta la portada), `extra_from` opcional, nombre, slug, categorías, frase corta (≤90 caracteres), descripción (2-4 frases) y materiales (uno por línea).
5. **Sesión**: `scripts/session.sh $W/cookie` (2 h, incluye la cookie de la puerta de Caddy).
6. **Prueba**: `python3 -I scripts/apply.py $W` → revisa que dé «sin asignar: 0» y «problemas: ninguno».
7. **Aplicar**: `python3 -I scripts/apply.py $W --apply`. Crea los productos con `POST /api/admin/productos` (mismas validaciones que el admin) y actualiza los estados de la biblioteca.
8. **Revisar portadas**: genera una hoja con todas las portadas recortadas a 4:5 y cambia las que tengan texto de Instagram superpuesto por otra foto del mismo producto (intercambiando con `ProductImage` para no perder la antigua).
9. **Relacionados**: recalcúlalos para todo el catálogo (misma marca > mismo tipo de pieza > categoría compartida). En `_RelatedProducts`, la fila (A, B) muestra A en la ficha de B.
10. **Resumen al usuario**: cuántos productos se han creado y en qué categorías, los productos publicados con precio 0, los avisos de licencias y qué hacer después (revisar precio y publicar desde Inicio → «Pendiente de completar»).

## Lecciones (2026-11-08, primera catalogación: 94 posts → 54 productos)

- Los reels con música con derechos vienen sin vídeo: la importación guarda su portada como foto.
- Las fotos de Instagram de un pedido variado (#67, pendientes) sirven como foto extra en varios productos (`extra_from`).
- Las categorías existentes cubren todo: Amigurumis, Decoración, Bebé, Complementos, Plantas decorativas, Packs regalo, Ropa y Temporada. Usa dos como máximo por producto.
