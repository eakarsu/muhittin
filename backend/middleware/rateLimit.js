function createRateLimiter({ windowMs, max, key = (req) => req.ip || req.socket.remoteAddress || 'unknown' }) {
  const buckets = new Map();
  return function rateLimit(req, res, next) {
    const now = Date.now();
    const bucketKey = key(req);
    const existing = buckets.get(bucketKey);
    if (!existing && buckets.size >= 10_000) {
      for (const [candidate, value] of buckets) if (value.resetAt <= now) buckets.delete(candidate);
      while (buckets.size >= 10_000) buckets.delete(buckets.keys().next().value);
    }
    const bucket = !existing || existing.resetAt <= now ? { count: 0, resetAt: now + windowMs } : existing;
    bucket.count += 1;
    buckets.set(bucketKey, bucket);
    res.setHeader('RateLimit-Limit', String(max));
    res.setHeader('RateLimit-Remaining', String(Math.max(0, max - bucket.count)));
    res.setHeader('RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));
    if (bucket.count > max) {
      res.setHeader('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)));
      return res.status(429).json({ error: 'Too many requests' });
    }
    return next();
  };
}

module.exports = { createRateLimiter };
