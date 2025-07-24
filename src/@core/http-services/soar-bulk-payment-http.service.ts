import { Inject, Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { CoreModule } from '../core.module';
import { SoarResponse } from '../models/core/soar-response';
import { AllowedAmountOverrideDto, ClaimDto } from '../models/bulk-payment/bulk-insurance-dtos.model';
import { InsuranceEstimateDto } from 'src/accounting/encounter/models/patient-encounter.model';

export class RequestArgs {
    carrierId?:string; 
    payerId?:string;
    locations: any[] ;  
}

@Injectable({
    providedIn: CoreModule
})
export class SoarBulkPaymentHttpService {
    constructor(
        @Inject('SoarConfig') private soarConfig: any,
        private httpClient: HttpClient
    ) { } 
        
    requestClaimsListByPayerId(args: RequestArgs): Observable<SoarResponse<ClaimDto[]>> {
        if (args.payerId != null)
            return this.httpClient.post<SoarResponse<ClaimDto[]>>(
                `${this.soarConfig.insuranceSapiUrl}/insurance/claims/getSubmittedClaimsByPayerId/${args.payerId}`, args.locations);
    }

    requestClaimsListByCarrierId(args: RequestArgs): Observable<SoarResponse<ClaimDto[]>> {
        if (args.carrierId  != null)
            return this.httpClient.post<SoarResponse<ClaimDto[]>>(
                `${this.soarConfig.insuranceSapiUrl}/insurance/claims/getSubmittedClaimsByCarrierId/${args.carrierId}`, args.locations);
    }

    reEstimateClaimServices(args: {claimId: string , allowedAmounts: AllowedAmountOverrideDto[]}): Observable<SoarResponse<InsuranceEstimateDto[]>> {
        return this.httpClient.post<SoarResponse<InsuranceEstimateDto[]>>(
           `${this.soarConfig.insuranceSapiUrl}/insurance/claims/reestimateInsuranceForClaim/${args.claimId}`, args.allowedAmounts);
    }
}



