# ---- Etapa 1: build ----
FROM node:22-alpine AS builder
WORKDIR /app

# Necesario ANTES del build: NestJS
# Instalar pnpm y configurar corepack para usar pnpm en lugar de npm
RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# ---- Etapa 2: producción, solo lo necesario ----
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Instalar pnpm y configurar corepack para usar pnpm en lugar de npm
RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]