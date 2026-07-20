# Multi-stage build for Vite React SPA
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app (outputs to dist/)
ARG VITE_API_URL=http://localhost:8000/api
ARG VITE_CANONICAL_BASE_URL=https://portfolio.example.com

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_CANONICAL_BASE_URL=$VITE_CANONICAL_BASE_URL

RUN npm run build

# Stage 2: Serve with NGINX
FROM nginx:alpine

# Copy NGINX config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port for Cloud Run
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/ || exit 1

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
