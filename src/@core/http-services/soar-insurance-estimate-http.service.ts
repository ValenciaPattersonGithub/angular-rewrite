import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { CoreModule } from 'src/@core/core.module';
import { InsuranceEstimateDto, ServiceTransactionEstimateDto } from 'src/accounting/encounter/models/patient-encounter.model';
import { SoarResponse } from '../models/core/soar-response';
import keys from 'lodash/keys';
import assign from 'lodash/assign';
import pick from 'lodash/pick';

@Injectable({
    providedIn: CoreModule
})
export class SoarInsuranceEstimateHttpService {

    constructor(
        @Inject('SoarConfig') private soarConfig: any,
        private httpClient: HttpClient
    ) { }   

    calculateDiscountAndTaxAndInsuranceEstimate(serviceTransactionDtos): Observable<SoarResponse<ServiceTransactionEstimateDto[]>> {
        let serviceTransactions = this.mapToServiceTransactionEstimateDto(serviceTransactionDtos);
        return this.httpClient.post<SoarResponse<ServiceTransactionEstimateDto[]>>(`${this.soarConfig.insuranceSapiUrl}/servicetransactions/calculatediscountandtaxandinsuranceestimate`, serviceTransactions);
    }

    mapToServiceTransactionEstimateDto(serviceTransactionDtos) {
        // get keys for dto
        let servicekeys = keys(new ServiceTransactionEstimateDto()); 
        let estimatekeys = keys(new InsuranceEstimateDto()); 

        return serviceTransactionDtos.map(st => {
            let reduced = new ServiceTransactionEstimateDto();
            assign(reduced , pick(st, servicekeys));
            reduced.InsuranceEstimates = reduced.InsuranceEstimates.map(est => {
                var reducedEstimate = new InsuranceEstimateDto();
                assign(reducedEstimate, pick(est, estimatekeys));                
                return reducedEstimate
            })
            return reduced;
        })        
    }
}