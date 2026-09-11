import { Queue } from "bullmq";
import connection from "./redisConnection.js";

const clickQueue = new Queue("clicks", {
    connection,

    defaultJobOptions: {
        attempts: 3,

        backoff: {
            type: "exponential",
            delay: 1000,
        },

        removeOnComplete: true,
        removeOnFail: false,
    },
});

export default clickQueue;