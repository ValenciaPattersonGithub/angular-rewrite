import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse, HttpParams } from '@angular/common/http';
import { Patient } from '../models/patient.model';
import { map, catchError } from "rxjs/operators";
import { PatientOverview } from '../models/patient-overview.model';
import { AccountMemberOverview } from '../models/account-member-overview.model';
import { MicroServiceApiService } from 'src/security/providers';
import { AppointmentPreview } from 'src/scheduling/common/models/appointment-preview.model';
import { throwError } from 'rxjs';

@Injectable()
export class PatientHttpService {

    constructor(
        @Inject('SoarConfig') private soarConfig,
        private httpClient: HttpClient,
        private microServiceApis: MicroServiceApiService
    ) { }

    getPatientByPatientId(patientId: string): Promise<Patient> {
        return this.httpClient.get(this.soarConfig.domainUrl + '/persons/profile/' + patientId)
            .pipe(
                map(result => <Patient>result['Value'])
            ).toPromise();
    }

    getPatientDashboardOverviewByPatientId(patientId: string): Promise<PatientOverview> {
        return this.httpClient.get(this.soarConfig.domainUrl + '/patients/' + patientId + '/dashboard')
            .pipe(
                map(result => <PatientOverview>result['Value'])
            ).toPromise();
    }

    getPatientNextAppointment(patientId: string): Promise<AppointmentPreview> {
        return this.httpClient.get(this.microServiceApis.getSchedulingUrl() + '/api/v1/appointments/get-next-preview/' + patientId)
            .pipe(
                map(result => {
                    return <AppointmentPreview>result;
                })
            ).toPromise().catch((error) => {
                // TODO: log this? handle the error better? not silently fail?
                //  ex: a 404 means the patient doesn't have a future appointment. find to just roll on without notifying the user.
                //      a 500 means something blew up.
                if (error.status >= 500 || error.status === 0) { // 0 happens on cors bombing out
                    throw error;
                }
                return null;
            });
    }

    getPatientAccountOverviewByAccountId(accountId: string): Promise<AccountMemberOverview> {

        return this.httpClient.get(this.soarConfig.insuranceSapiUrl + '/accounts/' + accountId + '/overview')
            .pipe(
                map(result => <AccountMemberOverview>result['Value'])
            ).toPromise();
    }
    getAppointmentsByPatientId(patientId: any, includeServiceCodes: any) {
        return this.httpClient.get(`${this.soarConfig.domainUrl}/Appointments/PatientOverview/${patientId}/${includeServiceCodes}`)
            .pipe(
                map((result: any) => {
                    return result.Value;
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }
    updateAppointmentStatus(appointment: any) {
        return this.httpClient.put(`${this.soarConfig.domainUrl}/Appointments/${appointment.appointmentId}/Status`, appointment)
            .pipe(
                map((result: any) => {
                    return result.Value;
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }
    flagForScheduling(appointment: any) {
        return this.httpClient.put(`${this.soarConfig.domainUrl}/Appointments/${appointment.AppointmentId}/flagForScheduling`, appointment)
            .pipe(
                map((result: any) => {
                    return result.Value;
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }
    patientSearch(searchObject: any) {
        return this.httpClient.get(`${this.soarConfig.domainUrl}/patients/search/`, { params: searchObject })
            .pipe(
                map((result: any) => {
                    return result;
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }
    getAllAccountMembersByAccountId(accountID: any) {
        return this.httpClient.get(`${this.soarConfig.domainUrl}/accounts/accountMembers/${accountID}`)
            .pipe(
                map((result: any) => {
                    return result;
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }

    async checkForRunningAppointment(patientId: any): Promise<any> {
        return await this.httpClient.get(`${this.soarConfig.domainUrl}/Appointments/Running/${patientId}`)
            .pipe(
                map((result: any) => {
                    return result.Value;
                }), catchError(error => {
                    return throwError(error);
                })
            ).toPromise();
    }
    getPatientAdditionalIdentifiers = (patientId: any) => {
        return this.httpClient.get(this.soarConfig.domainUrl + '/patients/' + patientId + '/patientidentifiers')
            .pipe(
                map((result: any) => {
                    return result.Value;
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }
    getPatientReferrals = (patientId: any) => {
        return this.httpClient.get(this.soarConfig.domainUrl + '/patients/' + patientId + '/patientReferral')
            .pipe(
                map((result: any) => {
                    return result.Value;
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }
    getPatientDentalRecord = (patientId: any) => {
        return this.httpClient.get(this.soarConfig.domainUrl + '/patients/' + patientId + '/previousdentaloffice')
            .pipe(
                map((result: any) => {
                    return result.Value;
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }
    getPatientBenefitPlans = (patientId: any) => {
        return this.httpClient.get(this.soarConfig.insuranceSapiUrl + '/patients/' + patientId + '/benefitplan')
            .pipe(
                map((result: any) => {
                    return result.Value;
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }
    getPatientContacts = (patientId: any) => {
        return this.httpClient.get(this.soarConfig.domainUrl + '/patients/' + patientId + '/contacts')
            .pipe(
                map((result: any) => {
                    return result.Value;
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }
    getPatientEmails = (patientId: any) => {
        return this.httpClient.get(this.soarConfig.domainUrl + '/patients/' + patientId + '/emails')
            .pipe(
                map((result: any) => {
                    return result.Value;
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }
    getPatientResponsiblePartyPhonesAndEmails = (patientId: any) => {
        return this.httpClient.get(this.soarConfig.domainUrl + '/accounts/accountMembersWithPhoneEmail/' + patientId)
            .pipe(
                map((result: any) => {
                    return result.Value;
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }
    patientSearchWithDetails(searchObject: any) {
        return this.httpClient.get(`${this.soarConfig.domainUrl}/patients/searchPatientsWithDetailsAsync/`, { params: searchObject })
            .pipe(
                map((result: any) => {
                    return result;
                }), catchError(error => {
                    return throwError(error);
                })
            );
    }
}
