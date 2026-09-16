# 🚀 Getting Started

> **Prerequisites:** [Node.js v20+](https://nodejs.org/) · [Docker Desktop](https://www.docker.com/products/docker-desktop/) · `npm`

---

## 1. Docker — PostgreSQL & Redis

```bash
npm run docker:up
```

---

## 2. Backend API

```bash
cd backend
npm install
npm run dev
```

Runs on [http://localhost:5000](http://localhost:5000)

---

## 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on [http://localhost:3000](http://localhost:3000)

---

## 4. CLI Tool

```bash
cd cli
npm install
npm start
```

Or shorten a URL directly:

```bash
node src/index.js https://example.com
```

---

## 5. Nginx Load Balancer (full Docker stack)

> Starts Nginx + 3 backend replicas + frontend + Postgres + Redis — all in Docker.

```bash
npm run docker:lb:up
```

App runs at [http://localhost](http://localhost)

To stop:

```bash
npm run docker:lb:down
```

---

## Ports

| Service | URL |
| :--- | :--- |
| Frontend | [http://localhost:3000](http://localhost:3000) |
| Backend API | [http://localhost:5000](http://localhost:5000) |
| PostgreSQL | `localhost:5433` |
| Redis | `localhost:6379` |
| Nginx LB | [http://localhost](http://localhost) |

---

## Stop

```bash
# Stop frontend & backend
Ctrl + C

# Stop Docker (Postgres + Redis)
npm run docker:down

# Stop Nginx LB stack
npm run docker:lb:down
```
