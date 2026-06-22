const cache = new Map<string, { data: unknown; expires: number }>();
const TTL = 30_000;

export function getCached<T>(key: string): T | null {
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.data as T;
  cache.delete(key);
  return null;
}

export function setCache(key: string, data: unknown, ttl = TTL) {
  cache.set(key, { data, expires: Date.now() + ttl });
}

export function clearCache(pattern?: string) {
  if (!pattern) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.includes(pattern)) cache.delete(key);
  }
}
