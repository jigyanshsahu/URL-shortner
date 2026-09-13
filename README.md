# ⚡ Scalable URL Shortener

An enterprise-grade, high-throughput URL shortening and analytics platform built with **Next.js 16**, **Express.js 5**, **PostgreSQL**, **Redis**, and **BullMQ**. Includes a real-time analytics dashboard, QR code generator, and an interactive CLI tool.

---

## 📑 Table of Contents

- [System Architecture](#-system-architecture)
- [Sequence Diagrams](#-sequence-diagrams)
  - [1. Redirection & Asynchronous Click Tracking](#1-high-throughput-redirection--asynchronous-click-tracking)
  - [2. URL Creation & Rate Limiting](#2-url-creation--rate-limiting-flow)
  - [3. Authentication & Security](#3-authentication--jwt-flow)
- [Database Architecture](#-database-architecture)
- [REST API Reference](#-rest-api-reference)
- [CLI Tool Guide](#-cli-tool-guide)
- [Local Development Setup](#-local-development-setup)
- [Production Deployment Guide](#-production-deployment-guide)
- [Environment Variables](#-environment-variables)
- [Key Architectural Highlights](#-key-architectural-highlights)

---

## 🏛 System Architecture

The application is decoupled into independent tiers to achieve sub-millisecond redirection latency, resilient rate-limiting, and zero blocking on database write loads during viral click spikes.

```mermaid
flowchart TB
    subgraph Clients["Clients"]
        Browser["🖥️ Web Browser (User)"]
        CLI["💻 CLI Tool (Terminal)"]
        Visitor["🌍 Public Visitor (Clicks Short Link)"]
    end

    subgraph FrontendApp["Frontend Tier (Vercel)"]
        NextApp["Next.js 16 (App Router)<br/>React 19 • Tailwind CSS • D3.js Charts • GSAP Animations"]
    end

    subgraph BackendTier["Backend Tier (Render / Railway)"]
        API["Express.js 5 REST API<br/>Auth • Routing • Rate Limiting • QR Code"]
        Worker["BullMQ Worker<br/>Asynchronous Click Processing"]
        Cron["node-cron Engine<br/>Scheduled Expiration Cleanup"]
    end

    subgraph DataTier["Data & Cache Tier"]
        Redis[("Redis Cloud / Cluster<br/>Hot Cache • BullMQ Queue • Rate Limits")]
        Postgres[("PostgreSQL (Neon / Supabase)<br/>Persistent Relational Store")]
    end

    Browser -->|HTTPS| NextApp
    NextApp -->|REST API Requests| API
    CLI -->|HTTP REST / Direct| API
    Visitor -->|HTTP GET /:shortCode| API

    API -->|1. Cache Read/Write| Redis
    API -->|2. Push Click Job| Redis
    API -->|3. Query / Insert Data| Postgres

    Worker -->|Consume Click Jobs| Redis
    Worker -->|Batch Write Clicks & Incr Count| Postgres
    Cron -->|Periodic Soft-Delete Expired Links| Postgres
```

---

## 🔄 Sequence Diagrams

### 1. High-Throughput Redirection & Asynchronous Click Tracking

Redirections bypass primary database lookups when cached in Redis. Analytics processing is decoupled from the HTTP response loop using a BullMQ queue.

```mermaid
sequenceDiagram
    autonumber
    actor Visitor as 🌍 Visitor
    participant API as Express API (/:shortCode)
    participant Redis as Redis Cache
    participant DB as PostgreSQL
    participant Queue as BullMQ (clicks queue)
    participant Worker as BullMQ Worker

    Visitor->>API: GET /:shortCode
    API->>Redis: GET url:{shortCode}
    
    alt ⚡ Cache Hit (< 2ms)
        Redis-->>API: Return Cached URL JSON
    else 🐢 Cache Miss
        API->>DB: SELECT id, original_url, expires_at FROM urls WHERE short_code = $1
        DB-->>API: URL Record
        API->>Redis: SET url:{shortCode} (with TTL until expiration)
    end

    alt 🛑 URL Expired
        API-->>Visitor: HTTP 410 Gone ("This short URL has expired")
    else ✅ URL Active
        API->>Queue: add("record-click", { urlId, ip, userAgent, referrer })
        API-->>Visitor: HTTP 302 Redirect -> original_url (Instant Response)
    end

    critical 📦 Asynchronous Analytics Ingestion
        Queue->>Worker: Consume click job
        Worker->>DB: INSERT INTO url_clicks (url_id, ip_address, user_agent, referrer)
        Worker->>DB: UPDATE urls SET click_count = click_count + 1 WHERE id = urlId
    end
```

---

### 2. URL Creation & Rate Limiting Flow

Protects the API against denial-of-service and brute-force link generation using atomic Redis sliding-window counters.

```mermaid
sequenceDiagram
    autonumber
    actor Client as 👤 Authenticated Client
    participant RateLimit as RateLimiter Middleware
    participant Redis as Redis
    participant Controller as URLs Controller
    participant DB as PostgreSQL

    Client->>Controller: POST /api/urls (url, alias?, expiresAt?)
    Controller->>RateLimit: Validate quota
    RateLimit->>Redis: INCR rate-limit:user:{userId}
    Redis-->>RateLimit: Current Request Count
    
    alt ⚠️ Limit Exceeded (> 20 req / 60s)
        RateLimit-->>Client: HTTP 429 Too Many Requests (Retry-After header)
    else ✅ Within Quota
        RateLimit->>Controller: Proceed with request

        alt Custom Alias Requested
            Controller->>DB: SELECT id FROM urls WHERE short_code = $alias
            alt Alias Exists
                Controller-->>Client: HTTP 409 Conflict ("Alias is already taken")
            end
        else Auto-Generate Code
            Controller->>Controller: Generate 6-char cryptographic Base62 code
        end

        Controller->>DB: INSERT INTO urls (user_id, short_code, original_url, expires_at)
        DB-->>Controller: Created URL Row
        Controller-->>Client: HTTP 201 Created (shortUrl, shortCode, metadata)
    end
```

---

### 3. Authentication & JWT Flow

Passes signed JSON Web Tokens (7-day validity) and utilizes Bcrypt salted password hashing.

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 User
    participant Auth as Auth Router (/api/auth)
    participant DB as PostgreSQL
    participant JWT as JWT Engine

    alt 📝 Registration (POST /api/auth/register)
        User->>Auth: { name, email, password }
        Auth->>DB: Check if email exists
        Auth->>Auth: Hash password with bcrypt (salt rounds: 12)
        Auth->>DB: INSERT INTO users (name, email, password_hash)
        DB-->>Auth: User Record
        Auth-->>User: HTTP 201 Created (User info)
    else 🔑 Login (POST /api/auth/login)
        User->>Auth: { email, password }
        Auth->>DB: SELECT password_hash FROM users WHERE email = $email
        DB-->>Auth: Hash
        Auth->>Auth: bcrypt.compare(password, hash)
        alt Valid Password
            Auth->>JWT: sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
            JWT-->>Auth: Signed Token
            Auth-->>User: HTTP 200 OK (token, user profile)
        else Invalid Credentials
            Auth-->>User: HTTP 401 Unauthorized
        end
    end
```

---

## 🗄 Database Architecture

The relational schema is configured with foreign key cascades and targeted B-Tree indexes for optimal read and analytics aggregation performance.

### Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    users ||--o{ urls : "creates and owns"
    urls ||--o{ url_clicks : "tracks analytics for"

    users {
        SERIAL id PK
        VARCHAR name "User display name"
        VARCHAR email UK "Unique email address"
        VARCHAR password_hash "Bcrypt salted hash"
        TIMESTAMPTZ created_at "Registration timestamp"
    }

    urls {
        SERIAL id PK
        INTEGER user_id FK "References users(id) ON DELETE CASCADE"
        VARCHAR short_code UK "Unique 6-char code or custom alias"
        TEXT original_url "Destination target URL"
        TIMESTAMPTZ expires_at "Nullable TTL timestamp"
        INTEGER click_count "Cached total redirects counter"
        TIMESTAMPTZ created_at "Creation timestamp"
    }

    url_clicks {
        SERIAL id PK
        INTEGER url_id FK "References urls(id) ON DELETE CASCADE"
        VARCHAR ip_address "Visitor IP address (IPv4 / IPv6)"
        TEXT user_agent "Client device & browser info"
        TEXT referrer "Referring website or Direct"
        TIMESTAMPTZ clicked_at "Time of click event"
    }
```

> The database schema script is available in [backend/schema.sql](file:///d:/Software%20Engineering/Development/scalable-URL-shortener/backend/schema.sql).

---

## 📡 REST API Reference

### Base URLs
- **Local Development**: `http://localhost:5000`
- **Production**: `https://<your-backend>.onrender.com`

### 1. Authentication Endpoints

| Method | Route | Auth Required | Rate Limit | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | No | 3 / min | Register a new user account |
| `POST` | `/api/auth/login` | No | 5 / min | Login and obtain JWT token |

#### Register Payload
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "strongPassword123"
}
```

#### Login Response
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

---

### 2. URL Management Endpoints

All protected endpoints require the header: `Authorization: Bearer <token>`.

| Method | Route | Auth | Rate Limit | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/urls` | **Yes** | 20 / min | Shorten a new URL |
| `GET` | `/api/urls` | **Yes** | — | Fetch all URLs created by the authenticated user |
| `PUT` | `/api/urls/:id` | **Yes** | — | Update original URL, custom alias, or expiration date |
| `DELETE` | `/api/urls/:id` | **Yes** | — | Delete short URL and purge from Redis cache |
| `GET` | `/api/urls/:id/analytics` | **Yes** | — | Retrieve 7-day click history, top referrers, and recent clicks |
| `GET` | `/api/urls/:id/qr` | **Yes** | — | Generate Base64 Data URL QR Code |

#### Shorten URL Request Payload (`POST /api/urls`)
```json
{
  "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP",
  "alias": "mdn-http",
  "expiresAt": "2026-12-31T23:59:59Z"
}
```

---

### 3. Redirection Endpoint

| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/:shortCode` | 302 Redirect to target URL. Pushes click event to BullMQ. Returns `410 Gone` if expired. |

---

## 💻 CLI Tool Guide

The repository includes a dedicated interactive terminal utility located in `cli/`.

### Features:
- 🎨 Beautiful interactive CLI built with `inquirer`, `ora`, `chalk`, `figlet`, and `boxen`.
- ⚡ **Direct Mode**: `npx @jigyanshsahu/url-shortener-cli https://example.com`
- 💬 **Interactive Prompt Mode**: Guides the user through URL validation and shortening loops.

### Running the CLI Locally:
```bash
cd cli
npm install
npm start
```

### Running with Arguments:
```bash
node src/index.js https://github.com
```

### Publishing to npm:
```bash
cd cli
npm login
npm publish --access public
```

Once published, any developer can run it without installing:
```bash
npx @jigyanshsahu/url-shortener-cli
```

---

## 🛠 Local Development Setup

### Prerequisites
- **Node.js**: v20 or newer
- **Docker Desktop**
- **npm**

---

### Step 1: Start PostgreSQL and Redis via Docker

The repository includes a multi-service Docker configuration in `backend/docker-compose.yml`.

```bash
docker compose -f backend/docker-compose.yml up -d
```

Verify that both containers are healthy:
```bash
docker compose -f backend/docker-compose.yml ps
```

* Redis runs on `localhost:6379`.
* PostgreSQL runs on `localhost:5433` (mapped from 5432).

Initialize the database schema:
```bash
docker compose -f backend/docker-compose.yml exec -T postgres psql -U postgres -d urlshortener < backend/schema.sql
```

---

### Step 2: Configure Environment Variables

1. In `backend/.env`:
   ```env
   PORT=5000
   DATABASE_URL=postgresql://postgres:postgres@localhost:5433/urlshortener
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=super-secret-local-dev-jwt-key
   BASE_URL=http://localhost:5000
   ```

2. In `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_REDIRECT_URL=http://localhost:5000
   ```

---

### Step 3: Run the Services

Run each service in a separate terminal:

#### Terminal 1: Backend API
```bash
cd backend
npm install
npm start
```

#### Terminal 2: BullMQ Click Worker
```bash
cd backend
node src/worker.js
```

#### Terminal 3: Next.js Frontend
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Production Deployment Guide

```
Neon/Supabase (PostgreSQL)  ──┐
                              ├─► Express API & BullMQ Worker (Render) ◄── Next.js (Vercel)
Redis Cloud / Upstash       ──┘
```

### 1. Database (Neon / Supabase)
1. Provision a free PostgreSQL instance at [Neon.tech](https://neon.tech) or [Supabase](https://supabase.com).
2. Open the SQL Query Editor and execute [backend/schema.sql](file:///d:/Software%20Engineering/Development/scalable-URL-shortener/backend/schema.sql).
3. Copy the pooled connection string (`?sslmode=require`).

### 2. Redis (Redis Cloud / Railway)
1. Create a free database on [Redis Cloud](https://redis.io/try-free/).
2. Copy the endpoint URL: `redis://default:<password>@<host>:<port>`.

### 3. Backend API (Render Web Service)
1. Create a **Web Service** on Render pointing to your GitHub repository.
2. **Root Directory**: `backend`
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. **Environment Variables**:
   * `DATABASE_URL`: Your cloud PostgreSQL URL.
   * `REDIS_URL`: Your cloud Redis URL.
   * `JWT_SECRET`: Random 64-character secret.
   * `BASE_URL`: The public Render service URL (`https://your-service.onrender.com`).
   * `PORT`: `10000`

### 4. Click Tracking Worker (Render Background Worker)
1. Create a **Background Worker** on Render.
2. **Root Directory**: `backend`
3. **Build Command**: `npm install`
4. **Start Command**: `node src/worker.js`
5. **Environment Variables**: Provide the same `DATABASE_URL` and `REDIS_URL`.

### 5. Frontend (Vercel)
1. Import your repository into [Vercel](https://vercel.com).
2. **Root Directory**: `frontend`
3. **Environment Variables**:
   * `NEXT_PUBLIC_API_URL`: Your backend URL (`https://your-service.onrender.com`).
   * `NEXT_PUBLIC_REDIRECT_URL`: Your backend URL (`https://your-service.onrender.com`).
4. Deploy!

---

## 🔑 Environment Variables

| Variable | Scope | Description | Example |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Backend & Worker | PostgreSQL connection string | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `REDIS_URL` | Backend & Worker | Redis connection URI | `redis://default:pass@host:6379` |
| `JWT_SECRET` | Backend | Secret string for signing auth tokens | `f87a3e817...` |
| `PORT` | Backend | HTTP port for Express | `5000` or `10000` |
| `BASE_URL` | Backend | Root domain for generated short links | `https://api.shortener.com` |
| `NEXT_PUBLIC_API_URL` | Frontend | Target backend API origin | `https://api.shortener.com` |
| `NEXT_PUBLIC_REDIRECT_URL` | Frontend | Domain where links resolve | `https://api.shortener.com` |

---

## 🏆 Key Architectural Highlights

* **Sub-Millisecond Cache Layer**: Redirection requests check Redis memory before falling back to PostgreSQL, reducing database read load by up to 99%.
* **Asynchronous Click Ingestion**: Click analytics (IP address, user agent, referrer) are offloaded to BullMQ, guaranteeing that database writes never slow down redirection response times.
* **Distributed Sliding-Window Rate Limiting**: Built with atomic Redis operations (`INCR` + `EXPIRE`) to thwart DDoS and brute-force link creation attacks.
* **Automated Expiration Lifecycle**: A background `node-cron` job automatically purges expired links every minute, maintaining clean database tables.
* **Production-Grade Analytics**: Interactive time-series visual charts built with D3.js and smooth micro-interactions powered by GSAP.

---

## 📜 License

This project is licensed under the MIT License.