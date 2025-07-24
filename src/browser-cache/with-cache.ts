import { Observable } from "rxjs";
import { ICacheProvider } from "./i-cache-provider";
import { cache } from "./cache-operators";
import { map } from "rxjs/operators";

/**
 * CacheConfig is a configuration object that is used to configure the cache. It contains the
 * cache key, the cache time in milliseconds, the cache provider, and a transform function that
 * is used to transform the value that is cached.
 */
export interface CacheConfig<T, R, K extends string = string> {
    readonly key: K;
    readonly cacheTimeInMS: number;
    cacheProvider: ICacheProvider;
    transform: (value: T) => R;
}

/**
 * withCache is a function that is used to wrap an observable with a cache. It takes a source
 * observable and a cache configuration object. It returns an observable that will cache the
 * value of the source observable for the specified amount of time.
 *
 * @param source Source observable
 * @param config Cache configuration
 * @returns
 */
export const withCache = <T, R, K extends string = string>(source: Observable<T>, config: CacheConfig<T, R, K>) => {
    // This abstracts the use of the cache operator.
    return source
        .pipe(
            map(value => config.transform(value)),
            cache(config.cacheProvider, config.key, config.cacheTimeInMS)
        );
};
