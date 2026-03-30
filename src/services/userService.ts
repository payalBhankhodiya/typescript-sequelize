import User from "../models/User.js";
import redisClient from "../config/redis.js";

const CACHE_KEY = "users:all";

export const getUsers = async () => {
  const cached = await redisClient.get(CACHE_KEY);

  if (cached) {
    console.log("Cache HIT");
    return JSON.parse(cached);
  }

  console.log("Cache MISS");

  const users = await User.findAll();

  await redisClient.set(CACHE_KEY, JSON.stringify(users), {
    EX: 60, // 60 sec TTL
  });

  return users;
};




