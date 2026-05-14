#!/usr/bin/env sh
set -eu

APP_DIR="${APP_DIR:-/opt/ai-receptionist}"

cd "$APP_DIR/backend"
corepack pnpm install --frozen-lockfile
corepack pnpm prisma:generate
corepack pnpm prisma:deploy
corepack pnpm build

cd "$APP_DIR/frontend"
corepack pnpm install --frozen-lockfile
corepack pnpm build

echo "Build completed. Restart your process manager or containers next."
