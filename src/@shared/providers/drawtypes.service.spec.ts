import { TestBed } from '@angular/core/testing';
import { DrawTypesService } from './drawtypes.service';
import { HttpClient } from '@angular/common/http';
import { MicroServiceApiService } from 'src/security/providers';
import { IndexedDbCacheService } from './indexed-db-cache.service';
import { of } from 'rxjs';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { DrawTypeModel } from 'src/business-center/practice-settings/chart/draw-types/draw-types.model';

let mockDrawTypes: DrawTypeModel[] = [
    {
        AffectedAreaName: "Name 1",
        DrawType: "Draw type 1",
        GroupNumber: 1,
        PathLocator: "path locator 1",
        PracticeId: 12345,
        AffectedAreaId: 3,
        DataTag: "AAAAAAAg/FQ=",
        DateModified: "2022-12-31T11:52:38.534119",
        Description: "Blunted Roots",
        DrawTypeId: "1013522d-e533-4aae-a226-3d1bcc95e9cb",
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
    },
    {
        AffectedAreaName: "Name 2",
        DrawType: "Draw type 2",
        GroupNumber: 2,
        PathLocator: "path locator 2",
        PracticeId: 12345,
        AffectedAreaId: 3,
        DataTag: "AAAAAAAg/Fg=",
        DateModified: "2022-12-31T12:01:47.5373681",
        Description: "Abscess",
        DrawTypeId: "74281d3a-d274-4306-8873-86b0b4427f2a",
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
    }
]

let mockApiUrl = "http://localhost";

describe('DrawTypesService', () => {
    let service: DrawTypesService;
    let httpClientSpy: jasmine.SpyObj<HttpClient>;
    let microServiceApiSpy: jasmine.SpyObj<MicroServiceApiService>;
    let indexedDbCacheSpy: jasmine.SpyObj<IndexedDbCacheService>;

    beforeEach(() => {
        httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
        microServiceApiSpy = jasmine.createSpyObj('MicroServiceApiService', ['getPracticesUrl']);
        indexedDbCacheSpy = jasmine.createSpyObj('IndexedDbCacheService', ['getOrAdd', 'remove']);

        TestBed.configureTestingModule({
            providers: [
                DrawTypesService,
                { provide: HttpClient, useValue: httpClientSpy },
                { provide: MicroServiceApiService, useValue: microServiceApiSpy },
                { provide: IndexedDbCacheService, useValue: indexedDbCacheSpy }
            ]
        });

        service = TestBed.inject(DrawTypesService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getAll', () => {
        it('should return draw types from cache if present', async () => {
            const cachedData: DrawTypeModel[] = mockDrawTypes;
            indexedDbCacheSpy.getOrAdd.and.returnValue(Promise.resolve(cachedData));

            const result = await service.getAll();
            expect(result).toEqual(cachedData);
            expect(indexedDbCacheSpy.getOrAdd).toHaveBeenCalled();
        });

        it('should fetch draw types from API if not cached', async () => {
            const apiResponse: SoarResponse<DrawTypeModel[]> = { Value: mockDrawTypes } as any;

            microServiceApiSpy.getPracticesUrl.and.returnValue(mockApiUrl);
            httpClientSpy.get.and.returnValue(of(apiResponse));
            // Simulate cache miss by calling the factory function
            indexedDbCacheSpy.getOrAdd.and.callFake((key, factory) => factory());

            const result = await service.getAll();
            expect(microServiceApiSpy.getPracticesUrl).toHaveBeenCalled();
            expect(httpClientSpy.get).toHaveBeenCalledWith(mockApiUrl + '/api/v1/drawtypes');
            expect(result).toEqual(apiResponse.Value);
        });

        it('should return empty array if API returns null Value', async () => {
            const apiResponse: SoarResponse<DrawTypeModel[]> = { Value: null } as any;

            microServiceApiSpy.getPracticesUrl.and.returnValue(mockApiUrl);
            httpClientSpy.get.and.returnValue(of(apiResponse));
            indexedDbCacheSpy.getOrAdd.and.callFake((key, factory) => factory());

            const result = await service.getAll();
            expect(result).toEqual([]);
        });
    });

    describe('clearCache', () => {
        it('should remove draw types from cache', () => {
            service.clearCache();
            expect(indexedDbCacheSpy.remove).toHaveBeenCalledWith('cachedDrawTypes');
        });
    });
});
