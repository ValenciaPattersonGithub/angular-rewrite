import { of } from 'rxjs';
import { cache, cacheRefresh } from './cache-operators';
import { ICacheProvider } from './i-cache-provider';
import { TestScheduler } from 'rxjs/testing';

describe('cache-operator', () => {
  let cacheProvider: ICacheProvider;
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });

    cacheProvider = {
      get$: jasmine.createSpy('get').and.returnValue(of(null)),
      set$: jasmine.createSpy('set').and.returnValue(of(null)),
      invalidate$: jasmine.createSpy('invalidate').and.returnValue(of(null)),
      clear$: jasmine.createSpy('clear').and.returnValue(of(null))
    };
  });

  it('should return cached value if available', (done) => {
    const key = 'test-key';
    const cacheTimeInMS = 300000;
    const cachedValue = 'cached-value';
    (cacheProvider.get$ as jasmine.Spy).and.returnValue(of(cachedValue));

    const source$ = of('new-value').pipe(cache(cacheProvider, key, cacheTimeInMS));
    source$.subscribe(value => {
      expect(value).toEqual(cachedValue);
      expect(cacheProvider.get$).toHaveBeenCalledWith(key);
      expect(cacheProvider.set$).not.toHaveBeenCalled();
      expect(cacheProvider.invalidate$).not.toHaveBeenCalled();
      done();
    });
  });

  it('should return cached value if available using default cache time', (done) => {
    const key = 'test-key';
    const cachedValue = 'cached-value';
    (cacheProvider.get$ as jasmine.Spy).and.returnValue(of(cachedValue));

    const source$ = of('new-value').pipe(cache(cacheProvider, key));
    source$.subscribe(value => {
      expect(value).toEqual(cachedValue);
      expect(cacheProvider.get$).toHaveBeenCalledWith(key);
      expect(cacheProvider.set$).not.toHaveBeenCalled();
      expect(cacheProvider.invalidate$).not.toHaveBeenCalled();
      done();
    });
  });

  it('should execute source observable and cache the result if cached value is not available', (done) => {
    const key = 'test-key';
    const cacheTimeInMS = 300000;
    const newValue = 'new-value';

    const source$ = of(newValue).pipe(cache(cacheProvider, key, cacheTimeInMS));
    source$.subscribe(value => {
      expect(value).toEqual(newValue);
      expect(cacheProvider.get$).toHaveBeenCalledWith(key);
      expect(cacheProvider.set$).toHaveBeenCalledWith(key, newValue, cacheTimeInMS);
      expect(cacheProvider.invalidate$).not.toHaveBeenCalled();
      done();
    });
  });

  describe('cacheRefresh', () => {
    it('should invalidate the cache at the specified interval and execute the source observable', () => {
      testScheduler.run(({ cold, expectObservable, flush }) => {
        const input = cold('a|', { a: 'new-value' });
        const unsub = '11000ms !'
        const result = input.pipe(cacheRefresh(cacheProvider, 'planets', 10000));
        expectObservable(result, unsub).toBe('a 9999ms a', { a: 'new-value' });
        flush();
        expect(cacheProvider.invalidate$).toHaveBeenCalled();
      });
    });

    it('should invalidate the cache at the specified interval and execute the source observable with default cache time', () => {
      testScheduler.run(({ cold, expectObservable, flush }) => {
        const input = cold('a|', { a: 'new-value' });
        const unsub = '310000ms !'
        const result = input.pipe(cacheRefresh(cacheProvider, 'planets'));
        expectObservable(result, unsub).toBe('a 299999ms a', { a: 'new-value' });
        flush();
        expect(cacheProvider.invalidate$).toHaveBeenCalled();
      });
    });
  });
});
