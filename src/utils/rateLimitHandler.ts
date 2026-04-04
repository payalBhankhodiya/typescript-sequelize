import redisClient from "../config/redis.js";

export const handleRateLimit = async (
  key: string,
  limit: number,
  windowSec: number
) => {
  const count = await redisClient.incr(key);

  if (count === 1) {
    await redisClient.expire(key, windowSec);
  }

  if (count > limit) {
    const ttl = await redisClient.ttl(key);
    return { blocked: true, ttl };
  }

  return { blocked: false };
};