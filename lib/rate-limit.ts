interface Entry {
  count: number
  resetAt: number
}

const store = new Map<string, Entry>()

// Prune stale entries every 5 minutes to prevent unbounded memory growth
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [k, v] of store) {
      if (v.resetAt < now) store.delete(k)
    }
  }, 300_000)
}

export function rateLimit(
  key: string,
  limit = 10,
  windowMs = 60_000,
): { success: boolean; remaining: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: limit - 1 }
  }

  if (entry.count >= limit) return { success: false, remaining: 0 }
  entry.count += 1
  return { success: true, remaining: limit - entry.count }
}
