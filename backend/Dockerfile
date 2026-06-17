# Stage 1: Build NestJS App
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install build dependencies (needed for native modules like bcrypt)
RUN apk add --no-cache python3 make g++ openssl

# Copy package configuration
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Remove development dependencies to keep final image small
RUN npm prune --production


# Stage 2: Run NestJS App
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Install runtime dependencies for Prisma
RUN apk add --no-cache openssl

# Set env variable
ENV NODE_ENV=production

# Copy built app and dependencies from builder
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

EXPOSE 3000

# Start app
CMD ["node", "dist/main.js"]
