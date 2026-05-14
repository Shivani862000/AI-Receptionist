FROM node:20-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS development

COPY . .

EXPOSE 4000

CMD ["sh", "-c", "pnpm prisma:generate && pnpm start:dev"]

FROM base AS build

COPY . .
RUN pnpm prisma:generate && pnpm build

FROM node:20-alpine AS production

ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package.json pnpm-lock.yaml ./

RUN mkdir -p uploads/recordings uploads/transcripts uploads/tts-audio uploads/reports uploads/temp logs

EXPOSE 4000

CMD ["sh", "-c", "pnpm prisma:deploy && node dist/main.js"]
