import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { DrawTypeModel } from 'src/business-center/practice-settings/chart/draw-types/draw-types.model';
import { MicroServiceApiService } from 'src/security/providers';
import { IndexedDbCacheService } from 'src/@shared/providers/indexed-db-cache.service';

@Injectable({
    providedIn: 'root'
})
export class DrawTypesService {
    private readonly DRAW_TYPES_CACHE_KEY = 'cachedDrawTypes';

    constructor(
        private httpClient: HttpClient,
        private microServiceApis: MicroServiceApiService,
        private indexedDbCacheService: IndexedDbCacheService
    ) { }

    getAll = (): Promise<DrawTypeModel[]> => {
        const url = this.microServiceApis.getPracticesUrl() + `/api/v1/drawtypes`;
        // No expiration: cache persists until cleared
        return this.indexedDbCacheService.getOrAdd(
            this.DRAW_TYPES_CACHE_KEY,
            async () => {
                const res = await this.httpClient.get<SoarResponse<DrawTypeModel[]>>(url).toPromise();
                return res.Value ?? [];
            }
        );
    }

    clearCache = (): void => {
        this.indexedDbCacheService.remove(this.DRAW_TYPES_CACHE_KEY);
        console.log('Draw types cache cleared from IndexedDB');
    }
}
