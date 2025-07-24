import { Observable, Subject, timer } from "rxjs";
import { ICacheProvider } from "./i-cache-provider";
import { map, share, startWith, switchMap } from "rxjs/operators";

/**
 * Cache operator for observables.
 *
 * @param cacheProvider The cache provider
 * @param key The cache key
 * @param cacheTimeInMS The cache time in milliseconds
 * @returns
 */
export const cache = <T>(cacheProvider: ICacheProvider, key: string, cacheTimeInMS = 300000) => (source: Observable<T>) => {
    return cacheProvider.get$<T>(key)
        .pipe(
            switchMap(cached => {
                if (cached) {
                    // if cached value is available, return it
                    return [cached];
                }

                // if cached value is not available, execute the source observable and cache the result
                return source
                    .pipe(
                        switchMap(value => {
                            return cacheProvider.set$(key, value, cacheTimeInMS)
                                .pipe(
                                    map(() => value)
                                );
                        })
                    );
            }),
            // share the observable to avoid multiple HTTP requests when multiple subscribers subscribe to the observable
            share()
        );
};

/**
 * Cache refresh operator for observables. This operator will invalidate the cache at the specified interval and execute the source observable.
 *
 * @param cacheProvider The cache provider
 * @param key The cache key
 * @param cacheTimeInMS The cache time in milliseconds
 * @param forceRefresh Subject to force refresh the cache
 * @returns
 */
export const cacheRefresh = <T>(cacheProvider: ICacheProvider, key: string, cacheTimeInMS = 300000, forceRefresh = new Subject<void>()) => (source: Observable<T>) => {
    return forceRefresh
        .pipe(
            startWith(undefined),
            switchMap(() => timer(0, cacheTimeInMS)),
            switchMap((index) => {
                // Don't invalidate the cache on the first run
                if (index === 0) {
                    return [undefined];
                }
                // Invalidate the cache
                return cacheProvider.invalidate$(key);
            }),
            switchMap(() => {
                // Execute the source observable, this will force the cache to be refreshed if the cache is invalidated or expired
                return source;
            })
        );
};

