FROM node:20-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS development

COPY . .

EXPOSE 3001

CMD ["sh", "-c", "pnpm dev --hostname 0.0.0.0 --port 3001"]

FROM base AS build

COPY . .
RUN pnpm build

FROM node:20-alpine AS production

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

WORKDIR /app

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

EXPOSE 3001

CMD ["node", "server.js"]
