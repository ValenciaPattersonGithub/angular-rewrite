import { Observable } from "rxjs";
import { CacheItem, ICacheProvider, expiredOrNotFound } from "./i-cache-provider";
import { Inject, Injectable, InjectionToken } from "@angular/core";
import { fromNow } from "./date";
import { DOCUMENT } from "@angular/common";
import { catchError, shareReplay, switchMap } from "rxjs/operators";

export interface IndexedDBCacheProviderOptions {
    /**
     * Cache name.
     */
    cacheName: Readonly<string>;

    /**
     * Object store name.
     */
    objectStoreName: Readonly<string>;

    /**
     * Default cache time in milliseconds.
     */
    defaultCacheTimeInMS: Readonly<number>;
}

/**
 * Injection token for indexedDB cache options.
 */
export const INDEXED_DB_CACHE_PROVIDER_OPTIONS = new InjectionToken<IndexedDBCacheProviderOptions>('INDEXED_DB_CACHE_NAME', {
    providedIn: 'root',
    factory: () => ({
        cacheName: 'cache',
        objectStoreName: 'values',
        defaultCacheTimeInMS: 300000
    })
});

/**
 * Injection token for indexedDB.
 */
export const INDEXED_DB = new InjectionToken<IDBFactory>('IDBFactory', {
    providedIn: 'root',
    factory: () => indexedDB
});

/**
 * Cache provider using indexedDB.
 * 
 * @implements ICacheProvider
 */
@Injectable({
    providedIn: 'root'
})
export class IndexedDBCacheProvider implements ICacheProvider {
    /**
     * Observable of the indexedDB database.
     */
    #db$: Observable<IDBDatabase>;

    #objectStoreName: Readonly<string>;
    #defaultCacheTimeInMS: Readonly<number>;

    constructor(
        @Inject(INDEXED_DB_CACHE_PROVIDER_OPTIONS) options: IndexedDBCacheProviderOptions,
        /* eslint-disable @typescript-eslint/no-explicit-any */
        @Inject(INDEXED_DB) idbFactory: any, // using `any` due to "ReferenceError: IDBFactory is not defined" when running tests
        /* eslint-enable @typescript-eslint/no-explicit-any */
        @Inject(DOCUMENT) document: Document
    ) {
        this.#objectStoreName = options.objectStoreName;
        this.#defaultCacheTimeInMS = options.defaultCacheTimeInMS;

        this.#db$ = new Observable<IDBDatabase>(subscriber => {
            try {
                const request = (idbFactory as IDBFactory).open(options.cacheName, 1);

                request.onblocked = (event) => {
                    console.warn('IndexedDB cache provider: Blocked', event);
                };

                request.onupgradeneeded = () => {
                    const db = request.result;

                    console.log('IndexedDB cache provider: Upgrading database', db.version);
                    if (db.version >= 1) {
                        if (!db.objectStoreNames.contains(this.#objectStoreName)) {
                            db.createObjectStore(this.#objectStoreName, { keyPath: 'key' });
                        }
                    }
                };

                request.onsuccess = () => {
                    request.result.onversionchange = (event) => {
                        console.warn('IndexedDB cache provider: Version change', event);
                        request.result.close();
                        document.defaultView?.alert('A new version of this page is ready. Please reload.');
                    };

                    subscriber.next(request.result);
                    subscriber.complete();
                };

                request.onerror = (event) => {
                    console.error('Unexpected error', event);
                    subscriber.error(event);
                };
            } catch (error) {
                console.error('Unexpected error', error);
                subscriber.error(error);
            }
        }).pipe(shareReplay(1));

        if (navigator?.storage?.estimate) {
            void navigator.storage.estimate()
                .then(estimate => {
                    const usage = estimate.usage ?? 0.0;
                    const quota = estimate.quota ?? 0.0;
                    const percentUsed = quota > 0 ? usage / quota : 1;
                    console.log(`IndexedDB cache provider: ${usage} of ${quota} bytes (${percentUsed.toFixed(2)}) used.`);

                    if (percentUsed > 0.9) {
                        console.warn('IndexedDB cache provider: Cache usage is above 90%.');
                    }

                    if ('usageDetails' in estimate) {
                        /* eslint-disable @typescript-eslint/no-explicit-any */
                        console.log(`IndexedDB cache provider: ${JSON.stringify((estimate as any).usageDetails)}`);
                        /* eslint-enable @typescript-eslint/no-explicit-any */
                    }
                });
        }
    }

    clear$() {
        return this.#db$
            .pipe(
                switchMap(db => {
                    return new Observable<void>(subscriber => {
                        try {
                            const request = db.transaction([this.#objectStoreName], 'readwrite')
                                .objectStore(this.#objectStoreName)
                                .clear();

                            request.onsuccess = () => {
                                subscriber.next(undefined);
                                subscriber.complete();
                            }

                            request.onerror = (event) => {
                                subscriber.error(event);
                            }
                        } catch (error) {
                            subscriber.error(error);
                        }
                    });
                }),
                catchError(this.andRespondWith(undefined))
            );
    }

    get$<T>(key: string): Observable<T | null> {
        return this.#db$
            .pipe(
                switchMap(db => {
                    return new Observable<T | null>(subscriber => {
                        try {
                            const request: IDBRequest<CacheItem<T> | null | undefined> = db.transaction([this.#objectStoreName], 'readonly')
                                .objectStore(this.#objectStoreName)
                                .get(key);

                            request.onsuccess = () => {
                                const result = request.result;

                                if (expiredOrNotFound(result)) {
                                    subscriber.next(null);
                                    subscriber.complete();
                                    return;
                                }

                                subscriber.next(result.value);
                                subscriber.complete();
                            };

                            request.onerror = (event) => {
                                subscriber.error(event);
                            };
                        } catch (error) {
                            subscriber.error(error);
                        }
                    });
                }),
                catchError(this.andRespondWith<T | null>(null))
            );
    }

    set$<T>(key: string, value: T, cacheTimeInMS: number | undefined = undefined): Observable<void> {
        return this.#db$
            .pipe(
                switchMap(db => {
                    return new Observable<void>(subscriber => {
                        try {
                            const expires = fromNow(cacheTimeInMS ?? this.#defaultCacheTimeInMS, 'milliseconds').toISOString();
                            const request = db
                                .transaction([this.#objectStoreName], 'readwrite')
                                .objectStore(this.#objectStoreName)
                                .put({
                                    key,
                                    expires,
                                    value
                                });

                            request.onsuccess = () => {
                                subscriber.next(undefined);
                                subscriber.complete();
                            };

                            request.onerror = (event) => {
                                subscriber.error(event);
                            };
                        } catch (error) {
                            subscriber.error(error);
                        }
                    });
                }),
                catchError(this.andRespondWith<void>(undefined))
            );
    }

    invalidate$(key: string): Observable<void> {
        return this.#db$
            .pipe(
                switchMap(db => {
                    return new Observable<void>(subscriber => {
                        try {
                            const request = db
                                .transaction([this.#objectStoreName], 'readwrite')
                                .objectStore(this.#objectStoreName)
                                .delete(key);

                            request.onsuccess = () => {
                                subscriber.next(undefined);
                                subscriber.complete();
                            };

                            request.onerror = (event) => {
                                subscriber.error(event);
                            };
                        } catch (error) {
                            subscriber.error(error);
                        }
                    });
                }),
                catchError(this.andRespondWith<void>(undefined))
            );
    }

    private andRespondWith<T>(respondWith: T) {
        return (error: unknown) => {
            if (error instanceof DOMException && error.name === 'InvalidStateError') {
                console.warn('Cache state is invalid. Caching will not work. Close tabs or refresh the page.');
            }
            return [respondWith];
        };
    }
}
