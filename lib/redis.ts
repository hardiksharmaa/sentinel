import { Redis } from '@upstash/redis'
import { prisma } from "@/lib/prisma";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const DB_CACHE_TTL = 300; 
export const SSL_CACHE_TTL = 86400;
export const USER_CACHE_TTL = 86400;

export async function getCachedData<T>(key: string, fetcher: () => Promise<T>, ttl: number = 300) {
  try {
    const cachedData = await redis.get<T>(key);
    if (cachedData) {
      console.log(`⚡ HIT: ${key}`);
      return cachedData;
    }
  } catch (error) {
    console.error("Redis Error (Falling back to DB):", error);
  }

  console.log(`🐢 MISS: ${key}`);
  
  const data = await fetcher();

  if (data) {
    try {
      await redis.set(key, data, { ex: ttl });
    } catch (error) {
      console.error("Redis Set Error:", error);
    }
  }

  return data;
}

export async function getCachedUser(userId: string) {
  const cacheKey = `user_profile:${userId}`;
  
  return await getCachedData(
    cacheKey,
    async () => {
      return await prisma.user.findUnique({
        where: { id: userId }
      });
    },
    86400 
  );
}

export async function invalidateCache(key: string) {
    await redis.del(key);
}