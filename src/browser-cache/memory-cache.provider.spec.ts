import { TestBed } from "@angular/core/testing";
import { MEMORY_CACHE, MemoryCacheProvider } from "./memory-cache.provider";

describe('MemoryCacheProvider', () => {
  let cacheProvider: MemoryCacheProvider;
  let cache: jasmine.SpyObj<Map<string, any>>;
  let now: Date;

  beforeEach(() => {
    jasmine.clock().install();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  beforeEach(() => {
    now = new Date();
    jasmine.clock().mockDate(now);
    cache = jasmine.createSpyObj<Map<string, any>>('Map', ['clear', 'get', 'set', 'delete']);

    TestBed.configureTestingModule({
      providers: [
        MemoryCacheProvider,
        {
          provide: MEMORY_CACHE,
          useValue: cache
        }
      ]
    });
    cacheProvider = TestBed.inject(MemoryCacheProvider);
  });

  it('should be created', () => {
    expect(cacheProvider).toBeTruthy();
  });

  it('should return undefined when clear', (done) => {
    cacheProvider.clear$().subscribe(value => {
      expect(value).toBeUndefined();
      expect(cache.clear).toHaveBeenCalled();
      done();
    });
  });

  it('should return null when getting a value', (done) => {
    cacheProvider.get$('key').subscribe(value => {
      expect(value).toBeNull();
      expect(cache.get).toHaveBeenCalledWith('key');
      done();
    });
  });

  it('should return undefined when setting a value', (done) => {
    cacheProvider.set$('key', 'value').subscribe(value => {
      expect(value).toBeUndefined();
      expect(cache.set.calls.first().args[0]).toBe('key');
      const valueArg = cache.set.calls.first().args[1];
      expect(valueArg.value).toBe('value');
      const resultExpires = new Date(valueArg.expires);
      const expectedExpires = new Date(now.getTime() + 300000);
      expect(resultExpires).toEqual(expectedExpires);
      done();
    });
  });

  it('should return undefined when invalidate a value', (done) => {
    cacheProvider.invalidate$('key').subscribe(value => {
      expect(value).toBeUndefined();
      expect(cache.delete).toHaveBeenCalledWith('key');
      done();
    });
  });
});
