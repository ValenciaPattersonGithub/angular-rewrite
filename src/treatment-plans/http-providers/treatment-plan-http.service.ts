import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse, HttpParams} from '@angular/common/http';
import { Observable} from "rxjs";
import { shareReplay, catchError, map, tap } from 'rxjs/operators';

import { MicroServiceApiService } from '../../security/providers';
import { TreatmentPlanCoverageResult } from './treatment-plan-coverage-result';
import { ServiceTransaction } from '../models/service-transaction';
import { TreatmentPlanCoverageServiceRequest } from '../models/treatment-plan-coverage-service-request';

@Injectable()    
export class TreatmentPlanHttpService {
    constructor(private http: HttpClient, private microServiceApis: MicroServiceApiService) {
    }
    //ProposedServicesForAdd: { method: 'GET', params: { Id: '@Id' }, url: '_soarapi_/persons/:Id/treatmentPlanProposedServicesForAdd' },
    getProposedServicesForAdd(id) {
        return this.http.get(this.microServiceApis.getClinicalApiUrl() + '/persons/' + id + '/treatmentPlanProposedServicesForAdd')
            .pipe(
                map(res => <any>res)
            );
    }

    save(id, accountMemberId, treatmentPlan, removeServicesFromAppointment) {
        return this.http.post(this.microServiceApis.getClinicalApiUrl() + '/persons/' + id + '/treatmentplans/create-or-update/' + accountMemberId, treatmentPlan, removeServicesFromAppointment)
            .pipe(
                map(res => <any>res)
                // we might end up putting error handling logic in place but I want to consider this more.
                // example global error handling for 404 and concurrency exceptions
                //,catchError((error: HttpErrorResponse) => {
                //    let errorMessage = '';
                //    if (error.error instanceof ErrorEvent) {
                //        // client-side error
                //        errorMessage = `Error: ${error.error.message}`;
                //    } else {
                //        // server-side error
                //        errorMessage = `Error Status: ${error.status}\nMessage: ${error.message}`;
                //    }
                //    console.log(errorMessage);
                //    return throwError(errorMessage);
                //})
            );
    }

    getInsuranceInfo(services: TreatmentPlanCoverageServiceRequest[]): Observable<TreatmentPlanCoverageResult> {
        return this.http.post<TreatmentPlanCoverageResult>(this.microServiceApis.getClinicalApiUrl() + '/treatmentplans/insurancecoverage/lite', services);
   }

    // need to tack on some error handling logic to put the message in the console each time nothing fancy just want to console log messages 
        // when a 404 or 409 happen for right now.
        // need to test this out more before full implementation
        // the below code can be found in fuse to handle this kind of problems, it is shown for references only.
        //var httpErrorResponseHandler = function (rejection) {
        //    var errorMessage;
        //    var localize = $injector.get('localize');
        //    switch (rejection.status) {
        //        case 409:
        //            errorMessage = localize
        //                .getLocalizedString("Another user has made changes, refresh the page to see the latest information.");
        //            errorResponseFunc(errorMessage, rejection);
        //            break;

        //        case 404:
        //            errorMessage = localize.getLocalizedString("Another user has made changes, refresh your screen.");
        //            errorResponseFunc(errorMessage, rejection);
        //            break;
        //    }
        //};

};
