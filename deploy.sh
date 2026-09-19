#!/bin/bash
set -euo pipefail

PROJECT_DIR="/opt/sites/mundodelana"
CONTAINER="mundodelana-app-1"
COMPOSE_FILE="docker-compose.prod.yml"

echo "=== Deploy Mundodelana — $(date '+%Y-%m-%d %H:%M') ==="

cd "$PROJECT_DIR"

echo ""
echo "→ Pulling latest code from GitHub..."
git pull

echo ""
echo "→ Building and deploying containers..."
docker compose -f "$COMPOSE_FILE" up -d --build

echo ""
echo "→ Waiting for container to start (15s)..."
sleep 15

if docker ps --filter "name=^${CONTAINER}$" --filter "status=running" --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
  echo ""
  echo "✓ Container '${CONTAINER}' running"
  echo ""
  echo "--- Últimas líneas del log ---"
  docker logs "$CONTAINER" --tail 15 2>&1
  echo ""
  echo "=== Deploy completado ==="
else
  echo ""
  echo "✗ ERROR: El contenedor no está corriendo"
  echo ""
  echo "--- Log completo ---"
  docker logs "$CONTAINER" --tail 30 2>&1
  exit 1
fi
