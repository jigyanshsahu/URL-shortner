import { redis } from "../redis.js";

export function rateLimit({
    limit = 10,
    windowSeconds = 60,
} = {}) {
    return async (req, res, next) => {
        try {
          const identifier = req.user?.userId
    ? `user:${req.user.userId}`
    : `ip:${req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket.remoteAddress}`;

const key = `rate-limit:${identifier}`;
            const currentCount = await redis.incr(key);

            // First request → start expiration timer
            if (currentCount === 1) {
                await redis.expire(key, windowSeconds);
            }

            if (currentCount > limit) {
                const ttl = await redis.ttl(key);

                return res.status(429).json({
                    error: "Too many requests",
                    retryAfter: ttl,
                });
            }

            res.setHeader(
                "X-RateLimit-Limit",
                limit
            );

            res.setHeader(
                "X-RateLimit-Remaining",
                Math.max(0, limit - currentCount)
            );

            next();

        } catch (error) {
            console.error(
                "RATE LIMIT ERROR:",
                error
            );

            // Don't block the API if Redis is temporarily unavailable
            next();
        }
    };
}