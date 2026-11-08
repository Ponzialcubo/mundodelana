#!/usr/bin/env bash
# Writes a short-lived admin cookie (session JWT + Caddy gate cookie) to $1 for scripted calls to the admin API.
set -euo pipefail
OUT="${1:?output file}"
ID=$(docker exec mundodelana-db-1 sh -c 'psql -U $POSTGRES_USER -d $POSTGRES_DB -tAc "select id from \"Admin\" order by \"createdAt\" limit 1"')
TOK=$(docker exec -e AID="$ID" mundodelana-app-1 node -e 'const {SignJWT}=require("jose");new SignJWT({sub:process.env.AID,role:"admin"}).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("2h").sign(new TextEncoder().encode(process.env.NEXTAUTH_SECRET)).then(t=>console.log(t))')
# shellcheck disable=SC1091
. /etc/proxy-gates/mundolana.es.env
umask 077
printf 'md_admin_session=%s; g_%s=%s' "$TOK" "$(printf mundolana.es | sha256sum | cut -c1-8)" "$GATE_COOKIE" > "$OUT"
