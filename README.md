# Scalable URL Shortener

URL shortener with a Next.js frontend, Express API, PostgreSQL persistence, Redis caching/rate limiting, and a BullMQ click-tracking worker.

## Prerequisites

- Node.js 20 or newer
- npm
- Docker Desktop
- A PostgreSQL database

## Environment

Create `backend/.env`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
PORT=5000
JWT_SECRET=replace-with-a-long-random-secret
REDIS_URL=redis://localhost:6379
BASE_URL=http://localhost:5000
```

Create `frontend/.env.local` if the API will not use its default URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

`DATABASE_URL` must point to a PostgreSQL database containing the application tables (`users`, `urls`, and `url_clicks`). The repository does not currently include database migrations or an initialization SQL file.

## Start the whole app

Run these commands from the repository root in separate terminals.

### 1. Start Redis with Docker

```bash
docker compose -f backend/docker-compose.yml up -d
```

Check the service or stop it later:

```bash
docker compose -f backend/docker-compose.yml ps
docker compose -f backend/docker-compose.yml down
```

### 2. Start the backend API

```bash
cd backend
npm install
npm start
```

The API is available at `http://localhost:5000`.

### 3. Start the click worker

In another terminal:

```bash
cd backend
node src/worker.js
```

The worker consumes click jobs from Redis and writes analytics to PostgreSQL.

### 4. Start the frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verify the services

```bash
curl http://localhost:5000/
curl http://localhost:5000/test-db
docker compose -f backend/docker-compose.yml exec redis redis-cli ping
```

Expected responses are an API status message, a database connection response, and `PONG` from Redis.

## Useful commands

```bash
# Frontend lint and production build
cd frontend
npm run lint
npm run build

# Run the backend directly
cd backend
node src/server.js
```

## Stop everything

Stop the frontend and backend terminals with `Ctrl+C`, then stop Redis:

```bash
docker compose -f backend/docker-compose.yml down
```