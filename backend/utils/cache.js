import { getRedisClient } from "../config/redis.js";

/**
 * Cache-aside helpers backed by Redis.
 *
 * Design goals:
 * - Transparent: when Redis is unavailable (not connected / erroring), every
 *   helper degrades to a no-op and callers fall back to the database. The
 *   application's behaviour and return values are identical with or without a
 *   working cache.
 * - Safe: all Redis access is wrapped in try/catch so a cache failure can never
 *   break a request.
 */

const DEFAULT_TTL_SECONDS = 60;

function activeClient() {
  const client = getRedisClient();
  return client?.isOpen ? client : null;
}

/** Read and JSON-parse a cached value. Returns null on miss or any failure. */
export async function cacheGet(key) {
  const client = activeClient();
  if (!client) return null;
  try {
    const raw = await client.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error(`[cache] get failed for ${key}: ${error.message}`);
    return null;
  }
}

/** JSON-serialize and store a value with a TTL (seconds). No-op without Redis. */
export async function cacheSet(key, value, ttlSeconds = DEFAULT_TTL_SECONDS) {
  const client = activeClient();
  if (!client) return;
  try {
    await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (error) {
    console.error(`[cache] set failed for ${key}: ${error.message}`);
  }
}

/** Delete one or more exact keys. */
export async function cacheDelete(...keys) {
  const client = activeClient();
  const flat = keys.flat().filter(Boolean);
  if (!client || flat.length === 0) return;
  try {
    await client.del(flat);
  } catch (error) {
    console.error(`[cache] delete failed: ${error.message}`);
  }
}

/** Delete every key matching a prefix (used to invalidate grouped entries). */
export async function cacheDeleteByPrefix(prefix) {
  const client = activeClient();
  if (!client) return;
  try {
    const keys = [];
    for await (const key of client.scanIterator({ MATCH: `${prefix}*`, COUNT: 100 })) {
      keys.push(key);
    }
    if (keys.length) await client.del(keys);
  } catch (error) {
    console.error(`[cache] deleteByPrefix failed for ${prefix}: ${error.message}`);
  }
}

/**
 * Cache-aside wrapper: return the cached value if present, otherwise run the
 * loader, cache its (non-empty) result, and return it. Loader errors propagate
 * and are never cached.
 */
export async function withCache(key, ttlSeconds, loader) {
  const cached = await cacheGet(key);
  if (cached !== null) return cached;

  const fresh = await loader();
  if (fresh !== undefined && fresh !== null) {
    await cacheSet(key, fresh, ttlSeconds);
  }
  return fresh;
}

/** Build a deterministic cache key from a prefix and a set of parameters. */
export function buildKey(prefix, params = {}) {
  const normalized = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== "")
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return normalized ? `${prefix}:${normalized}` : prefix;
}

export const CACHE_TTL = {
  assessmentList: 60,
  assessment: 300,
  leaderboard: 30,
  competitionList: 30,
  competition: 30,
};
