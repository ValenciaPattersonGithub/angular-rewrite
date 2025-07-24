import { Inject, Injectable, InjectionToken } from "@angular/core";
import { WebStorageCacheProvider, WebStorageCacheProviderOptions } from "./web-storage-cache.provider";

export const LOCAL_STORAGE_CACHE_PROVIDER_OPTIONS = new InjectionToken<WebStorageCacheProviderOptions>('LOCAL_STORAGE_CACHE_PROVIDER_OPTIONS', {
    providedIn: 'root',
    factory: () => ({
        defaultCacheTimeInMS: 300000
    })
});

export const LOCAL_STORAGE = new InjectionToken<Storage>('LOCAL_STORAGE', {
    providedIn: 'root',
    factory: () => localStorage
});

/**
 * Cache provider using local storage.
 */
@Injectable({
    providedIn: 'root'
})
export class LocalStorageCacheProvider extends WebStorageCacheProvider {
    constructor(
        @Inject(LOCAL_STORAGE) localStorage: Storage,
        @Inject(LOCAL_STORAGE_CACHE_PROVIDER_OPTIONS) options: WebStorageCacheProviderOptions
    ) {
        super(localStorage, options);
    }
}
