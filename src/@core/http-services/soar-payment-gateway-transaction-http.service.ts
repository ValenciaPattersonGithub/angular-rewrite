import { Inject, Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { CoreModule } from '../core.module';
import { SoarResponse } from '../models/core/soar-response';
import { IndexedDbCacheService } from 'src/@shared/providers/indexed-db-cache.service';

export class UnappliedBulkInsurancePayment {
        PaymentDate: Date;
        CarrierId: string;
        CarrierName: string;
        LocationId: number;
        LocationName: string;
        Amount: number;
        PaymentGatewayTransactionId: number;
        CardLastFour: string;
        PaymentTypeId: string;
        PaymentTypeDescription: string;
        PayerId: string;
}

@Injectable({
    providedIn: CoreModule
})
export class SoarPaymentGatewayTransactionHttpService {
    constructor(
        @Inject('SoarConfig') private soarConfig: any,
        @Inject("locationService") private locationService,
        private indexedDbCacheService: IndexedDbCacheService,
        private httpClient: HttpClient
    ) { } 
        
    async requestUnappliedBulkInsurancePayments(clearCache?: Boolean): Promise<SoarResponse<UnappliedBulkInsurancePayment[]>> {
        const url = `${this.soarConfig.domainUrl}/paymentGateway/bulkinsurancepayment/unapplied`;

        const userLocation = this.locationService.getCurrentLocation();
        const cacheKey = `requestUnappliedBulkInsurancePayments:${userLocation.id}`;

        if(clearCache)
            await this.indexedDbCacheService.remove(cacheKey);

        return await this.indexedDbCacheService.getOrAdd<SoarResponse<UnappliedBulkInsurancePayment[]>>(cacheKey, () => {
            return this.httpClient.get<SoarResponse<UnappliedBulkInsurancePayment[]>>(url).toPromise();
        }, 60 * 10 * 1000);
    }
}