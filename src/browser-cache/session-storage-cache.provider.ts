import { Inject, Injectable, InjectionToken } from "@angular/core";
import { WebStorageCacheProvider, WebStorageCacheProviderOptions } from "./web-storage-cache.provider";

export const SESSION_STORAGE_CACHE_PROVIDER_OPTIONS = new InjectionToken<WebStorageCacheProviderOptions>('SESSION_STORAGE_CACHE_PROVIDER_OPTIONS', {
    providedIn: 'root',
    factory: () => ({
        defaultCacheTimeInMS: 300000
    })
});

export const SESSION_STORAGE = new InjectionToken<Storage>('SESSION_STORAGE', {
    providedIn: 'root',
    factory: () => sessionStorage
});

/**
 * Cache provider using session storage.
 */
@Injectable({
    providedIn: 'root'
})
export class SessionStorageCacheProvider extends WebStorageCacheProvider {
    constructor(
        @Inject(SESSION_STORAGE) sessionStorage: Storage,
        @Inject(SESSION_STORAGE_CACHE_PROVIDER_OPTIONS) options: WebStorageCacheProviderOptions
    ) {
        super(sessionStorage, options);
    }
}
