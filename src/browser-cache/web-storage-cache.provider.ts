import { Observable } from "rxjs";
import { CacheItem, ICacheProvider, expiredOrNotFound } from "./i-cache-provider";
import { fromNow } from "./date";
import { catchError } from "rxjs/operators";

export interface WebStorageCacheProviderOptions {
    /**
     * Default cache time in milliseconds.
     */
    defaultCacheTimeInMS: Readonly<number>;
}

/**
 * Cache provider using web storage (local storage or session storage).
 */
export abstract class WebStorageCacheProvider implements ICacheProvider {
    #defaultCacheTimeInMS: Readonly<number>;

    constructor(
        private storage: Storage,
        options: WebStorageCacheProviderOptions
    ) {
        this.#defaultCacheTimeInMS = options.defaultCacheTimeInMS;
    }

    clear$() {
        return new Observable<void>(subscriber => {
            try {
                for (let i = 0; i < this.storage.length; i++) {
                    const key = this.storage.key(i);
                    if (key?.startsWith(this.constructor.name)) {
                        this.storage.removeItem(key);
                    }
                }
                subscriber.next(undefined);
                subscriber.complete();
            } catch (error) {
                subscriber.error(error);
            }
        }).pipe(
            catchError(this.andRespondWith<void>(undefined))
        );
    }

    get$<T>(key: string): Observable<T | null> {
        return new Observable<T | null>(subscriber => {
            try {
                const stored = this.storage.getItem(this.key(key));

                let item: CacheItem<T> | null = null;

                if (stored) {
                    item = JSON.parse(stored) as CacheItem<T>;
                }

                if (expiredOrNotFound(item)) {
                    subscriber.next(null);
                    subscriber.complete();
                    return;
                }

                subscriber.next(item.value);
                subscriber.complete();
            } catch (error) {
                subscriber.error(error);
            }
        }).pipe(
            catchError(this.andRespondWith<T | null>(null))
        );
    }

    set$<T>(key: string, value: T, cacheTimeInMS: number | undefined = undefined): Observable<void> {
        return new Observable<void>(subscriber => {
            try {
                const expires = fromNow(cacheTimeInMS ?? this.#defaultCacheTimeInMS, 'milliseconds').toISOString();
                this.storage.setItem(this.key(key), JSON.stringify({
                    expires,
                    value
                }));
                subscriber.next(undefined);
                subscriber.complete();
            } catch (error) {
                subscriber.error(error);
            }
        }).pipe(
            catchError(this.andRespondWith<void>(undefined))
        );
    }

    invalidate$(key: string): Observable<void> {
        return new Observable<void>(subscriber => {
            try {
                this.storage.removeItem(this.key(key));
                subscriber.next(undefined);
                subscriber.complete();
            } catch (error) {
                subscriber.error(error);
            }
        }).pipe(
            catchError(this.andRespondWith<void>(undefined))
        );
    }

    private key(keyName: string): string {
        return `${this.constructor.name}:${keyName}`;
    }

    private andRespondWith<T>(respondWith: T) {
        return () => {
            return [respondWith];
        };
    }
}
