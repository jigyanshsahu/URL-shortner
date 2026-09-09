const express = require("express");
const cors = require("cors");
const pool = require("./db");
const generateCode = require("./utils/generateCode");
require("dotenv").config();
const authRoutes = require("./routes/auth");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
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

app.post("/api/urls", authenticateToken, async (req, res) => {
    try {
        const { url } = req.body;
             const userId = req.user.userId;
        if (!url) {
            return res.status(400).json({
                error: "URL is required",
            });
        }

        // 1. Check whether URL already exists
        const existingUrl = await pool.query(
            `SELECT short_code
             FROM urls
             WHERE original_url = $1`,
            [url]
        );

        // 2. If it exists, return existing short code
        if (existingUrl.rows.length > 0) {
            return res.status(200).json({
                shortUrl: `http://localhost:5000/${existingUrl.rows[0].short_code}`,
                originalUrl: url,
                existing: true
            });
        }

        // 3. URL doesn't exist → generate new code
        const shortCode = generateCode();

        // 4. Store new URL
      const result = await pool.query(
    `INSERT INTO urls
     (user_id, short_code, original_url)
     VALUES ($1, $2, $3)
     RETURNING short_code, original_url`,
    [userId, shortCode, url]
);

        // 5. Return new short URL
        res.status(201).json({
            shortUrl: `http://localhost:5000/${result.rows[0].short_code}`,
            originalUrl: result.rows[0].original_url,
            existing: false
        });

    } catch (error) {
        console.error("CREATE URL ERROR:", error);

        res.status(500).json({
            error: "Failed to create short URL",
        });
    }
});

app.get("/:shortCode", async (req, res) => {
    try {
        const { shortCode } = req.params;

        const result = await pool.query(
            `UPDATE urls
             SET click_count = click_count + 1
             WHERE short_code = $1
             RETURNING original_url, click_count`,
            [shortCode]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Short URL not found",
            });
        }

        const { original_url, click_count } = result.rows[0];

        console.log(`Redirecting ${shortCode} | Clicks: ${click_count}`);

        res.redirect(302, original_url);

    } catch (error) {
        console.error("REDIRECT ERROR:", error);

        res.status(500).json({
            error: "Failed to redirect",
        });
    }
});
app.get("/api/urls", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, short_code, original_url, created_at, click_count
             FROM urls
             ORDER BY created_at DESC`
        );

        res.json(result.rows);

    } catch (error) {
        console.error("FETCH URLS ERROR:", error);

        res.status(500).json({
            error: "Failed to fetch URLs",
        });
    }
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
