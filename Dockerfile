# Multi-stage build for combined frontend/backend
FROM node:18-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY api/package.json ./api/
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY api/ ./api/
COPY backend/ ./backend/
COPY frontend/ ./frontend/
COPY tsconfig.json ./

# Build all packages
RUN pnpm build

# Production stage
FROM node:18-alpine AS production

RUN npm install -g pnpm

WORKDIR /app

# Copy package files for production dependencies
COPY package.json pnpm-workspace.yaml ./
COPY api/package.json ./api/
COPY backend/package.json ./backend/

# Install only production dependencies
RUN pnpm install --prod

# Copy built artifacts from builder stage
COPY --from=builder /app/api/dist ./api/dist
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/frontend/build ./frontend/build

# Copy service management scripts
COPY start-services.js frontend-server.js ./

# Environment variables for multi-process setup
ENV RUN_MODE=combined
ENV FRONTEND_PORT=3000
ENV FRONTEND_HOST=0.0.0.0
ENV BACKEND_PORT=3001
ENV BACKEND_HOST=0.0.0.0

# Expose both ports (frontend and backend)
EXPOSE 3000 3001

CMD ["npm", "start"]