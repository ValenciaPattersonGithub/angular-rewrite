import { TestBed, fakeAsync } from "@angular/core/testing";
import { NoCacheProvider } from "./no-cache.provider";

describe('NoCacheProvider', () => {
    let cacheProvider: NoCacheProvider;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [NoCacheProvider]
        });
        cacheProvider = TestBed.inject(NoCacheProvider);
    });

    it('should be created', () => {
        expect(cacheProvider).toBeTruthy();
    });

    it('should return undefined when clear', fakeAsync(() => {
        cacheProvider.clear$().subscribe(value => {
            expect(value).toBeUndefined();
        });
    }));

    it('should return null when getting a value', fakeAsync(() => {
        cacheProvider.get$('key').subscribe(value => {
            expect(value).toBeNull();
        });
    }));

    it('should return undefined when setting a value', fakeAsync(() => {
        cacheProvider.set$('key', 'value').subscribe(value => {
            expect(value).toBeUndefined();
        });
    }));

    it('should return undefined when invalidate a value', fakeAsync(() => {
        cacheProvider.invalidate$('key').subscribe(value => {
            expect(value).toBeUndefined();
        });
    }));
});
