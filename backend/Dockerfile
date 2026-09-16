FROM node:20-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy package files first (layer caching)
COPY package.json package-lock.json* ./

# Install production + dev deps (nodemon used in dev mode)
RUN npm ci

# Copy source
COPY . .

# PORT is injected at runtime via env / docker-compose
EXPOSE 5001

# Use dumb-init so Node.js gets SIGTERM properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
