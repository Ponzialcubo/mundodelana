#!/bin/bash
# Deploys are automatic: push to main -> GitHub Actions builds the image -> the VPS pulls it (desplegar.sh).
# This only forces a check now. Never build on the server.
exec /opt/ops-mcp/desplegar.sh mundodelana "$@"
