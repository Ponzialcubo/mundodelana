# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /app

# ---------- deps: instala dependencias con el lockfile exacto ----------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---------- builder: genera el cliente Prisma y compila Next.js ----------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---------- runner: imagen final mínima ----------
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# node_modules completo de "deps": el CLI de Prisma (`prisma migrate deploy`,
# ejecutado al arrancar el contenedor) arrastra varias dependencias
# transitivas (wasm de @prisma/config, el paquete "effect", etc.) que se
# rompen si se copian sueltas entre stages de Docker. Copiarlo íntegro es lo
# único fiable; el output standalone de Next.js se copia encima y ya trae su
# propio node_modules reducido para el server en runtime.
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
