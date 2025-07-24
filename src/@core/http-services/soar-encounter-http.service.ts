import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { CoreModule } from 'src/@core/core.module';
import { EncounterDto } from 'src/accounting/encounter/models/patient-encounter.model';
import { ServiceTransactionEstimateDto } from 'src/accounting/encounter/models/patient-encounter.model';
import { InsuranceEstimateDto } from 'src/accounting/encounter/models/patient-encounter.model';
import { SoarResponse } from '../models/core/soar-response';
import keys from 'lodash/keys';
import assign from 'lodash/assign';
import pick from 'lodash/pick';

@Injectable({
    providedIn: CoreModule
})
export class SoarEncounterHttpService {

    constructor(
        @Inject('SoarConfig') private soarConfig: any,
        private httpClient: HttpClient
    ) { }

    create(encounterDto): Observable<SoarResponse<EncounterDto>> {
        var encounter = this.mapToEncounterDto([encounterDto], true);
        return this.httpClient.post<SoarResponse<EncounterDto>>(`${this.soarConfig.insuranceSapiUrl}/encounters`, encounter);
    }

    update(encounterDtos): Observable<SoarResponse<EncounterDto[]>> {
        var encounters = this.mapToEncounterDto(encounterDtos);
        return this.httpClient.put<SoarResponse<EncounterDto[]>>(`${this.soarConfig.insuranceSapiUrl}/encounters`, encounters);
    }

    mapToEncounterDto(encounterDtos, create = false) {
        var encounterDtoKeys = keys(new EncounterDto());
        var reducedDtos = encounterDtos.map(e => {
            var reduced = new EncounterDto();
            assign(reduced, pick(e, encounterDtoKeys));
            if (reduced.ServiceTransactionDtos.length > 0) {
                reduced.ServiceTransactionDtos = this.mapToServiceTransactionDto(reduced.ServiceTransactionDtos);
            }
            return reduced;
        });
        if (create === true) {
            return reducedDtos[0];
        }
        else {
            return reducedDtos;
        }        
    }

    mapToServiceTransactionDto(serviceTransactionDtos) {
        var serviceTransactionEstimateDtoKeys = keys(new ServiceTransactionEstimateDto());
        var insuranceEstimateDtoKeys = keys(new InsuranceEstimateDto());
        var reducedDtos = serviceTransactionDtos.map(st => {
            var reduced = new ServiceTransactionEstimateDto();
            assign(reduced, pick(st, serviceTransactionEstimateDtoKeys));
            if (reduced.InsuranceEstimates.length > 0) {
                reduced.InsuranceEstimates = reduced.InsuranceEstimates.map(est => {
                    var reducedEstimate = new InsuranceEstimateDto();
                    assign(reducedEstimate, pick(est, insuranceEstimateDtoKeys));
                    return reducedEstimate;
                });
            }
            return reduced;
        });
        return reducedDtos;
    }
}