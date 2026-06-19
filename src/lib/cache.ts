const TTL_MS = 5 * 60 * 1000;

interface CacheEntry<T> {
	data: T;
	expiresAt: number;
}

let flightsCache: CacheEntry<unknown> | null = null;

export function getCached<T>(key: "flights"): T | null {
	if (key !== "flights" || !flightsCache) return null;
	if (Date.now() > flightsCache.expiresAt) {
		flightsCache = null;
		return null;
	}
	return flightsCache.data as T;
}

export function setCached<T>(key: "flights", data: T): void {
	if (key !== "flights") return;
	flightsCache = { data, expiresAt: Date.now() + TTL_MS };
}

export function clearCache(key?: "flights"): void {
	if (!key || key === "flights") {
		flightsCache = null;
	}
}

export function getCacheUpdatedAt(): string | null {
	if (!flightsCache) return null;
	const updatedAt = flightsCache.expiresAt - TTL_MS;
	return new Date(updatedAt).toISOString();
}
