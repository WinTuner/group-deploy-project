# ---------- 1) install deps ----------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------- 2) build ----------
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- 3) run (standalone) ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=80 \
    HOSTNAME=0.0.0.0 \
    AUTH_API=http://auth-service:3001 \
    PRODUCT_API=http://product-service:3002 \
    ORDER_API=http://order-service:3003
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# docker-compose.yml map 8080:80 -> คง port 80 ไว้เหมือนเดิม
EXPOSE 80
CMD ["node", "server.js"]
