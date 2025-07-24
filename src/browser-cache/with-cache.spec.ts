import { TestScheduler } from "rxjs/testing";
import { withCache } from "./with-cache";
import { ICacheProvider } from "./i-cache-provider";

describe('with-cache', () => {
  let testScheduler: TestScheduler;
  let cacheProvider: jasmine.SpyObj<ICacheProvider>;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  beforeEach(() => {
    cacheProvider = jasmine.createSpyObj<ICacheProvider>('ICacheProvider', ['get$', 'set$']);
  });

  it('should create a cached observable', () => {
    testScheduler.run(({ cold, expectObservable, flush }) => {
      const transform = jasmine.createSpy('transform').and.callFake(value => value);
      cacheProvider.get$.and.returnValue(cold('a|'));
      const source$ = cold('b|');
      const expected = 'a|';
      const result$ = withCache(source$, {
        key: 'key',
        cacheTimeInMS: 300000,
        cacheProvider,
        transform
      });
      expectObservable(result$).toBe(expected);
      flush();
      expect(transform).not.toHaveBeenCalled();
    });
  });

  it('should call source observable when not cached', () => {
    testScheduler.run(({ cold, expectObservable, flush }) => {
      const transform = jasmine.createSpy('transform').and.callFake(_ => 'c');
      cacheProvider.get$.and.returnValue(cold('a|', { a: undefined }));
      cacheProvider.set$.and.returnValue(cold('a|', { a: undefined }));
      const source$ = cold('b|');
      const expected = 'c|';
      const config = {
        key: 'key',
        cacheTimeInMS: 300000,
        cacheProvider,
        transform
      };
      const result$ = withCache(source$, config);
      expectObservable(result$).toBe(expected);
      flush();
      expect(transform).toHaveBeenCalledWith('b');
    });
  });
})
