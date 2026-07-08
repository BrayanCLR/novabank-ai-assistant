# ---- Etapa 1: build ----
FROM node:20-alpine AS builder
WORKDIR /app

# Necesario ANTES del build: Next.js hornea NEXT_PUBLIC_* en el bundle
# del navegador durante "npm run build", no en tiempo de ejecución.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Etapa 2: producción, solo el server standalone ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]