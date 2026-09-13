-- ==============================================================================
-- Scalable URL Shortener - Database Schema
-- ==============================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. URLs Table
CREATE TABLE IF NOT EXISTS urls (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    short_code VARCHAR(50) UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NULL,
    click_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Click Analytics Table
CREATE TABLE IF NOT EXISTS url_clicks (
    id SERIAL PRIMARY KEY,
    url_id INTEGER REFERENCES urls(id) ON DELETE CASCADE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer TEXT,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- Performance & Lookup Indexes
-- ==============================================================================

-- Fast O(1) short code redirection lookup
CREATE INDEX IF NOT EXISTS idx_urls_short_code ON urls(short_code);

-- Fast lookup of user-specific links for dashboard queries
CREATE INDEX IF NOT EXISTS idx_urls_user_id ON urls(user_id);

-- Optimized index for the background expired-URL cleanup cron job
CREATE INDEX IF NOT EXISTS idx_urls_expires_at ON urls(expires_at);

-- Fast aggregation for analytics queries per URL
CREATE INDEX IF NOT EXISTS idx_url_clicks_url_id ON url_clicks(url_id);

-- Time-series aggregation index for daily/weekly click charts
CREATE INDEX IF NOT EXISTS idx_url_clicks_clicked_at ON url_clicks(clicked_at);
