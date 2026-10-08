# 🎯 Scalable URL Shortener — 50 Interview Questions & Answers

> Based on **your actual codebase**. Every answer references real files and design decisions in your project so you can speak with confidence.

---

## 🏗️ System Design & Architecture (Q1–Q10)

### Q1. Can you give a high-level overview of your URL shortener architecture?

**Answer:** My URL shortener follows a three-tier, microservice-oriented architecture:

- **Frontend** — Next.js (React/TypeScript) served on port 3000 for the dashboard, analytics, and auth pages.
- **Backend** — Node.js + Express API server handling URL CRUD, redirection, authentication, and analytics.
- **Data Layer** — PostgreSQL for persistent storage (users, URLs, click events) and Redis for caching + rate limiting + background job queues.

In production, an **Nginx** reverse proxy sits in front, load-balancing requests across **3 backend replicas** using a `least_conn` strategy. The entire stack is containerized with Docker Compose.

---

### Q2. Why did you choose PostgreSQL over MongoDB or another NoSQL database?

**Answer:** URL shorteners have a very relational data model — a **user** owns many **URLs**, and each **URL** has many **clicks**. PostgreSQL gives me:

- **ACID transactions** — critical for ensuring a short code + URL pair is atomically inserted.
- **Unique constraints** — the `short_code` column has a `UNIQUE` constraint so two users can never get the same alias, enforced at the database level (error code `23505`).
- **Foreign keys** — `urls.user_id` references `users.id`, and `url_clicks.url_id` references `urls.id`, so I get referential integrity for free.
- **Rich querying** — the analytics endpoint needs `GROUP BY`, `DATE()`, `COUNT()`, and `INTERVAL` queries, which are natural in SQL.

---

### Q3. Why Redis? What problems does it solve in your system?

**Answer:** Redis serves **three distinct purposes** in this project:

1. **Caching (Cache-Aside)** — On each redirect (`GET /:shortCode`), I check Redis first. If the URL is cached, I skip PostgreSQL entirely, reducing latency from ~5ms to <1ms.
2. **Rate Limiting** — I use Redis `INCR` + `EXPIRE` for a sliding-window rate limiter. Each IP/user gets a counter key like `rate-limit:ip:192.168.1.1` that auto-expires.
3. **Background Job Queue** — BullMQ (built on Redis) powers the click-tracking queue. Redirect responses are sent immediately; click analytics are recorded asynchronously by a worker.

---

### Q4. Explain the flow when a user clicks a short URL end-to-end.

**Answer:**

1. **Request hits Nginx** → Nginx matches the path against `^/([a-zA-Z0-9_-]{3,50})$` and proxies it to one of the 3 backend instances via `least_conn`.
2. **Backend checks Redis** → Key: `url:{shortCode}`. If found (**Cache HIT**), parse the JSON and check the `expires_at` field.
3. **If Cache MISS** → Query PostgreSQL: `SELECT id, original_url, expires_at FROM urls WHERE short_code = $1`.
4. **Cache the result** → `redis.set(cacheKey, JSON.stringify(url), { EX: ttl })` with a dynamic TTL (remaining time until expiry, or 3600s default).
5. **Enqueue click event** → Push `{ urlId, ipAddress, userAgent, referrer }` to the BullMQ `clicks` queue. This does NOT block the response.
6. **302 Redirect** → `res.redirect(url.original_url)`.
7. **Worker processes click** → In a separate worker, the job inserts into `url_clicks` and increments `urls.click_count`.

---

### Q5. How does your system handle URL expiration?

**Answer:** Expiration is handled at **three levels**:

1. **At redirect time** — Both the Redis cache check and the PostgreSQL fallback compare `expires_at` against `new Date()`. If expired, the user gets a `410 Gone` response.
2. **Redis TTL** — When caching a URL that has an `expires_at`, the TTL is set to `Math.max(1, secondsUntilExpiration)` so Redis automatically evicts it when it expires.
3. **Cron job cleanup** — A `node-cron` job runs every minute: `DELETE FROM urls WHERE expires_at IS NOT NULL AND expires_at <= NOW()`, permanently removing expired rows from the database.

---

### Q6. How do you handle duplicate URLs?

**Answer:** When a user creates a new short URL (`POST /api/urls`), before generating a short code, I query:

```sql
SELECT id, short_code, original_url, expires_at
FROM urls
WHERE user_id = $1 AND original_url = $2
```

If a row exists, I return the **existing** shortened URL with a message `"URL already exists"` instead of creating a duplicate. This is scoped **per user** — two different users can shorten the same URL and each gets their own short code. This keeps the system **idempotent** and prevents wasting short codes.

---

### Q7. How does the load balancer work in your production setup?

**Answer:** I use **Nginx** as a reverse proxy and load balancer. The config defines an upstream pool:

```nginx
upstream backend_pool {
    least_conn;
    server backend-1:5001;
    server backend-2:5002;
    server backend-3:5003;
    keepalive 32;
}
```

- **`least_conn`** — Routes each request to the backend with the fewest active connections. This is better than round-robin for I/O-bound work because some requests (e.g., analytics queries) take longer than simple redirects.
- **`keepalive 32`** — Maintains 32 persistent HTTP connections to each backend to avoid TCP handshake overhead.
- **Route Splitting** — Nginx routes `/api/*` to backends, known frontend paths (`/login`, `/dashboard`, etc.) to the Next.js container, and short-code patterns (`/[a-zA-Z0-9_-]{3,50}`) to backends.

---

### Q8. What is the difference between `redis` (node-redis) and `ioredis` in your project? Why do you use both?

**Answer:** This is a practical consequence of library compatibility:

- **`redis` (node-redis v4)** — Used in [`redis.js`](file:///d:/Software%20Engineering/Development/scalable-URL-shortener/backend/src/redis.js) for the application-level cache (`GET`, `SET`, `DEL`) and rate limiting (`INCR`, `EXPIRE`, `TTL`).
- **`ioredis`** — Used in [`redisConnection.js`](file:///d:/Software%20Engineering/Development/scalable-URL-shortener/backend/src/queues/redisConnection.js) specifically for **BullMQ**, because BullMQ requires an `ioredis`-compatible client. BullMQ internally uses Redis features like Lua scripting and blocking commands that are better supported by ioredis.

Both connect to the same Redis instance, but they serve different layers of the stack.

---

### Q9. How would you scale this system to handle millions of requests per day?

**Answer:** The architecture is already designed for horizontal scaling:

1. **Stateless backends** — All state lives in PostgreSQL and Redis, so I can spin up N backend containers behind Nginx.
2. **Redis caching** — Popular URLs get served from memory without hitting the database.
3. **Background workers** — Click tracking is decoupled via BullMQ. I can scale workers independently.
4. **Database scaling** — Add read replicas for analytics queries; partition the `url_clicks` table by date.
5. **Redis Cluster** — For caching at scale, switch to a Redis Cluster with sharding.
6. **CDN** — Put a CDN (e.g., CloudFront) in front for the most popular redirects.
7. **Short code generation** — The current random approach could be replaced with a pre-generated ID pool or a distributed ID service (like Twitter Snowflake) to avoid collisions at scale.

---

### Q10. What trade-offs did you make in this architecture?

**Answer:**

| Decision | Trade-off |
|---|---|
| Cache-aside over write-through | Simpler to implement, but the first request after cache expiry is slower |
| Random short codes (`Math.random`) | Simple and fast, but not cryptographically secure and has a (tiny) collision risk |
| Separate click worker | Faster redirects, but click counts are eventually consistent (small delay) |
| Per-user duplicate check | Prevents waste, but two users can shorten the same URL to different codes |
| `least_conn` load balancing | Better for mixed workloads, but slightly more complex than round-robin |

---

## 🔐 Authentication & Security (Q11–Q20)

### Q11. How does authentication work in your system?

**Answer:** I use **JWT (JSON Web Tokens)** with a dual-delivery mechanism:

1. **Registration/Login** — The server hashes the password with `bcrypt` (12 salt rounds), generates a JWT signed with `process.env.JWT_SECRET` (expires in 7 days), and sends it **both** as an `httpOnly` cookie and in the JSON response body.
2. **Subsequent requests** — The `authenticateToken` middleware checks:
   - First: `Authorization: Bearer <token>` header
   - Fallback: `req.cookies.token`
3. **Verification** — The middleware doesn't just verify the JWT signature; it also queries the database to confirm the user still exists (`SELECT id, name, email FROM users WHERE id = $1`).

---

### Q12. Why do you verify the user exists in the database on every request? Isn't the JWT enough?

**Answer:** The JWT proves the token was once valid, but it **can't** tell me if:

- The user's account was deleted after the token was issued.
- The user was banned or deactivated.

By querying the database, I ensure that a deleted user's token is immediately invalidated, rather than remaining valid until it naturally expires in 7 days. This is a **security-first** design choice. The trade-off is an extra DB query per authenticated request, which could be optimized later with a Redis user-session cache.

---

### Q13. Why did you use bcrypt with 12 salt rounds?

**Answer:** Bcrypt is a deliberately slow hashing algorithm designed for passwords. The `12` cost factor means `2^12 = 4096` iterations of the key derivation function. This makes brute-force attacks computationally expensive (~250ms per hash on modern hardware). Lower values (e.g., 10) are faster but less secure; higher values (e.g., 14) are more secure but add noticeable latency to login/register.

---

### Q14. Explain the cookie settings you use for the JWT token.

**Answer:**
```js
res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
});
```

- **`httpOnly: true`** — JavaScript cannot access the cookie via `document.cookie`. This prevents XSS attacks from stealing the token.
- **`secure: true` (production)** — Cookie is only sent over HTTPS.
- **`sameSite: "strict"`** — Cookie is never sent on cross-site requests. This mitigates CSRF attacks.
- **`maxAge: 7 days`** — Matches the JWT expiry for consistency.

---

### Q15. How does your rate limiter work?

**Answer:** I built a custom Redis-based rate limiter using the **Fixed Window Counter** pattern:

1. On each request, I compute a key: `rate-limit:ip:{ip}` or `rate-limit:user:{userId}`.
2. Call `redis.incr(key)` — atomically increments the counter.
3. If this is the **first request** (`count === 1`), set `redis.expire(key, windowSeconds)` to start the window timer.
4. If `count > limit`, return `429 Too Many Requests` with a `retryAfter` header (remaining TTL).
5. On success, I set `X-RateLimit-Limit` and `X-RateLimit-Remaining` response headers so clients know their quota.

**Fail-open design:** If Redis is temporarily unavailable, the middleware calls `next()` instead of blocking — availability is prioritized over strict rate enforcement.

---

### Q16. What are the rate limits you've configured and why?

**Answer:**

| Endpoint | Limit | Window | Reason |
|---|---|---|---|
| `POST /api/auth/login` | 5 | 60s | Prevent brute-force password attacks |
| `POST /api/auth/register` | 3 | 60s | Prevent spam account creation |
| `POST /api/urls` | 20 | 60s | Prevent URL generation abuse |
| `POST /api/urls/public` | 10 | 60s | Stricter limit for unauthenticated users |

The login limit is the most critical — 5 attempts per minute makes credential stuffing impractical while still being user-friendly.

---

### Q17. How do you prevent SQL injection?

**Answer:** Every database query uses **parameterized queries** with `$1, $2, ...` placeholders:

```js
const result = await pool.query(
    `SELECT id, short_code FROM urls WHERE short_code = $1`,
    [shortCode]
);
```

The `pg` library handles escaping and type-casting. User input **never** touches the SQL string directly. Additionally, custom aliases are validated with a regex (`/^[a-zA-Z0-9_-]+$/`) before they even reach the database.

---

### Q18. What happens if a user sends a malicious custom alias?

**Answer:** Multi-layered validation:

1. **Regex check** — `alias` must match `/^[a-zA-Z0-9_-]+$/`. Special characters, spaces, SQL keywords, etc. are rejected.
2. **Length check** — Must be between 3 and 30 characters.
3. **Uniqueness check** — Query the database to ensure no other URL uses this alias.
4. **DB constraint** — Even if all checks are bypassed, the `UNIQUE` constraint on `short_code` column will throw error code `23505`, which is caught and returns `409 Conflict`.

This is **defense-in-depth** — multiple independent layers prevent the same attack.

---

### Q19. How does the frontend handle authentication state?

**Answer:** The frontend uses a React Context (`AuthProvider`) with the following approach:

1. **Initial state** — Both `token` and `user` start as `null` (avoids SSR hydration mismatch in Next.js).
2. **On mount** — A `useEffect` reads `localStorage` for stored credentials (`linkly_auth_token`, `linkly_auth_user`).
3. **Login** — The `login()` function sets React state AND persists to `localStorage`.
4. **Logout** — Clears React state, `localStorage`, and fires a `POST /api/auth/logout` to clear the httpOnly cookie.
5. **Loading state** — `isLoading` is `true` until `useEffect` completes, preventing flashes of unauthenticated UI.

---

### Q20. Why do you return the same error message for invalid email AND invalid password during login?

**Answer:**
```js
res.status(401).json({ error: "Invalid email or password" });
```

This is a deliberate security practice called **error message normalization**. If I said "email not found" vs "wrong password," an attacker could **enumerate valid email addresses** by trying random emails and observing which error they get. By returning the same message for both cases, I reveal nothing about whether the email exists in the system.

---

## 🗄️ Redis & Caching (Q21–Q30)

### Q21. Explain the Cache-Aside pattern you implemented.

**Answer:** Cache-Aside (also called Lazy Loading) means the application manages the cache explicitly:

1. **Read:** Check cache first → if miss, read from DB → write result to cache → return data.
2. **Write/Update/Delete:** Write to DB → invalidate (delete) the cache key.

I chose this over Write-Through because:
- Not every shortened URL gets clicked frequently — no point pre-caching everything.
- The cache naturally fills with **hot data** (frequently accessed URLs).
- Cache misses are rare after the first access of a popular link.

---

### Q22. How do you calculate the TTL for cached URLs?

**Answer:**
```js
let ttl = 3600; // Default: 1 hour
if (url.expires_at) {
    const secondsUntilExpiration = Math.floor(
        (new Date(url.expires_at).getTime() - Date.now()) / 1000
    );
    ttl = Math.max(1, secondsUntilExpiration);
}
```

- **No expiry set** → Cache for 1 hour (3600s). This prevents stale data from lingering indefinitely while keeping popular links fast.
- **Expiry set** → Cache for exactly the remaining lifetime. `Math.max(1, ...)` ensures we never set a TTL of 0 or negative.

This is smart because the cache **automatically evicts** the URL at the exact same time it logically expires.

---

### Q23. What happens if the cached data becomes stale?

**Answer:** I handle staleness through **active invalidation**:

- **URL deleted** → `redis.del(`url:${shortCode}`)` is called immediately in the DELETE handler.
- **URL updated** → The old cache key is deleted, and if the alias changed, the new key is also deleted.
- **URL expired** → The Redis TTL is aligned with `expires_at`, so Redis auto-evicts it. Additionally, the redirect handler double-checks expiration on cache hits.

The worst case is a 1-hour stale window for URLs without an `expires_at` — the user would need to delete the URL, and someone would need to access it within the remaining TTL. Even then, the click would go to the correct original URL that existed at cache time.

---

### Q24. What data structure does Redis use to store your cached URLs?

**Answer:** I store each URL as a **JSON-serialized string** under the key `url:{shortCode}`:

```
Key:   url:abc123
Value: {"id":42,"original_url":"https://example.com","expires_at":"2026-12-31T00:00:00Z"}
TTL:   3600
```

I chose a simple string (not a Redis Hash) because:
- The data is always read/written as a complete unit — I never need to update a single field.
- JSON serialization/deserialization is trivial in Node.js.
- A Redis Hash would add complexity with no benefit for this access pattern.

---

### Q25. What happens to the redirect endpoint if Redis goes down?

**Answer:** The redirect still works — it falls back to PostgreSQL. The flow is:

1. `redis.get(cacheKey)` throws an error.
2. The `catch` block logs the error and returns a 500.

**However**, this is a potential improvement area. Ideally, I'd wrap the Redis call in a try-catch and fall back to the DB query on Redis failure, making the system more resilient. The rate limiter already follows this pattern — if Redis is down, it calls `next()` instead of blocking.

---

### Q26. How does Redis help with rate limiting specifically?

**Answer:** Redis is perfect for rate limiting because:

1. **`INCR` is atomic** — Even under concurrent requests, the counter is accurate without race conditions.
2. **`EXPIRE` handles window reset** — I don't need to manually clean up old counters; Redis does it.
3. **Sub-millisecond speed** — Rate limit checks add virtually no latency.
4. **Shared state** — With 3 backend instances behind Nginx, all of them share the same Redis counters. Without Redis, each backend would track rates independently, and a user could get 3× the intended limit.

---

### Q27. Could you use Redis as your primary database instead of PostgreSQL?

**Answer:** No, and here's why:

- **Data durability** — Redis is primarily in-memory. Even with AOF persistence (`--appendonly yes` in my Docker config), it's not as reliable as PostgreSQL's WAL.
- **Complex queries** — Analytics needs `GROUP BY date`, `JOIN`, `COUNT`, etc. Redis doesn't support relational queries.
- **Storage cost** — URLs and click data grow indefinitely. RAM is 10–50× more expensive than SSD.
- **ACID compliance** — I need foreign keys and unique constraints enforced at the database level.

Redis is the **fast lane**; PostgreSQL is the **source of truth**.

---

### Q28. What is the `--appendonly yes` flag in your Redis Docker config?

**Answer:** It enables **AOF (Append-Only File)** persistence. Every write command is appended to a log file on disk. If Redis crashes and restarts, it replays the AOF to restore the dataset. Without it, all cached data would be lost on restart.

For a URL shortener cache, this is a nice-to-have rather than critical — the cache will rebuild itself naturally. But it prevents a "cold cache stampede" after a restart, where all requests would hit PostgreSQL simultaneously.

---

### Q29. What is a cache stampede and how would you prevent it?

**Answer:** A cache stampede (or thundering herd) happens when a popular cached key expires and hundreds of concurrent requests all experience a cache miss simultaneously, all hitting the database at once.

**Prevention strategies:**

1. **Locking** — Use a Redis `SETNX` lock so only one request fetches from the DB; others wait.
2. **Stale-while-revalidate** — Serve slightly stale data while one request refreshes the cache.
3. **Jittered TTLs** — Add randomness to TTLs so keys don't all expire at the same time.
4. **Pre-warming** — For known popular URLs, refresh the cache before it expires.

My current implementation doesn't handle this, but it's unlikely to be an issue unless a single URL gets thousands of concurrent requests per second.

---

### Q30. How would you monitor Redis cache hit/miss ratio in production?

**Answer:** Several approaches:

1. **Application-level metrics** — I already log `"Redis HIT"` and `"Redis MISS"`. I'd replace console.log with a metrics library (e.g., Prometheus counter) and track `cache_hits_total` and `cache_misses_total`.
2. **Redis INFO command** — `redis-cli INFO stats` shows `keyspace_hits` and `keyspace_misses` natively.
3. **Grafana dashboard** — Visualize hit ratio over time: `hits / (hits + misses) * 100`.

A healthy cache should have >90% hit ratio for redirect endpoints.

---

## ⚡ Background Jobs & Workers (Q31–Q37)

### Q31. Why do you process clicks in a background worker instead of inline?

**Answer:** The redirect endpoint is the **most latency-sensitive** part of the system. If I wrote click data to PostgreSQL synchronously, each redirect would take an extra 5-10ms for:

1. `INSERT INTO url_clicks (...)` — Write the click record.
2. `UPDATE urls SET click_count = click_count + 1` — Increment the counter.

By pushing this to BullMQ, the redirect responds in <1ms (Redis-only path), and the worker handles the DB writes asynchronously. The user doesn't care if their click is recorded 100ms later — they just want a fast redirect.

---

### Q32. How does BullMQ work in your project?

**Answer:** BullMQ is a Node.js job queue built on Redis:

1. **Producer** ([`server.js`](file:///d:/Software%20Engineering/Development/scalable-URL-shortener/backend/src/server.js)) — On each redirect, calls `clickQueue.add("record-click", { urlId, ipAddress, userAgent, referrer })` to enqueue a job.
2. **Queue** ([`clickQueue.js`](file:///d:/Software%20Engineering/Development/scalable-URL-shortener/backend/src/queues/clickQueue.js)) — The `clicks` queue is configured with 3 retry attempts, exponential backoff (1s, 2s, 4s), auto-removal on success, and retention on failure.
3. **Consumer/Worker** ([`worker.js`](file:///d:/Software%20Engineering/Development/scalable-URL-shortener/backend/src/worker.js)) — A worker with **concurrency 10** processes jobs: inserts into `url_clicks` and increments the `click_count`.

---

### Q33. What does `concurrency: 10` mean on the worker?

**Answer:** It means the worker can process up to **10 jobs in parallel**. Without it, jobs are processed one at a time (concurrency 1). With 10, the worker can handle bursts of traffic by running 10 database inserts concurrently.

The value 10 is a balance — too low wastes throughput, too high could overwhelm the PostgreSQL connection pool.

---

### Q34. What happens if the worker crashes while processing a click?

**Answer:** BullMQ handles this with its retry mechanism:

```js
defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: true,
    removeOnFail: false,
}
```

- The job is retried up to **3 times** with **exponential backoff** (1s, 2s, 4s).
- On success, the job is removed from Redis (`removeOnComplete: true`).
- On permanent failure, the job is **kept** (`removeOnFail: false`) for debugging/manual replay.
- BullMQ uses Redis `BRPOPLPUSH` internally — if the worker crashes mid-processing, the job returns to the queue automatically.

---

### Q35. Is the `click_count` in the `urls` table eventually consistent?

**Answer:** Yes, it's **eventually consistent**. There's a small delay (usually <100ms) between the redirect and the click count being updated. This is acceptable because:

- Users don't expect real-time click counts to the millisecond.
- The analytics page shows the most recent data on each page load.
- The trade-off is significantly faster redirects (the core feature).

If I needed strong consistency, I'd increment the count inline, but that would add ~5ms to every redirect.

---

### Q36. How does the cron job for expired URL cleanup work?

**Answer:** I use `node-cron` to schedule a task every minute:

```js
cron.schedule("* * * * *", () => {
    cleanupExpiredUrls();
});
```

The cleanup function runs:
```sql
DELETE FROM urls
WHERE expires_at IS NOT NULL AND expires_at <= NOW()
RETURNING id
```

It logs how many rows were deleted. This is a **garbage collection** mechanism — even though expired URLs are rejected at redirect time, this keeps the database lean. The `RETURNING id` clause lets me log how many URLs were cleaned up.

---

### Q37. Why not just rely on the redirect-time expiration check instead of the cron job?

**Answer:** The redirect-time check prevents users from reaching expired URLs, but it doesn't clean the database. Without the cron job:

- The `urls` table grows indefinitely with dead rows.
- Queries like `SELECT ... FROM urls WHERE user_id = $1` scan expired rows, slowing down the dashboard.
- The user would see expired URLs in their dashboard list.

The cron job is the "janitor" — it keeps the database clean and fast.

---

## 🔑 URL Shortening Logic (Q38–Q44)

### Q38. How do you generate short codes?

**Answer:** I use a random alphanumeric string generator:

```js
const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
// 62 chars, length 6 = 62^6 = ~56.8 billion combinations
```

For a 6-character code, there are **62^6 ≈ 56.8 billion** possible combinations. At 1 million URLs/day, it would take ~155 years to exhaust the namespace.

---

### Q39. What are the risks of using `Math.random()` for code generation?

**Answer:**

1. **Not cryptographically secure** — `Math.random()` is a PRNG (pseudo-random number generator). It's predictable if an attacker can observe enough outputs. For a short code, this is acceptable — guessing a valid code isn't a security issue since short URLs are meant to be shared publicly.
2. **Collision risk** — Though astronomically low (1 in 56.8 billion per code), collisions are possible. The `UNIQUE` constraint on `short_code` would catch this with error `23505`, but the current code doesn't retry on collision.

**Improvement:** Use `crypto.randomBytes()` for cryptographic randomness, and add a retry loop on collision.

---

### Q40. How do custom aliases work?

**Answer:** Users can optionally provide an `alias` instead of getting a random code:

1. **Validation** — Must match `/^[a-zA-Z0-9_-]+$/` and be 3–30 characters.
2. **Uniqueness** — Checked against the `urls` table: `SELECT id FROM urls WHERE short_code = $1`.
3. **If available** — Used as the `short_code` directly.
4. **If taken** — Returns `409 Conflict: "Alias is already taken"`.

This gives power users branded links like `example.com/my-portfolio` while keeping the system safe from injection.

---

### Q41. What PostgreSQL error codes do you handle and why?

**Answer:**

| Code | Meaning | Scenario | Response |
|---|---|---|---|
| `23505` | Unique violation | Short code or alias collision | `409 Conflict` |
| `23503` | Foreign key violation | User was deleted while creating a URL | `401 Unauthorized` |

These are caught in the `catch` block of the URL creation endpoint. Error `23505` is a last-resort defense against race conditions — even if two requests pass the uniqueness check simultaneously, the database constraint ensures only one succeeds.

---

### Q42. How does the URL update flow handle alias changes?

**Answer:** The `PUT /api/urls/:id` endpoint:

1. Validates the new alias (same regex + length rules).
2. Checks if another URL already uses this alias: `SELECT id FROM urls WHERE short_code = $1 AND id != $2` (excludes the current URL).
3. Updates the row: `UPDATE urls SET original_url = $1, short_code = $2, expires_at = $3 WHERE id = $4 AND user_id = $5`.
4. **Cache invalidation** — Deletes the **old** alias cache key. If the alias changed, also deletes the **new** alias cache key (in case it was cached from a previous URL that used it).

This ensures the redirect cache is never stale after an update.

---

### Q43. Why do you check `user_id` in almost every query?

**Answer:** This is **row-level authorization**. Even though the `authenticateToken` middleware confirms the user is logged in, it doesn't prevent them from accessing another user's URLs. By adding `AND user_id = $2` to every query, I ensure:

- User A can't delete User B's URL by guessing the ID.
- User A can't view User B's analytics.
- User A can't update User B's alias.

This is a **zero-trust** approach at the data access layer.

---

### Q44. What's the purpose of the public URL shortening endpoint?

**Answer:** `POST /api/urls/public` allows unauthenticated URL shortening (for CLI users or guests):

- No `authenticateToken` middleware — anyone can use it.
- No `user_id` — the URL is inserted without an owner.
- Stricter rate limit (10/minute vs 20/minute for authenticated users).
- No duplicate detection — since there's no user context to scope it.

This is useful for a CLI tool or quick one-off shortening without requiring an account.

---

## 🐳 DevOps & Infrastructure (Q45–Q50)

### Q45. Explain your Docker Compose setup for production.

**Answer:** The `docker-compose.lb.yml` defines a complete production stack:

- **PostgreSQL 17** — Primary database with health checks and schema auto-initialization.
- **Redis 7** — With AOF persistence and health checks.
- **3 Backend replicas** — Each on a different port (5001, 5002, 5003), built from the same Dockerfile.
- **Next.js Frontend** — Production build served internally on port 3000.
- **Nginx** — The only public-facing container (port 80), reverse-proxying to all services.

A YAML anchor (`x-backend-base: &backend-base`) is used to DRY up the backend service config — all 3 replicas share the same build context, env file, network, and dependencies.

---

### Q46. How does Nginx know which requests go to the backend vs frontend?

**Answer:** The Nginx config uses **location blocks with regex matching**, evaluated in priority order:

1. `/api/` → Backend pool (REST API).
2. `~* ^/(register|login|dashboard|analytics|links|_next)(/.*)?$` → Frontend (known Next.js routes).
3. `~* ^/([a-zA-Z0-9_-]{3,50})$` → Backend pool (short code redirects).
4. `/` → Frontend (catch-all for any other page).

The short code regex is placed **after** the frontend routes to prevent URLs like `/login` from being treated as a short code.

---

### Q47. What is the `keepalive` directive in your Nginx upstream?

**Answer:** `keepalive 32` tells Nginx to maintain a pool of 32 **persistent HTTP connections** to each backend. Without it, Nginx opens a new TCP connection for every proxied request, adding ~1ms for the TCP handshake + overhead.

The `proxy_http_version 1.1` and `Connection ""` headers are required for Nginx to use HTTP/1.1 keep-alive connections with upstreams (by default, Nginx uses HTTP/1.0 for proxied requests).

---

### Q48. How did you load-test your system?

**Answer:** I wrote a **k6 load test** (`load-test.js`) that simulates users clicking short URLs:

- **Custom metrics** — Error rate, redirect success rate, timeout count, and redirect duration.
- **Thresholds** — p95 latency < 2s, error rate < 10%, redirect success > 80%.
- **No redirect following** — `redirects: 0` measures the 302 response time, not the destination page load.
- **Scalable VUs** — Can test from 50 to 1000 virtual users:
  ```bash
  k6 run --vus 500 --duration 60s load-test.js
  ```

The test produces a summary showing total requests, RPS, p50/p95/p99 latencies, and error rates.

---

### Q49. Why does your database config check for `localhost` to decide on SSL?

**Answer:**
```js
const isLocal = !connectionString ||
    connectionString.includes("localhost") ||
    connectionString.includes("127.0.0.1") ||
    connectionString.includes("@postgres:");
const pool = new Pool({
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false },
});
```

- **Local/Docker** — SSL is disabled because the connection is over a trusted network (localhost or Docker bridge).
- **Cloud (e.g., Supabase, Neon)** — SSL is enabled but with `rejectUnauthorized: false` because cloud providers often use self-signed certificates that Node.js wouldn't trust by default.
- The `@postgres:` check covers Docker Compose, where the service name is `postgres`.

---

### Q50. If you had to redesign this project from scratch, what would you change?

**Answer:**

1. **Use `crypto.randomBytes()`** instead of `Math.random()` for code generation — more secure and uniform distribution.
2. **Add a retry loop** on short code collision instead of failing immediately.
3. **Wrap Redis calls in try-catch** in the redirect handler for graceful degradation.
4. **Add refresh tokens** — Currently JWTs last 7 days with no refresh mechanism. A short-lived access token + long-lived refresh token is more secure.
5. **Add request ID tracking** — Assign a UUID to each request and propagate it through logs for distributed tracing.
6. **Use database connection pooling** like PgBouncer for better connection management at scale.
7. **Add integration tests** — Currently there are no automated tests. I'd add tests for the redirect flow, auth flow, and rate limiter.
8. **Separate the worker** into its own process/container — currently it's imported directly into the server process, meaning a worker crash could take down the API.

---

> 💡 **Tip for the interview:** Don't just memorize these. Open the actual files and walk through the code. Interviewers love it when you say *"Let me show you how this actually works in the code..."*
