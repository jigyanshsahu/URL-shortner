import jwt from "jsonwebtoken";
import pool from "../db.js";

async function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;

    const token = authHeader?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            error: "Authentication required",
        });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Verify that the user exists in the database
        const userResult = await pool.query(
            "SELECT id, name, email FROM users WHERE id = $1",
            [decoded.userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({
                error: "User account no longer exists. Please sign in again.",
            });
        }

        req.user = {
            ...decoded,
            ...userResult.rows[0],
            userId: userResult.rows[0].id
        };

        next();
    } catch (error) {
        return res.status(403).json({
            error: "Invalid or expired token",
        });
    }
}

export default authenticateToken;