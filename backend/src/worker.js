import { Worker } from "bullmq";
import pool from "./db.js";
import connection from "./queues/redisConnection.js";

const worker = new Worker(
    "clicks",

    async (job) => {
        const {
            urlId,
            ipAddress,
            userAgent,
            referrer,
        } = job.data;

        await pool.query(
            `INSERT INTO url_clicks
                (url_id, ip_address, user_agent, referrer)
             VALUES
                ($1, $2, $3, $4)`,
            [urlId, ipAddress, userAgent, referrer]
        );

        await pool.query(
            `UPDATE urls
             SET click_count = click_count + 1
             WHERE id = $1`,
            [urlId]
        );
    },

    {
        connection,
        concurrency: 10,
    }
);

worker.on("completed", (job) => {
    console.log(`Click job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
    console.error(
        `Click job ${job?.id} failed:`,
        error.message
    );
});

console.log("Click worker started");