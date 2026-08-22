#!/bin/sh
set -e

echo "Aplicando migraciones de Prisma..."
node node_modules/prisma/build/index.js migrate deploy

exec "$@"
