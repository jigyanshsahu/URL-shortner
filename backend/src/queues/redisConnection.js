import IORedis from "ioredis";

const connection = new IORedis(
    process.env.REDIS_URL || "redis://localhost:6379",
    {
        maxRetriesPerRequest: null,
    }
);

connection.on("error", (error) => {
    console.error("BullMQ Redis Error:", error);
});

export default connection;