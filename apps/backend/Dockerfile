# Backend Dockerfile
FROM node:20-alpine AS builder

# Install Pandoc for document export
RUN apk add --no-cache pandoc

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies
RUN npm install

# Copy source code
COPY apps/backend ./apps/backend
COPY packages/shared ./packages/shared
COPY turbo.json ./

# Build shared package
WORKDIR /app/packages/shared
RUN npm run build

# Build backend
WORKDIR /app/apps/backend
RUN npm run build

# Production stage
FROM node:20-alpine

# Install Pandoc
RUN apk add --no-cache pandoc

WORKDIR /app

# Copy built files
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package*.json ./
COPY --from=builder /app/packages/shared/dist ./node_modules/@docs/shared/dist
COPY --from=builder /app/packages/shared/package.json ./node_modules/@docs/shared/

# Install production dependencies only
RUN npm install --only=production

EXPOSE 4000

CMD ["node", "dist/main.js"]
