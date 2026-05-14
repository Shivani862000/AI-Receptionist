#!/usr/bin/env sh
set -eu

SOURCE_DIR="${1:-/opt/ai-receptionist/backend/uploads}"
BACKUP_DIR="${2:-/opt/ai-receptionist/backups/uploads}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"

mkdir -p "$BACKUP_DIR"

tar -czf "$BACKUP_DIR/uploads-$TIMESTAMP.tar.gz" -C "$SOURCE_DIR" .

echo "Uploads backup created at $BACKUP_DIR/uploads-$TIMESTAMP.tar.gz"
