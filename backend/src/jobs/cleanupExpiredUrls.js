import pool from "../db.js";

async function cleanupExpiredUrls() {
    try {
        const result = await pool.query(
            `DELETE FROM urls
             WHERE expires_at IS NOT NULL
             AND expires_at <= NOW()
             RETURNING id`
        );

        if (result.rowCount > 0) {
            console.log(
                `Deleted ${result.rowCount} expired URLs`
            );
        }

    } catch (error) {
        console.error(
            "EXPIRED URL CLEANUP ERROR:",
            error
        );
    }
}

export default cleanupExpiredUrls;