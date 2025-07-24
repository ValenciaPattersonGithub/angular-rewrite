import { Observable } from "rxjs";

/**
 * Returns true if the cache item is not null or undefined and the expires value is a valid
 * date in the future.
 *
 * @param cacheItem
 * @returns
 */
export const expiredOrNotFound = <T>(cacheItem: CacheItem<T> | null | undefined): cacheItem is null | undefined => {
    if (!cacheItem?.expires) {
        return true;
    }

    const expiresDate = new Date(cacheItem.expires).valueOf();

    return isNaN(expiresDate) ||
        expiresDate <= Date.now();
};

/**
 * Cache item
 */
export interface CacheItem<T> {
    expires: string | null;
    value: T;
}

/**
 * Cache provider interface
 */
export interface ICacheProvider {
    /**
     * Clear all data from cache.
     */
    clear$(): Observable<void>;

    /**
     * Get cached value.
     *
     * @param key Cache key
     */
    get$<T>(key: string): Observable<T | null>;

    /**
     * Set cached value.
     *
     * @param key Cache key
     * @param value Value to cache
     * @param cacheTimeInMS Cache time in milliseconds
     */
    set$<T>(key: string, value: T, cacheTimeInMS?: number): Observable<void>;

    /**
     * Invalidate cached value.
     *
     * @param key Cache key
     */
    invalidate$(key: string): Observable<void>;
}
