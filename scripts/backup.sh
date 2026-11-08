#!/usr/bin/env bash
# Backup completo en el VPS: base de datos (pg_dump) + imágenes subidas (volumen).
# Pensado para un cron diario:
#   0 6 * * *  cd /opt/sites/mundodelana && bash scripts/backup.sh >> /var/log/mundodelana-backup.log 2>&1
set -euo pipefail

PROJECT="mundodelana"
DIR="${BACKUP_DIR:-/opt/backups/mundodelana}"
KEEP_DAYS="${KEEP_DAYS:-14}"
mkdir -p "$DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"

if [ -f .env ]; then
  POSTGRES_USER="$(grep -E '^POSTGRES_USER=' .env | head -1 | cut -d= -f2- | tr -d '\r' || true)"
  POSTGRES_DB="$(grep -E '^POSTGRES_DB=' .env | head -1 | cut -d= -f2- | tr -d '\r' || true)"
fi
POSTGRES_USER="${POSTGRES_USER:-mundodelana}"
POSTGRES_DB="${POSTGRES_DB:-mundodelana}"

DB_FILE="${PROJECT}_db_${STAMP}.sql.gz"
UPLOADS_FILE="${PROJECT}_uploads_${STAMP}.tar.gz"

# 1) Base de datos (productos, categorías, pedidos, FAQ…). pg_dump local por docker exec.
docker exec mundodelana-db-1 pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  | gzip > "$DIR/$DB_FILE"

# Aborta si el dump salió vacío (BD caída, credenciales mal…).
if [ ! -s "$DIR/$DB_FILE" ]; then
  echo "✗ ERROR: backup de BD vacío en $DIR/$DB_FILE" >&2
  rm -f "$DIR/$DB_FILE"
  exit 1
fi

# 2) Imágenes subidas (volumen mundodelana_uploads_data)
docker run --rm -v mundodelana_uploads_data:/u:ro -v "$DIR":/out alpine \
  tar -czf "/out/$UPLOADS_FILE" -C /u .

echo "✓ Backup $STAMP: $(du -h "$DIR/$DB_FILE" | cut -f1) BD + $(du -h "$DIR/$UPLOADS_FILE" | cut -f1) imágenes"

# Subida a Google Drive
echo "[$(date '+%Y-%m-%d %H:%M')] Subiendo a Google Drive..."
rclone copy "$DIR/$DB_FILE" gdrive-backups:backups-vps/mundodelana/
rclone copy "$DIR/$UPLOADS_FILE" gdrive-backups:backups-vps/mundodelana/
rclone delete gdrive-backups:backups-vps/mundodelana --min-age 30d
echo "[$(date '+%Y-%m-%d %H:%M')] Drive OK"

# Rotación: conserva KEEP_DAYS días
find "$DIR" -name "${PROJECT}_db_*.sql.gz"      -mtime +"$KEEP_DAYS" -delete
find "$DIR" -name "${PROJECT}_uploads_*.tar.gz" -mtime +"$KEEP_DAYS" -delete
