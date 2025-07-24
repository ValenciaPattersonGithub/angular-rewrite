import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse, HttpParams } from '@angular/common/http';
import { shareReplay, catchError, map, tap } from 'rxjs/operators';
import { MicroServiceApiService } from 'src/security/providers';
import { throwError } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FamilySchedulingModalServiceService {

    constructor(private httpClient: HttpClient,
        @Inject('SoarConfig') private soarConfig,
        private apiService: MicroServiceApiService) { }

    getFamilyAccountOverviewByAccountId = (personId: string) => {
        return this.httpClient.get(this.soarConfig.domainUrl + '/accounts/' + personId + '/familyAccountOverview')
            .pipe(
                map((result: any) => {
                    return result.Value;
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }

    getNextPreventiveDue = (patientIds: string[]) => {
        return this.httpClient.post(this.apiService.getDomainUrl() + '/patients/preventivecare/familynextdue', patientIds)
            .pipe(
                map((result: any) => {
                    return result.Value;
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }

    getNextPreventiveAppt = (patientIds: string[]) => {
        return this.httpClient.post(this.apiService.getSchedulingUrl() + '/api/v1/scheduleappointments/nextpreventiveappt', patientIds)
            .pipe(
                map((result: any) => {
                    return result;
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }
}
