import { TestBed } from '@angular/core/testing';
import { WebStorageCacheProvider, WebStorageCacheProviderOptions } from './web-storage-cache.provider';
import { Inject, Injectable } from '@angular/core';

@Injectable()
class TestCacheProvider extends WebStorageCacheProvider {
  constructor(
    storage: Storage,
    @Inject('options') options: WebStorageCacheProviderOptions
  ) {
    super(storage, options);
  }
}

describe('WebStorageCacheProvider', () => {
  let cacheProvider: WebStorageCacheProvider;
  let storage: jasmine.SpyObj<Storage>;
  let options: WebStorageCacheProviderOptions;

  beforeEach(() => {
    storage = jasmine.createSpyObj('Storage', ['getItem', 'setItem', 'removeItem', 'key']); // ['length']

    options = {
      defaultCacheTimeInMS: 1000,
    };

    TestBed.configureTestingModule({
      providers: [
        TestCacheProvider,
        {
          provide: Storage,
          useValue: storage,
        },
        {
          provide: 'options',
          useValue: options,
        }
      ]
    });

    cacheProvider = TestBed.inject(TestCacheProvider);
  });

  it('should be created', () => {
    expect(cacheProvider).toBeTruthy();
  });

  it('should clear the cache', (done) => {
    (storage.length as any) = 2;
    storage.key.and.returnValues('TestCacheProvider:1', 'TestCacheProvider:2', 'OtherKey');
    cacheProvider.clear$()
      .subscribe({
        next: () => {
          expect(storage.removeItem).toHaveBeenCalledTimes(2);
          expect(storage.removeItem).toHaveBeenCalledWith('TestCacheProvider:1');
          expect(storage.removeItem).toHaveBeenCalledWith('TestCacheProvider:2');
          done();
        }
      });
  });

  it('should handle errors when clearing the cache', (done) => {
    (storage.length as any) = 2;
    storage.key.and.returnValues('TestCacheProvider:1', 'TestCacheProvider:2', 'OtherKey');
    storage.removeItem.and.throwError('Test error');
    cacheProvider.clear$()
      .subscribe({
        next: () => {
          expect(storage.key).toHaveBeenCalledTimes(1);
          done();
        }
      });
  });

  it('should get a value from the cache', (done) => {
    storage.getItem.and.returnValue(JSON.stringify({ value: 'value', expires: Date.now() + 1000 }));
    cacheProvider.get$<string>('key')
      .subscribe({
        next: value => {
          expect(value).toBe('value');
          expect(storage.getItem).toHaveBeenCalledWith('TestCacheProvider:key');
          done();
        }
      });
  });

  it('should null from the cache that has expired', (done) => {
    storage.getItem.and.returnValue(JSON.stringify({ value: 'value', expires: Date.now() - 1000 }));
    cacheProvider.get$<string>('key')
      .subscribe({
        next: value => {
          expect(value).toBeNull();
          expect(storage.getItem).toHaveBeenCalledWith('TestCacheProvider:key');
          done();
        }
      });
  });

  it('should null from the cache that is not found', (done) => {
    storage.getItem.and.returnValue(null);
    cacheProvider.get$<string>('key')
      .subscribe({
        next: value => {
          expect(value).toBeNull();
          expect(storage.getItem).toHaveBeenCalledWith('TestCacheProvider:key');
          done();
        }
      });
  });

  it('should handle errors when getting a value from the cache', (done) => {
    storage.getItem.and.throwError('Test error');
    cacheProvider.get$<string>('key')
      .subscribe({
        next: value => {
          expect(value).toBeNull();
          expect(storage.getItem).toHaveBeenCalledWith('TestCacheProvider:key');
          done();
        }
      });
  });

  it('should set a value in the cache', (done) => {
    cacheProvider.set$('key', 'value')
      .subscribe({
        next: () => {
          expect(storage.setItem).toHaveBeenCalledTimes(1);
          expect(storage.setItem.calls.first().args[0]).toBe('TestCacheProvider:key');
          const item = JSON.parse(storage.setItem.calls.first().args[1]);
          expect(item.value).toBe('value');
          expect(new Date(item.expires)).toEqual(jasmine.any(Date));
          done();
        }
      });
  });

  it('should handle errors when setting a value in the cache', (done) => {
    storage.setItem.and.throwError('Test error');
    cacheProvider.set$('key', 'value')
      .subscribe({
        next: () => {
          expect(storage.setItem).toHaveBeenCalledTimes(1);
          expect(storage.setItem.calls.first().args[0]).toBe('TestCacheProvider:key');
          const item = JSON.parse(storage.setItem.calls.first().args[1]);
          expect(item.value).toBe('value');
          expect(new Date(item.expires)).toEqual(jasmine.any(Date));
          done();
        }
      });
  });

  it('should invalidate an item in the cahce', (done) => {
    cacheProvider.invalidate$('key')
      .subscribe({
        next: () => {
          expect(storage.removeItem).toHaveBeenCalledWith('TestCacheProvider:key');
          done();
        }
      });
  });

  it('should handle errors when invalidating an item in the cahce', (done) => {
    storage.removeItem.and.throwError('Test error');
    cacheProvider.invalidate$('key')
      .subscribe({
        next: () => {
          expect(storage.removeItem).toHaveBeenCalledWith('TestCacheProvider:key');
          done();
        }
      });
  });
});
