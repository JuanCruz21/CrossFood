# Etapa 1: Instalar dependencias
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./
RUN npm ci

# Etapa 2: Build de la aplicación
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar dependencias desde la etapa anterior
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno necesarias para el build
ENV NEXT_TELEMETRY_DISABLED=1

# Construir la aplicación
RUN npm run build

# Etapa 3: Imagen de producción
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Crear usuario no-root para mayor seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios desde builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Copiar archivos de build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Comando para iniciar la aplicación
CMD ["node", "server.js"]
