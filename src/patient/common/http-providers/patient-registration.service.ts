import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RegistrationCustomEvent } from '../models/registration-custom-event.model';
import { Subject, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
@Injectable()
export class PatientRegistrationService {
    private registrationEventTracker = new Subject<RegistrationCustomEvent>();
    selectedResponsiblePerson: any;
    patientDetail: { Profile?: any };
    constructor(
        @Inject('SoarConfig') private soarConfig,
        private httpClient: HttpClient) { }

    getRegistrationEvent(): Subject<RegistrationCustomEvent> {
        return this.registrationEventTracker;
    }
    setRegistrationEvent(param: RegistrationCustomEvent): void {
        this.registrationEventTracker.next(param);
    }
    getPatientBenefitPlans = () => {
        return this.httpClient.get(`${this.soarConfig.insuranceSapiUrl}/insurance/BenefitPlan/Active`)
            .pipe(
                map((result: any) => {
                    return result;
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }
    getAllMasterDiscountTypes = () => {
        return this.httpClient.get(this.soarConfig.domainUrl + '/discounttypes')
            .pipe(
                map((result: any) => {
                    return result.Value;
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }
    getAllMasterPatientAlerts = () => {
        return this.httpClient.get(this.soarConfig.domainUrl + '/patientalerts')
            .pipe(
                map((result: any) => {
                    return result.Value;
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }
    getReferralSources = () => {
        return this.httpClient.get(this.soarConfig.domainUrl + '/referralsources')
            .pipe(
                map((result: any) => {
                    return result.Value;
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }
    getAvailablePolicyHolders = (accountId: any) => {
        const endpoint = `${this.soarConfig.insuranceSapiUrl}/patients/policyHolderBenefitPlan/AvailablePolicyHolders/`;
        return this.httpClient.get(endpoint, { params: { AccountID: accountId } })
            .pipe(
                map((result: any) => {
                    return result.Value;
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }
    addPerson = (PersonAddDto: any) => {
        return this.httpClient.post(this.soarConfig.domainUrl + '/persons', PersonAddDto)
            .pipe(
                map((result: any) => {
                    return result.Value;
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }
    updatePerson = (PersonDto: any) => {
        return this.httpClient.put(this.soarConfig.domainUrl + '/persons', PersonDto)
            .pipe(
                map((result: any) => {
                    return result.Value;
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }
    getPersonByPersonId = (patientId: string) => {
        return this.httpClient.get(this.soarConfig.domainUrl + '/persons/' + patientId + '/get')
            .pipe(
                map((result: any) => {
                    return result.Value;
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }

    getPersonById = (patientId: string) => {
        return this.httpClient.get(this.soarConfig.domainUrl + '/persons/' + patientId)
            .pipe(
                map((result: any) => {
                    return result.Value;
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }
}
