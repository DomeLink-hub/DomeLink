# STAGE 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build


# STAGE 2: Production
FROM node:20-alpine

# PRISMA FIX: Add the edge/community and 3.16 repositories to find openssl 1.1
RUN apk add --no-cache libssl1.1 --repository=http://dl-cdn.alpinelinux.org/alpine/v3.16/main

WORKDIR /app

# Copy package files and Prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm install --omit=dev

# Generate Prisma Client for the production environment
RUN npx prisma generate

# Copy the compiled JavaScript from the Builder stage
COPY --from=builder /app/dist ./dist

# Expose the port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]