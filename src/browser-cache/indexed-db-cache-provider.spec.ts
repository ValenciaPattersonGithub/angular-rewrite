import { TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { INDEXED_DB_CACHE_PROVIDER_OPTIONS, INDEXED_DB, IndexedDBCacheProvider } from './indexed-db-cache.provider';

describe('IndexedDBCacheProvider', () => {
  let cacheProvider: IndexedDBCacheProvider;
  let dbRequest: jasmine.SpyObj<IDBRequest<any>>;
  let objectStore: jasmine.SpyObj<IDBObjectStore>;
  let transaction: jasmine.SpyObj<IDBTransaction>;
  let database: jasmine.SpyObj<IDBDatabase>;
  let openRequest: jasmine.SpyObj<IDBOpenDBRequest>;
  let dbFactory: jasmine.SpyObj<IDBFactory>;

  beforeEach(() => {
    dbRequest = jasmine.createSpyObj<IDBRequest<any>>('IDBRequest', ['onsuccess', 'onerror']); // , ['result']

    objectStore = jasmine.createSpyObj<IDBObjectStore>('IDBObjectStore', ['put', 'get', 'delete', 'clear']);

    objectStore.put.and.callFake(() => {
      setTimeout(() => {
        dbRequest.onsuccess?.(new Event('success'));
      }, 0);

      return dbRequest;
    });

    objectStore.get.and.callFake(() => {
      setTimeout(() => {
        dbRequest.onsuccess?.(new Event('success'));
      }, 0);

      return dbRequest;
    });

    objectStore.delete.and.callFake(() => {
      setTimeout(() => {
        dbRequest.onsuccess?.(new Event('success'));
      }, 0);

      return dbRequest;
    });

    objectStore.clear.and.callFake(() => {
      setTimeout(() => {
        dbRequest.onsuccess?.(new Event('success'));
      }, 0);

      return dbRequest;
    });

    transaction = jasmine.createSpyObj<IDBTransaction>('IDBTransaction', ['objectStore']);

    transaction.objectStore.and.callFake(() => {
      return objectStore;
    });

    const objectStoreNames = jasmine.createSpyObj<DOMStringList>('DOMStringList', ['contains']);
    objectStoreNames.contains.and.returnValue(false);

    database = jasmine.createSpyObj<IDBDatabase>('IDBDatabase', ['transaction', 'createObjectStore', 'close', 'onversionchange']); // , { objectStoreNames: objectStoreNames, version: 1 }
    (database.objectStoreNames as any) = objectStoreNames;
    (database.version as any) = 1;

    openRequest = jasmine.createSpyObj<IDBOpenDBRequest>('IDBOpenDBRequest', ['onsuccess']); // , { result: database }
    (openRequest.result as any) = database;

    database.transaction.and.callFake(() => {
      return transaction;
    });

    dbFactory = jasmine.createSpyObj<IDBFactory>('IDBFactory', ['open']);

    dbFactory.open.and.callFake(() => {
      setTimeout(() => {
        openRequest.onsuccess?.(new Event('success'));
      }, 0);

      return openRequest;
    });
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        IndexedDBCacheProvider,
        { provide: INDEXED_DB_CACHE_PROVIDER_OPTIONS, useValue: { cacheName: 'testcache', objectStoreName: 'values', defaultCacheTimeInMS: 300000 } },
        { provide: INDEXED_DB, useValue: dbFactory }
      ]
    });

    cacheProvider = TestBed.inject(IndexedDBCacheProvider);
  });

  it('should be created', () => {
    expect(cacheProvider).toBeTruthy();
  });

  it('should handle onupgradeneeded', done => {
    dbFactory.open.and.callFake(() => {
      setTimeout(() => {
        openRequest.onupgradeneeded?.({ oldVersion: 0, newVersion: 1, target: openRequest } as any);
        openRequest.onsuccess?.(new Event('success'));
      }, 0);

      return openRequest;
    });

    cacheProvider.clear$().subscribe(() => {
      expect(dbFactory.open).toHaveBeenCalledWith('testcache', 1);
      expect(database.createObjectStore).toHaveBeenCalledWith('values', { keyPath: 'key' });
      done();
    });
  });

  it('should handle onblocked', done => {
    dbFactory.open.and.callFake(() => {
      setTimeout(() => {
        openRequest.onblocked?.({ oldVersion: 0, newVersion: 1, target: openRequest } as any);
        openRequest.onsuccess?.(new Event('success'));
      }, 0);

      return openRequest;
    });

    cacheProvider.clear$().subscribe(() => {
      expect(dbFactory.open).toHaveBeenCalledWith('testcache', 1);
      done();
    });
  });

  it('should handle onversionchange', fakeAsync(() => {
    dbFactory.open.and.callFake(() => {
      setTimeout(() => {
        database.onversionchange?.({ oldVersion: 0, newVersion: 1, target: openRequest } as any);
        openRequest.onsuccess?.(new Event('success'));
        setTimeout(() => {
          database.onversionchange?.({ oldVersion: 0, newVersion: 1, target: openRequest } as any);
        }, 0);
      }, 0);
      return openRequest;
    });

    cacheProvider.clear$().subscribe();

    flush();

    expect(dbFactory.open).toHaveBeenCalledWith('testcache', 1);
    expect(database.close).toHaveBeenCalled();
  }));

  it('should clear cache', done => {
    cacheProvider.clear$()
      .subscribe(() => {
        expect(dbFactory.open).toHaveBeenCalledWith('testcache', 1);
        expect(database.transaction).toHaveBeenCalledWith(['values'], 'readwrite');
        expect(transaction.objectStore).toHaveBeenCalledWith('values');
        expect(objectStore.clear).toHaveBeenCalledWith();
        done();
      });
  });

  it('should set cache item', done => {
    jasmine.clock().install();

    const now = new Date();
    jasmine.clock().mockDate(now);

    const key = 'test-key';
    const value = 'test-value';

    cacheProvider.set$(key, value).subscribe(() => {
      expect(dbFactory.open).toHaveBeenCalledWith('testcache', 1);
      expect(database.transaction).toHaveBeenCalledWith(['values'], 'readwrite');
      expect(transaction.objectStore).toHaveBeenCalledWith('values');
      const result = objectStore.put.calls.first().args[0];
      expect(result.key).toEqual(key);
      expect(result.value).toEqual(value);
      expect(result.expires).toEqual(new Date(now.getTime() + 300000).toISOString());
      jasmine.clock().uninstall();
      done();
    });
    jasmine.clock().tick(1);
  });

  it('should get cache item', done => {
    const key = 'test-key';
    const value = 'test-value';

    (dbRequest.result as any) = { value, expires: new Date(new Date().getTime() + 10000) };

    cacheProvider.get$(key).subscribe(cacheItem => {
      expect(cacheItem).toEqual(value);
      expect(dbFactory.open).toHaveBeenCalledWith('testcache', 1);
      expect(database.transaction).toHaveBeenCalledWith(['values'], 'readonly');
      expect(transaction.objectStore).toHaveBeenCalledWith('values');
      expect(objectStore.get.calls.first().args[0] === key).toBeTruthy();
      done();
    });
  });

  it('should return null for null item', done => {
    const key = 'non-existent-key';

    (Object.getOwnPropertyDescriptor(dbRequest, 'result')?.get as jasmine.Spy)?.and.returnValue(null);

    cacheProvider.get$(key).subscribe(cacheItem => {
      expect(cacheItem).toBeNull();
      expect(dbFactory.open).toHaveBeenCalledWith('testcache', 1);
      expect(database.transaction).toHaveBeenCalledTimes(1);
      expect(database.transaction).toHaveBeenCalledWith(['values'], 'readonly');
      expect(transaction.objectStore).toHaveBeenCalledTimes(1);
      expect(transaction.objectStore).toHaveBeenCalledWith('values');
      expect(objectStore.get.calls.first().args[0] === key).toBeTruthy();
      done();
    });
  });

  it('should return null for undefined item', done => {
    const key = 'non-existent-key';

    (Object.getOwnPropertyDescriptor(dbRequest, 'result')?.get as jasmine.Spy)?.and.returnValue(undefined);

    cacheProvider.get$(key).subscribe(cacheItem => {
      expect(cacheItem).toBeNull();
      expect(dbFactory.open).toHaveBeenCalledWith('testcache', 1);
      expect(database.transaction).toHaveBeenCalledTimes(1);
      expect(database.transaction).toHaveBeenCalledWith(['values'], 'readonly');
      expect(transaction.objectStore).toHaveBeenCalledTimes(1);
      expect(transaction.objectStore).toHaveBeenCalledWith('values');
      expect(objectStore.get.calls.first().args[0] === key).toBeTruthy();
      done();
    });
  });

  it('should invalidate cache item', done => {
    const key = 'test-key';

    cacheProvider.invalidate$(key).subscribe(() => {
      expect(dbFactory.open).toHaveBeenCalledWith('testcache', 1);
      expect(database.transaction).toHaveBeenCalledWith(['values'], 'readwrite');
      expect(transaction.objectStore).toHaveBeenCalledWith('values');
      expect(objectStore.delete.calls.first().args[0] === key).toBeTruthy();
      done();
    });
  });

  it('should return null for expired cache item', done => {
    const key = 'test-key';

    (Object.getOwnPropertyDescriptor(dbRequest, 'result')?.get as jasmine.Spy)?.and.returnValue({ value: 'test-value', expires: new Date(new Date().getTime() - 10000) });

    cacheProvider.get$(key).subscribe(cacheItem => {
      expect(cacheItem).toBeNull();
      expect(dbFactory.open).toHaveBeenCalledWith('testcache', 1);
      expect(database.transaction).toHaveBeenCalledTimes(1);
      expect(database.transaction).toHaveBeenCalledWith(['values'], 'readonly');
      expect(transaction.objectStore).toHaveBeenCalledTimes(1);
      expect(transaction.objectStore).toHaveBeenCalledWith('values');
      expect(objectStore.get.calls.first().args[0] === key).toBeTruthy();
      done();
    });
  });

  it('should handle not a date expires', done => {
    const key = 'test-key';

    (Object.getOwnPropertyDescriptor(dbRequest, 'result')?.get as jasmine.Spy)?.and.returnValue({ value: 'test-value', expires: 'invalid date' });

    cacheProvider.get$(key).subscribe(cacheItem => {
      expect(cacheItem).toBeNull();
      done();
    });
  });

  it('should handle null expires', done => {
    const key = 'test-key';

    (Object.getOwnPropertyDescriptor(dbRequest, 'result')?.get as jasmine.Spy)?.and.returnValue({ value: 'test-value', expires: null });

    cacheProvider.get$(key).subscribe(cacheItem => {
      expect(cacheItem).toBeNull();
      done();
    });
  });

  it('should handle undefined expires', done => {
    const key = 'test-key';

    (Object.getOwnPropertyDescriptor(dbRequest, 'result')?.get as jasmine.Spy)?.and.returnValue({ value: 'test-value', expires: undefined });

    cacheProvider.get$(key).subscribe(cacheItem => {
      expect(cacheItem).toBeNull();
      done();
    });
  });

  describe('when dbFactory.open throws an error', () => {
    beforeEach(() => {
      dbFactory.open.and.throwError('test-error');
    });

    it('should ignore error on clear', done => {
      cacheProvider.clear$().subscribe(() => {
        expect(dbFactory.open).toHaveBeenCalledWith('testcache', 1);
        expect(database.transaction).toHaveBeenCalledTimes(0);
        expect(transaction.objectStore).toHaveBeenCalledTimes(0);
        expect(objectStore.clear).toHaveBeenCalledTimes(0);
        done();
      });
    });

    it('should ignore error on set', done => {
      cacheProvider.set$('test-key', 'test-value').subscribe(() => {
        expect(dbFactory.open).toHaveBeenCalledWith('testcache', 1);
        expect(database.transaction).toHaveBeenCalledTimes(0);
        expect(transaction.objectStore).toHaveBeenCalledTimes(0);
        expect(objectStore.put.calls.count()).toBe(0);
        done();
      });
    });

    it('should ignore error on get', done => {
      cacheProvider.get$('test-key').subscribe(cacheItem => {
        expect(cacheItem).toBeNull();
        expect(dbFactory.open).toHaveBeenCalledWith('testcache', 1);
        expect(database.transaction).toHaveBeenCalledTimes(0);
        expect(transaction.objectStore).toHaveBeenCalledTimes(0);
        expect(objectStore.get.calls.count()).toBe(0);
        done();
      });
    });

    it('should ignore error on invalidate', done => {
      cacheProvider.invalidate$('test-key').subscribe(() => {
        expect(dbFactory.open).toHaveBeenCalledWith('testcache', 1);
        expect(database.transaction).toHaveBeenCalledTimes(0);
        expect(transaction.objectStore).toHaveBeenCalledTimes(0);
        expect(objectStore.delete.calls.count()).toBe(0);
        done();
      });
    });
  });

  describe('when dbFactory.open errors', () => {
    beforeEach(() => {
      dbFactory.open.and.callFake(() => {
        setTimeout(() => {
          openRequest.onerror?.(new Event('error'));
        }, 0);

        return openRequest;
      });
    });

    it('should ignore error on clear', done => {
      cacheProvider.clear$().subscribe(() => {
        expect(dbFactory.open).toHaveBeenCalledWith('testcache', 1);
        expect(database.transaction).toHaveBeenCalledTimes(0);
        expect(transaction.objectStore).toHaveBeenCalledTimes(0);
        expect(objectStore.clear).toHaveBeenCalledTimes(0);
        done();
      });
    });

    it('should ignore error on set', done => {
      cacheProvider.set$('test-key', 'test-value').subscribe(() => {
        expect(dbFactory.open).toHaveBeenCalledWith('testcache', 1);
        expect(database.transaction).toHaveBeenCalledTimes(0);
        expect(transaction.objectStore).toHaveBeenCalledTimes(0);
        expect(objectStore.put.calls.count()).toBe(0);
        done();
      });
    });

    it('should ignore error on get', done => {
      cacheProvider.get$('test-key').subscribe(cacheItem => {
        expect(cacheItem).toBeNull();
        expect(dbFactory.open).toHaveBeenCalledWith('testcache', 1);
        expect(database.transaction).toHaveBeenCalledTimes(0);
        expect(transaction.objectStore).toHaveBeenCalledTimes(0);
        expect(objectStore.get.calls.count()).toBe(0);
        done();
      });
    });

    it('should ignore error on invalidate', done => {
      cacheProvider.invalidate$('test-key').subscribe(() => {
        expect(dbFactory.open).toHaveBeenCalledWith('testcache', 1);
        expect(database.transaction).toHaveBeenCalledTimes(0);
        expect(transaction.objectStore).toHaveBeenCalledTimes(0);
        expect(objectStore.delete.calls.count()).toBe(0);
        done();
      });
    });
  });

  describe('when db.transaction throws an error', () => {
    beforeEach(() => {
      database.transaction.and.throwError('test-error');
    });

    it('should ignore error on clear', done => {
      cacheProvider.clear$().subscribe(() => {
        expect(dbFactory.open).toHaveBeenCalledWith('testcache', 1);
        expect(database.transaction).toHaveBeenCalledWith(['values'], 'readwrite');
        expect(transaction.objectStore).toHaveBeenCalledTimes(0);
        expect(objectStore.clear).toHaveBeenCalledTimes(0);
        done();
      });
    });

    it('should ignore error on set', done => {
      cacheProvider.set$('test-key', 'test-value').subscribe(() => {
        expect(dbFactory.open).toHaveBeenCalledWith('testcache', 1);
        expect(database.transaction).toHaveBeenCalledWith(['values'], 'readwrite');
        expect(transaction.objectStore).toHaveBeenCalledTimes(0);
        expect(objectStore.put.calls.count()).toBe(0);
        done();
      });
    });

    it('should ignore error on get', done => {
      cacheProvider.get$('test-key').subscribe(cacheItem => {
        expect(cacheItem).toBeNull();
        expect(dbFactory.open).toHaveBeenCalledWith('testcache', 1);
        expect(database.transaction).toHaveBeenCalledWith(['values'], 'readonly');
        expect(transaction.objectStore).toHaveBeenCalledTimes(0);
        expect(objectStore.get.calls.count()).toBe(0);
        done();
      });
    });

    it('should ignore error on invalidate', done => {
      cacheProvider.invalidate$('test-key').subscribe(() => {
        expect(dbFactory.open).toHaveBeenCalledWith('testcache', 1);
        expect(database.transaction).toHaveBeenCalledWith(['values'], 'readwrite');
        expect(transaction.objectStore).toHaveBeenCalledTimes(0);
        expect(objectStore.delete.calls.count()).toBe(0);
        done();
      });
    });
  });

  describe('when transaction.objectStore throws an error', () => {
    beforeEach(() => {
      transaction.objectStore.and.throwError('test-error');
    });

    it('should ignore error on clear', done => {
      cacheProvider.clear$().subscribe(() => {
        expect(dbFactory.open).toHaveBeenCalledWith('testcache', 1);
        expect(database.transaction).toHaveBeenCalledWith(['values'], 'readwrite');
        expect(transaction.objectStore).toHaveBeenCalledWith('values');
        expect(objectStore.clear).toHaveBeenCalledTimes(0);
        done();
      });
    });

    it('should ignore error on set', done => {
      cacheProvider.set$('test-key', 'test-value').subscribe(() => {
        expect(dbFactory.open).toHaveBeenCalledWith('testcache', 1);
        expect(database.transaction).toHaveBeenCalledWith(['values'], 'readwrite');
        expect(transaction.objectStore).toHaveBeenCalledWith('values');
        expect(objectStore.put.calls.count()).toBe(0);
        done();
      });
    });

    it('should ignore error on get', done => {
      cacheProvider.get$('test-key').subscribe(cacheItem => {
        expect(cacheItem).toBeNull();
        expect(dbFactory.open).toHaveBeenCalledWith('testcache', 1);
        expect(database.transaction).toHaveBeenCalledWith(['values'], 'readonly');
        expect(transaction.objectStore).toHaveBeenCalledWith('values');
        expect(objectStore.get.calls.count()).toBe(0);
        done();
      });
    });

    it('should ignore error on invalidate', done => {
      cacheProvider.invalidate$('test-key').subscribe(() => {
        expect(dbFactory.open).toHaveBeenCalledWith('testcache', 1);
        expect(database.transaction).toHaveBeenCalledWith(['values'], 'readwrite');
        expect(transaction.objectStore).toHaveBeenCalledWith('values');
        expect(objectStore.delete.calls.count()).toBe(0);
        done();
      });
    });
  });

  it('should handle clear onerror', done => {
    objectStore.clear.and.callFake(() => {
      setTimeout(() => {
        dbRequest.onerror?.(new Event('error'));
      }, 0);

      return dbRequest;
    });

    cacheProvider.clear$().subscribe(() => {
      expect(dbFactory.open).toHaveBeenCalledWith('testcache', 1);
      expect(database.transaction).toHaveBeenCalledWith(['values'], 'readwrite');
      expect(transaction.objectStore).toHaveBeenCalledWith('values');
      expect(objectStore.clear.calls.count()).toBe(1);
      done();
    });
  });

  it('should handle set onerror', done => {
    objectStore.put.and.callFake(() => {
      setTimeout(() => {
        dbRequest.onerror?.(new Event('error'));
      }, 0);

      return dbRequest;
    });

    cacheProvider.set$('test-key', 'test-value').subscribe(() => {
      expect(dbFactory.open).toHaveBeenCalledWith('testcache', 1);
      expect(database.transaction).toHaveBeenCalledWith(['values'], 'readwrite');
      expect(transaction.objectStore).toHaveBeenCalledWith('values');
      expect(objectStore.put.calls.count()).toBe(1);
      done();
    });
  });

  it('should handle delete onerror', done => {
    objectStore.delete.and.callFake(() => {
      setTimeout(() => {
        dbRequest.onerror?.(new Event('error'));
      }, 0);

      return dbRequest;
    });

    cacheProvider.invalidate$('test-key').subscribe(() => {
      expect(dbFactory.open).toHaveBeenCalledWith('testcache', 1);
      expect(database.transaction).toHaveBeenCalledWith(['values'], 'readwrite');
      expect(transaction.objectStore).toHaveBeenCalledWith('values');
      expect(objectStore.delete.calls.count()).toBe(1);
      done();
    });
  });

  describe('when get errors', () => {
    it('should return null from get on unexpected error', done => {
      // const error = new DOMException('test-error', 'InvalidStateError');
      objectStore.get.and.throwError('test-error');

      cacheProvider.get$('test-key').subscribe(cacheItem => {
        expect(cacheItem).toBeNull();
        expect(dbFactory.open).toHaveBeenCalledWith('testcache', 1);
        expect(database.transaction).toHaveBeenCalledTimes(1);
        expect(database.transaction).toHaveBeenCalledWith(['values'], 'readonly');
        expect(transaction.objectStore).toHaveBeenCalledTimes(1);
        expect(transaction.objectStore).toHaveBeenCalledWith('values');
        expect(objectStore.get.calls.first().args[0] === 'test-key').toBeTruthy();
        done();
      });
    });

    it('should return null from get on error', done => {
      objectStore.get.and.callFake(() => {
        setTimeout(() => {
          dbRequest.onerror?.(new Event('error'));
        }, 0);

        return dbRequest;
      });

      cacheProvider.get$('test-key').subscribe(cacheItem => {
        expect(cacheItem).toBeNull();
        expect(dbFactory.open).toHaveBeenCalledWith('testcache', 1);
        expect(database.transaction).toHaveBeenCalledTimes(1);
        expect(database.transaction).toHaveBeenCalledWith(['values'], 'readonly');
        expect(transaction.objectStore).toHaveBeenCalledTimes(1);
        expect(transaction.objectStore).toHaveBeenCalledWith('values');
        expect(objectStore.get.calls.first().args[0] === 'test-key').toBeTruthy();
        done();
      });
    });
  });
});
