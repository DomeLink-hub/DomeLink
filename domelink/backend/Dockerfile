# STAGE 1: Builder
FROM node:20-slim AS builder

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build


# STAGE 2: Production
FROM node:20-slim

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --omit=dev
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["npm", "start"]