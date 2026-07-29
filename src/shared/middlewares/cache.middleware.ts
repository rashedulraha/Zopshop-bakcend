import type { Request, Response, NextFunction } from "express";

interface CacheItem {
  body: any;
  expiry: number;
}

const serverCache = new Map<string, CacheItem>();

/**
 * Express GET Route Response Caching Middleware
 * @param durationSeconds Time to live in seconds (default 15 seconds)
 */
export const routeCache = (durationSeconds: number = 15) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    const key = `${req.originalUrl || req.url}`;
    const cached = serverCache.get(key);

    if (cached && Date.now() < cached.expiry) {
      res.setHeader("X-Cache", "HIT");
      return res.json(cached.body);
    }

    // Override res.json to capture response body
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        serverCache.set(key, {
          body,
          expiry: Date.now() + durationSeconds * 1000,
        });
      }
      res.setHeader("X-Cache", "MISS");
      return originalJson(body);
    };

    next();
  };
};

/**
 * Invalidate server cache when a write operation occurs (POST/PUT/DELETE)
 */
export const invalidateRouteCache = (pattern?: string) => {
  if (!pattern) {
    serverCache.clear();
    return;
  }
  for (const key of serverCache.keys()) {
    if (key.includes(pattern)) {
      serverCache.delete(key);
    }
  }
};
