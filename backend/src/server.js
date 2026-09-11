import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";
import pool from "./db.js";
import generateCode from "./utils/generateCode.js";
import authenticateToken from "./middleware/auth.js";
import authRoutes from "./routes/auth.js";
import cleanupExpiredUrls from "./jobs/cleanupExpiredUrls.js";
import { redis, connectRedis } from "./redis.js";
import clickQueue from "./queues/clickQueue.js";
import { rateLimit } from "./middleware/rateLimit.js";
import QRCode from "qrcode";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use(
    "/api/auth/login",
    rateLimit({
        limit: 5,
        windowSeconds: 60,
    })
);
app.use(
    "/api/auth/register",
    rateLimit({
        limit: 3,
        windowSeconds: 60,
    })
);
app.use(
    "/api/urls",
    rateLimit({
        limit: 20,
        windowSeconds: 60,
    })
);
app.use("/api/auth", authRoutes);
cron.schedule("* * * * *", () => {
    cleanupExpiredUrls();
});
app.get("/", (req, res) => {
    res.json({
        message: "URL Shortener API is running",
    });
});

app.get("/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            message: "Database connected",
            time: result.rows[0].now,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Database connection failed",
        });
    }
});

app.post("/api/urls", authenticateToken,
     rateLimit({
        limit: 20,
        windowSeconds: 60,
    }),
    async (req, res) => {
    try {
        const { url, expiresAt, alias } = req.body;
        const userId = req.user.userId;

        if (!url) {
            return res.status(400).json({
                error: "URL is required"
            });
        }

        // Validate expiration
        if (expiresAt) {
            const expirationDate = new Date(expiresAt);

            if (isNaN(expirationDate.getTime())) {
                return res.status(400).json({
                    error: "Invalid expiration date"
                });
            }

            if (expirationDate <= new Date()) {
                return res.status(400).json({
                    error: "Expiration date must be in the future"
                });
            }
        }

        // Validate custom alias
        if (alias) {
            const aliasRegex = /^[a-zA-Z0-9_-]+$/;

            if (!aliasRegex.test(alias)) {
                return res.status(400).json({
                    error: "Alias can only contain letters, numbers, hyphens and underscores"
                });
            }

            if (alias.length < 3 || alias.length > 30) {
                return res.status(400).json({
                    error: "Alias must be between 3 and 30 characters"
                });
            }
        }

        // Check if this URL already exists for this user
        const existingUrl = await pool.query(
            `SELECT id, short_code, original_url, expires_at
             FROM urls
             WHERE user_id = $1
             AND original_url = $2`,
            [userId, url]
        );

        if (existingUrl.rows.length > 0) {
            return res.json({
                message: "URL already exists",
                url: existingUrl.rows[0]
            });
        }

        let shortCode;

        // Custom alias
        if (alias) {
            const existingAlias = await pool.query(
                `SELECT id
                 FROM urls
                 WHERE short_code = $1`,
                [alias]
            );

            if (existingAlias.rows.length > 0) {
                return res.status(409).json({
                    error: "Alias is already taken"
                });
            }

            shortCode = alias;

        } else {
            // Generate random short code
            shortCode = generateCode(6);
        }

        const result = await pool.query(
            `INSERT INTO urls
                (user_id, short_code, original_url, expires_at)
             VALUES
                ($1, $2, $3, $4)
             RETURNING id, short_code, original_url, expires_at`,
            [
                userId,
                shortCode,
                url,
                expiresAt ? new Date(expiresAt) : null
            ]
        );

        res.status(201).json({
            message: "URL shortened successfully",
            url: result.rows[0]
        });

    } catch (error) {
        console.error("CREATE URL ERROR:", error);

        res.status(500).json({
            error: "Failed to create URL"
        });
    }
});

app.get("/api/urls", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            `SELECT id, short_code, original_url, expires_at, created_at, click_count
             FROM urls
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error("FETCH URLS ERROR:", error);
        res.status(500).json({
            error: "Failed to fetch URLs"
        });
    }
});

app.delete("/api/urls/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const result = await pool.query(
            `DELETE FROM urls
             WHERE id = $1 AND user_id = $2
             RETURNING id, short_code, original_url`,
            [id, userId]
        );
        await redis.del(`url:${result.rows[0].short_code}`);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "URL not found"
            });
        }

        res.json({
            message: "URL deleted successfully",
            url: result.rows[0]
        });

    } catch (error) {
        console.error("DELETE URL ERROR:", error);

        res.status(500).json({
            error: "Failed to delete URL"
        });
    }
});
app.put("/api/urls/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { url, expiresAt, alias } = req.body;
        const userId = req.user.userId;

        if (!url) {
            return res.status(400).json({
                error: "URL is required"
            });
        }

        // Validate expiration
        if (expiresAt) {
            const expirationDate = new Date(expiresAt);

            if (isNaN(expirationDate.getTime())) {
                return res.status(400).json({
                    error: "Invalid expiration date"
                });
            }

            if (expirationDate <= new Date()) {
                return res.status(400).json({
                    error: "Expiration date must be in the future"
                });
            }
        }

        // Validate alias
        if (alias) {
            const aliasRegex = /^[a-zA-Z0-9_-]+$/;

            if (!aliasRegex.test(alias)) {
                return res.status(400).json({
                    error: "Invalid alias"
                });
            }

            if (alias.length < 3 || alias.length > 30) {
                return res.status(400).json({
                    error: "Alias must be between 3 and 30 characters"
                });
            }
        }

        // If alias is provided, check whether another URL uses it
        if (alias) {
            const aliasCheck = await pool.query(
                `SELECT id
                 FROM urls
                 WHERE short_code = $1
                 AND id != $2`,
                [alias, id]
            );

            if (aliasCheck.rows.length > 0) {
                return res.status(409).json({
                    error: "Alias is already taken"
                });
            }
        }

        // Make sure this URL belongs to the logged-in user
        const existingUrl = await pool.query(
            `SELECT id
             FROM urls
             WHERE id = $1
             AND user_id = $2`,
            [id, userId]
        );

        if (existingUrl.rows.length === 0) {
            return res.status(404).json({
                error: "URL not found"
            });
        }

        // Keep existing alias if no alias was provided
        const currentUrl = await pool.query(
            `SELECT short_code
             FROM urls
             WHERE id = $1`,
            [id]
        );

        const shortCode = alias || currentUrl.rows[0].short_code;

        const result = await pool.query(
            `UPDATE urls
             SET original_url = $1,
                 short_code = $2,
                 expires_at = $3
             WHERE id = $4
             AND user_id = $5
             RETURNING id, short_code, original_url,
                       expires_at, click_count`,
            [
                url,
                shortCode,
                expiresAt ? new Date(expiresAt) : null,
                id,
                userId
            ]
        );

        res.json({
            message: "URL updated successfully",
            url: result.rows[0]
        });

    } catch (error) {
        console.error("UPDATE URL ERROR:", error);

        res.status(500).json({
            error: "Failed to update URL"
        });
    }
});
app.get(
    "/api/urls/:id/analytics",
    authenticateToken,
    async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.userId;

            // Check ownership
            const urlResult = await pool.query(
                `SELECT id, short_code, original_url,
                        click_count, created_at, expires_at
                 FROM urls
                 WHERE id = $1
                 AND user_id = $2`,
                [id, userId]
            );

            if (urlResult.rows.length === 0) {
                return res.status(404).json({
                    error: "URL not found"
                });
            }

            const url = urlResult.rows[0];

            // 1. Clicks today
            const todayResult = await pool.query(
                `SELECT COUNT(*) AS clicks_today
                 FROM url_clicks
                 WHERE url_id = $1
                 AND clicked_at >= CURRENT_DATE`,
                [id]
            );

            // 2. Clicks by day - last 7 days
            const dailyResult = await pool.query(
                `SELECT
                    DATE(clicked_at) AS date,
                    COUNT(*) AS clicks
                 FROM url_clicks
                 WHERE url_id = $1
                 AND clicked_at >= CURRENT_DATE - INTERVAL '6 days'
                 GROUP BY DATE(clicked_at)
                 ORDER BY date`,
                [id]
            );

            // 3. Top referrers
            const referrerResult = await pool.query(
                `SELECT
                    COALESCE(referrer, 'Direct') AS referrer,
                    COUNT(*) AS clicks
                 FROM url_clicks
                 WHERE url_id = $1
                 GROUP BY referrer
                 ORDER BY clicks DESC
                 LIMIT 10`,
                [id]
            );

            // 4. Recent clicks
            const recentClicksResult = await pool.query(
                `SELECT
                    clicked_at,
                    ip_address,
                    user_agent,
                    referrer
                 FROM url_clicks
                 WHERE url_id = $1
                 ORDER BY clicked_at DESC
                 LIMIT 20`,
                [id]
            );

            res.json({
                url: {
                    id: url.id,
                    shortCode: url.short_code,
                    originalUrl: url.original_url,
                    totalClicks: Number(url.click_count),
                    createdAt: url.created_at,
                    expiresAt: url.expires_at
                },

                clicksToday: Number(
                    todayResult.rows[0].clicks_today
                ),

                clicksByDay: dailyResult.rows.map(row => ({
                    date: row.date,
                    clicks: Number(row.clicks)
                })),

                topReferrers: referrerResult.rows.map(row => ({
                    referrer: row.referrer,
                    clicks: Number(row.clicks)
                })),

                recentClicks: recentClicksResult.rows
            });

        } catch (error) {
            console.error("ANALYTICS ERROR:", error);

            res.status(500).json({
                error: "Failed to fetch analytics"
            });
        }
    }
);
app.get(
    "/api/urls/:id/qr",
    authenticateToken,
    async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.userId;

            // Make sure this URL belongs to the logged-in user
            const result = await pool.query(
                `SELECT id, short_code
                 FROM urls
                 WHERE id = $1
                 AND user_id = $2`,
                [id, userId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    error: "URL not found"
                });
            }

            const url = result.rows[0];

            const shortUrl =
                `${process.env.BASE_URL}/${url.short_code}`;

            // Generate QR as a PNG data URL
            const qrCode = await QRCode.toDataURL(shortUrl, {
                width: 500,
                margin: 2,
            });

            res.json({
                shortUrl,
                qrCode
            });

        } catch (error) {
            console.error("QR CODE ERROR:", error);

            res.status(500).json({
                error: "Failed to generate QR code"
            });
        }
    }
);
app.get("/:shortCode", async (req, res) => {
    try {
        const { shortCode } = req.params;

        const cacheKey = `url:${shortCode}`;

        // 1. Check Redis
        const cachedUrl = await redis.get(cacheKey);

        if (cachedUrl) {
            console.log("Redis HIT:", shortCode);

            const url = JSON.parse(cachedUrl);

            // Check expiration
            if (
                url.expires_at &&
                new Date(url.expires_at) <= new Date()
            ) {
                await redis.del(cacheKey);

                return res.status(410).send(
                    "This short URL has expired"
                );
            }

            // Send click event to background queue
            await clickQueue.add("record-click", {
                urlId: url.id,
                ipAddress:
                    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
                    req.socket.remoteAddress,
                userAgent: req.get("user-agent"),
                referrer: req.get("referer") || null,
            });

            // Redirect immediately
            return res.redirect(url.original_url);
        }

        console.log("Redis MISS:", shortCode);

        // 2. Redis MISS → PostgreSQL
        const result = await pool.query(
            `SELECT id, original_url, expires_at
             FROM urls
             WHERE short_code = $1`,
            [shortCode]
        );

        if (result.rows.length === 0) {
            return res.status(404).send(
                "Short URL not found"
            );
        }

        const url = result.rows[0];

        // 3. Check expiration
        if (
            url.expires_at &&
            new Date(url.expires_at) <= new Date()
        ) {
            return res.status(410).send(
                "This short URL has expired"
            );
        }

        // 4. Calculate Redis TTL
        let ttl = 3600;

        if (url.expires_at) {
            const secondsUntilExpiration = Math.floor(
                (new Date(url.expires_at).getTime() - Date.now()) / 1000
            );

            ttl = Math.max(1, secondsUntilExpiration);
        }

        // 5. Cache URL
        await redis.set(
            cacheKey,
            JSON.stringify(url),
            {
                EX: ttl,
            }
        );

        // 6. Add click to background queue
        await clickQueue.add("record-click", {
            urlId: url.id,
            ipAddress:
                req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
                req.socket.remoteAddress,
            userAgent: req.get("user-agent"),
            referrer: req.get("referer") || null,
        });

        // 7. Redirect
        res.redirect(url.original_url);

    } catch (error) {
        console.error("REDIRECT ERROR:", error);

        res.status(500).send("Server error");
    }
});
const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await connectRedis();

        console.log("Redis connected");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Server startup error:", error);
        process.exit(1);
    }
}

startServer();