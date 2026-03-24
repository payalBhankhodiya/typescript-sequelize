import { createClient } from "redis";

const redisClient = createClient({
    url: "redis://10.10.1.12:6379",
});

redisClient.on("error", (err) => {
    console.error("Redis Error", err);
});

export async function connectRedis() {
    await redisClient.connect();
    console.log("Redis connected");
}

export default redisClient;