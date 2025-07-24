import { TestBed } from '@angular/core/testing';
import { IndexedDbCacheService } from "./indexed-db-cache.service";

describe('IndexedDbCacheService', () => {
    let service: IndexedDbCacheService;
    const tenMinuteDuration = 60 * 10 * 1000;
    const cacheKey = "testCacheKey";

    beforeEach(async () => { 
        TestBed.configureTestingModule({ providers: [
            IndexedDbCacheService
        ]});
        service = TestBed.inject(IndexedDbCacheService);

        await service.remove(cacheKey)
     });

     it('getOrAdd should return cached value',
     async () => {
         let expected = 100;
         let actual = await service.getOrAdd(cacheKey, () => Promise.resolve(expected), tenMinuteDuration)
         expect(actual).toBe(expected);
 
         actual = await service.getOrAdd(cacheKey, () => Promise.resolve(5), tenMinuteDuration);
         expect(actual).toBe(expected);
     });

     it('getOrAdd should return cached value when duration is not set',
     async () => {
         let expected = 101;
         let actual = await service.getOrAdd(cacheKey, () => Promise.resolve(expected))
         expect(actual).toBe(expected);
 
         actual = await service.getOrAdd(cacheKey, () => Promise.resolve(6), tenMinuteDuration);
         expect(actual).toBe(expected);
     });

     it('getOrAdd should return cached value when duration is zero',
     async () => {
         let expected = 102;
         let actual = await service.getOrAdd(cacheKey, () => Promise.resolve(expected), 0);
         expect(actual).toBe(expected);
 
         actual = await service.getOrAdd(cacheKey, () => Promise.resolve(7), tenMinuteDuration);
         expect(actual).toBe(expected);
     });

     it('getOrAdd should return cached value when duration is less than 0',
     async () => {
         let expected = 103;
         let actual = await service.getOrAdd(cacheKey, () => Promise.resolve(expected), -10);
         expect(actual).toBe(expected);
 
         actual = await service.getOrAdd(cacheKey, () => Promise.resolve(8), tenMinuteDuration);
         expect(actual).toBe(expected);
     });

    it('getOrAdd should invalidate cache when duration has elasped',
    async () => {
        let expected = 100;
        let actual = await service.getOrAdd(cacheKey, () => Promise.resolve(expected), 1000);
        expect(actual).toBe(expected); 

        await new Promise(resolve => setTimeout(resolve, 2000));

        expected = 15;
        actual = await service.getOrAdd(cacheKey, () => Promise.resolve(expected), tenMinuteDuration);
        expect(expected).toBe(actual); 
    });
});