
import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => {
  console.error("Redis Error:", err);
});

const redisConnection = redisClient.connect().catch((err) => {
  console.error("Redis connection failed:", err);
});

export async function getRedis() {
  await redisConnection;

  if (!redisClient.isOpen) {
    throw new Error("Redis is unavailable");
  }

  return redisClient;
}
