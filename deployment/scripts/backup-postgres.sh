#!/usr/bin/env sh
set -eu

BACKUP_DIR="${1:-/opt/ai-receptionist/backups/postgres}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"

mkdir -p "$BACKUP_DIR"

pg_dump "$DATABASE_URL" > "$BACKUP_DIR/postgres-$TIMESTAMP.sql"

echo "PostgreSQL backup created at $BACKUP_DIR/postgres-$TIMESTAMP.sql"
