#!/usr/bin/env bash
# Pre-generates the optimized product images after a deploy, so the first
# visitor of each page doesn't wait while the server encodes them.
set -uo pipefail
SITE="${SITE:-https://mundolana.es}"
SQL='select "mainImage" from "Product" where "publicationStatus"='"'"'PUBLICADO'"'"' and "mainImage" is not null
     union select url from "ProductImage" where "mediaType"='"'"'IMAGE'"'"'
     union select "coverImage" from "Category" where "coverImage" is not null'
docker exec mundodelana-db-1 sh -c "psql -U \$POSTGRES_USER -d \$POSTGRES_DB -tA -c \"$SQL\"" | while read -r url; do
  [ -z "$url" ] && continue
  enc=$(python3 -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$url")
  # Cards (q75) and the product gallery on phones (828px, q80).
  for wq in 390:75 640:75 828:80; do
    curl -s -o /dev/null -H "Accept: image/webp,*/*" "$SITE/_next/image?url=$enc&w=${wq%:*}&q=${wq#*:}"
  done
done
echo "[warm] imágenes precalentadas"
