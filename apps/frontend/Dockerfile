# Frontend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies
RUN npm install

# Copy source code
COPY apps/frontend ./apps/frontend
COPY packages/shared ./packages/shared
COPY turbo.json ./

# Build shared package
WORKDIR /app/packages/shared
RUN npm run build

# Build frontend
WORKDIR /app/apps/frontend
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built files
COPY --from=builder /app/apps/frontend/.next ./.next
COPY --from=builder /app/apps/frontend/public ./public
COPY --from=builder /app/apps/frontend/package*.json ./
COPY --from=builder /app/apps/frontend/next.config.js ./
COPY --from=builder /app/packages/shared/dist ./node_modules/@docs/shared/dist
COPY --from=builder /app/packages/shared/package.json ./node_modules/@docs/shared/

# Install production dependencies only
RUN npm install --only=production

EXPOSE 3000

CMD ["npm", "start"]
