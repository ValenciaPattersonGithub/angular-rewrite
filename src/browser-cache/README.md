# Browser Cache

The providers in this folder are implementations of caching providers. The following providers are available:

- [InMemoryCacheProvider](./memory-cache.provider.ts)
- [LocalStorageCacheProvider](./local-storage-cache.provider.ts)
- [SessionStorageCacheProvider](./session-storage-cache.provider.ts)
- [IndexedDbCacheProvider](./indexed-db-cache.provider.ts)

## Usage

Below is a basic example of how to use the `IndexedDbCacheProvider` with the `cache` operator.

## Service

In the service, we inject the `IndexedDbCacheProvider` and use the `cache` operator to cache the response of the `getAll` method. The `cache` operator takes the cache provider and the key to store the data in the cache. It also take an optional third parameter which is the timeout in milliseconds.

In this example, the `widgets$` observable will emit the cached data if it exists in the cache. If the data does not exist in the cache, it will make a request to the server and cache the response.

Also, in this example the `widgets$` observable is declared as a property in the service. The cache operator creates a multicast observable, so subscribers will share the request (will not result in duplicate requests on cache miss).

```typescript
/// my.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IndexedDbCacheProvider } from './indexed-db-cache.provider';
import { cache } from './cache-operator';

@Injectable()
export class MyService {
  widgets$: Observable<Widget[]>;
  constructor(
    private httpClient: HttpClient,
    cacheProvider: IndexedDbCacheProvider
  ) {
    this.widgets$ = this.getAll().pipe(cache(cacheProvider, 'widgets'))
  }

  getAll() {
    return this.http.get<Widget[]>('https://api.example.com/widgets');
  }
}
```

## Component

In the component, we inject the service and subscribe to the `widgets$` observable. The `widgets$` observable will emit the cached data if it exists in the cache. If the data does not exist in the cache, it will make a request to the server and cache the response.

```typescript
/// my.component.ts
import { Component, OnInit } from '@angular/core';
import { MyService } from './my.service';

@Component()
export class MyComponent implements OnInit {
  constructor(private myService: MyService) { }

  ngOnInit() {
    this.myService.widgets$.subscribe(widgets => {
      console.log(widgets);
    });
  }
}
```