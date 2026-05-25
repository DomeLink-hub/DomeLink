/**
 * Lightweight in-memory AI response cache.
 * Prevents duplicate Groq calls for identical inputs within a TTL window.
 * In production, replace with Redis for multi-instance deployments.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class AICache {
  private store = new Map<string, CacheEntry<unknown>>();
  private readonly defaultTtlMs: number;

  constructor(defaultTtlMs = 10 * 60 * 1000) { // 10 min default
    this.defaultTtlMs = defaultTtlMs;
    // Periodic cleanup every 5 min
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  set<T>(key: string, value: T, ttlMs?: number): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTtlMs),
    });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) this.store.delete(key);
    }
  }

  size(): number {
    return this.store.size;
  }
}

// Singleton — shared across all AI service calls in the same process
export const aiCache = new AICache();

/** Build a deterministic cache key from an object */
export const cacheKey = (prefix: string, input: Record<string, unknown>): string => {
  const sorted = Object.keys(input).sort().reduce<Record<string, unknown>>((acc, k) => {
    acc[k] = input[k];
    return acc;
  }, {});
  return `${prefix}:${JSON.stringify(sorted)}`;
};
