# Multi-stage build for production
FROM node:18-alpine AS backend-build

WORKDIR /app/server

COPY server/package*.json ./
RUN npm ci --only=production

COPY server/ ./

FROM node:18-alpine AS frontend-build

WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

FROM node:18-alpine

WORKDIR /app

# Copy backend
COPY --from=backend-build /app/server ./server
COPY --from=frontend-build /app/client/build ./client/build

# Install backend dependencies
WORKDIR /app/server
RUN npm ci --only=production

# Expose port
EXPOSE 5000

# Set environment
ENV NODE_ENV=production

# Start server
CMD ["node", "index.js"]

