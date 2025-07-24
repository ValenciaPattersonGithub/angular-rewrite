import { Inject, Injectable, InjectionToken } from "@angular/core";
import { CacheItem, ICacheProvider, expiredOrNotFound } from "./i-cache-provider";
import { Observable } from "rxjs";
import { fromNow } from "./date";

export interface MemoryCacheProviderOptions {
    /**
     * Default cache time in milliseconds.
     */
    defaultCacheTimeInMS: Readonly<number>;
}

export const MEMORY_CACHE_PROVIDER_OPTIONS = new InjectionToken<MemoryCacheProviderOptions>('MEMORY_CACHE_PROVIDER_OPTIONS', {
    providedIn: 'root',
    factory: () => ({
        defaultCacheTimeInMS: 300000
    })
});

export const MEMORY_CACHE = new InjectionToken<Map<string, CacheItem<unknown>>>('MEMORY_CACHE', {
    providedIn: 'root',
    factory: () => new Map<string, CacheItem<unknown>>()
});

/**
 * Cache provider using an in-memory map.
 */
@Injectable({
    providedIn: 'root'
})
export class MemoryCacheProvider implements ICacheProvider {
    #defaultCacheTimeInMS: Readonly<number>;

    constructor(
        @Inject(MEMORY_CACHE) private cache: Map<string, CacheItem<unknown>>,
        @Inject(MEMORY_CACHE_PROVIDER_OPTIONS) options: MemoryCacheProviderOptions
    ) {
        this.#defaultCacheTimeInMS = options.defaultCacheTimeInMS;
    }

    clear$() {
        return new Observable<void>(subscriber => {
            try {
                this.cache.clear();
                subscriber.next(undefined);
                subscriber.complete();
            } catch (error) {
                subscriber.error(error);
            }
        });
    }

    get$<T>(key: string): Observable<T | null> {
        return new Observable<T | null>(subscriber => {
            try {
                const item = this.cache.get(key);

                if (expiredOrNotFound(item)) {
                    subscriber.next(null);
                    subscriber.complete();
                    return;
                }

                subscriber.next(item.value as T | null);
                subscriber.complete();
            } catch (error) {
                subscriber.error(error);
            }
        });
    }

    set$<T>(key: string, value: T, cacheTimeInMS: number | undefined = undefined): Observable<void> {
        return new Observable<void>(subscriber => {
            try {
                const expires = fromNow(cacheTimeInMS ?? this.#defaultCacheTimeInMS, 'milliseconds').toISOString();
                this.cache.set(key, {
                    expires,
                    value
                });
                subscriber.next(undefined);
                subscriber.complete();
            } catch (error) {
                subscriber.error(error);
            }
        });
    }

    invalidate$(key: string): Observable<void> {
        return new Observable<void>(subscriber => {
            try {
                this.cache.delete(key);
                subscriber.next(undefined);
                subscriber.complete();
            } catch (error) {
                subscriber.error(error);
            }
        });
    }
}
