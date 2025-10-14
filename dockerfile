# Multi-stage build for production optimization
FROM node:22.14.0-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

#########################################
# Development stage
#########################################
FROM base AS development

# Install all dependencies (including dev dependencies)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Expose port (adjust if your NestJS runs on different port)
EXPOSE 3000

# Start in development mode with hot reload
CMD ["pnpm", "run", "start:dev"]

#########################################
# Build stage
#########################################
FROM base AS build

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

#########################################
# Production stage
#########################################
FROM node:22.14.0-alpine AS production

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built application from build stage
COPY --from=build /app/dist ./dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
USER nestjs

EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]