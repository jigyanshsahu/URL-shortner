FROM node:20-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy package files first (layer caching)
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for Next.js build)
RUN npm ci

# Copy source
COPY . .

# Build the Next.js production bundle
RUN npm run build

EXPOSE 3000

# Start in production mode
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
