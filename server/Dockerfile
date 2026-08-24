# 🚀 SAGAR AI Server Dockerfile
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application source code
COPY src/ ./src/
COPY .env.example ./.env.example

# Expose API port
EXPOSE 5000

# Start server
CMD ["node", "src/server.js"]
