import { createClient } from "redis";
import { env } from "./env.js";

let redisClient;

export async function connectRedis() {
  if (redisClient?.isOpen) return redisClient;

  redisClient = createClient({ url: env.redisUrl });
  redisClient.on("error", (error) => {
    console.error("Redis error:", error.message);
  });

  await redisClient.connect();
  console.log("Redis connected");
  return redisClient;
}

export function getRedisClient() {
  return redisClient;
}

export async function disconnectRedis() {
  if (redisClient?.isOpen) {
    await redisClient.quit();
  }
}
