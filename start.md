# 🚀 Getting Started Guide

A quick reference on how to start and run the entire **Scalable URL Shortener** system locally.

---

## 📋 Prerequisites

Make sure the following are installed and running on your machine:
- [Node.js](https://nodejs.org/) (v20 or higher)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (must be launched and running)
- `npm` (comes with Node.js)

---

## ⚡ Option 1: Quick Start (Recommended)

You can run the entire stack directly from the project root directory.

### Step 1: Start PostgreSQL & Redis

Open **Docker Desktop**, then run in your terminal:

```bash
npm run docker:up
```
*(or run `docker compose up -d`)*

> [!NOTE]
> - **PostgreSQL** runs on port `5433` (mapped from 5432 to prevent conflicts with any local Postgres).
> - **Redis** runs on port `6379`.
> - The database schema from `backend/schema.sql` is automatically initialized on the first container startup.

---

### Step 2: Run Frontend & Backend Together

From the project root directory, run:

```bash
npm run dev
```

This starts both:
- 🌐 **Frontend (Next.js 16)**: [http://localhost:3000](http://localhost:3000)
- ⚡ **Backend (Express 5 with Nodemon)**: [http://localhost:5000](http://localhost:5000)

---

## 🛠 Option 2: Running Services Individually

If you prefer running services in dedicated terminal windows:

### Terminal 1: Docker (Database & Cache)
```bash
docker compose up -d
```

### Terminal 2: Backend API
```bash
cd backend
npm install
npm run dev
```
*Runs with Nodemon hot-reloading on port `5000`.*

### Terminal 3: BullMQ Click Worker (Optional / Dedicated)
> The worker is imported into the backend automatically, but if you want to run it in a separate process:
```bash
cd backend
npm run worker
```

### Terminal 4: Frontend App
```bash
cd frontend
npm install
npm run dev
```
*Runs Next.js on [http://localhost:3000](http://localhost:3000).*

---

## 💻 Running the Interactive CLI Tool

The project includes an interactive terminal CLI to shorten and manage URLs:

```bash
cd cli
npm install
npm start
```

Or shorten a URL directly with an argument:
```bash
node src/index.js https://example.com
```

---

## 🌐 Service URLs & Ports

| Service | Address | Description |
| :--- | :--- | :--- |
| **Frontend Web App** | [http://localhost:3000](http://localhost:3000) | Next.js Dashboard & Link Management |
| **Backend REST API** | [http://localhost:5000](http://localhost:5000) | Express API & Redirection Router |
| **API Health Check** | [http://localhost:5000/](http://localhost:5000/) | Status check endpoint |
| **PostgreSQL** | `localhost:5433` | Database (`user: postgres`, `pass: postgres`, `db: urlshortener`) |
| **Redis** | `localhost:6379` | Cache & BullMQ queue |

---

## 🛑 Stopping the Services

- Press `Ctrl + C` in the terminal running `npm run dev` to stop frontend and backend.
- Stop Docker containers:
  ```bash
  npm run docker:down
  ```
  *(or `docker compose down`)*

---

## ❓ Troubleshooting

- **Backend says Redis Error or keeps waiting:**
  Ensure Docker Desktop is open and `npm run docker:up` has completed.
- **Port 5433 or 6379 already in use:**
  Check if another container or service is using these ports with `docker ps`.
- **Manually re-applying database schema:**
  If you ever need to manually apply the schema to the running PostgreSQL container:
  ```bash
  docker compose exec -T postgres psql -U postgres -d urlshortener < backend/schema.sql
  ```
