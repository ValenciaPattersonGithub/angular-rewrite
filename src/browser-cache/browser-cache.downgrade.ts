import { downgradeInjectable } from '@angular/upgrade/static';
import { IndexedDBCacheProvider } from './indexed-db-cache.provider';
import { LocalStorageCacheProvider } from './local-stroage-cache.provider';
import { SessionStorageCacheProvider } from './session-storage-cache.provider';
import { MemoryCacheProvider } from './memory-cache.provider';

declare var angular: angular.IAngularStatic;

export function BrowserCacheDowngrade() {
  angular.module('Soar.Main')
    .factory('IndexedDBCacheProvider', downgradeInjectable(IndexedDBCacheProvider))
    .factory('LocalStorageCacheProvider', downgradeInjectable(LocalStorageCacheProvider))
    .factory('SessionStorageCacheProvider', downgradeInjectable(SessionStorageCacheProvider))
    .factory('MemoryCacheProvider', downgradeInjectable(MemoryCacheProvider));
}
