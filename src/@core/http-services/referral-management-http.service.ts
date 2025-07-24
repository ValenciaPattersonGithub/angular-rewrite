import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CreateReferralCommunicationRequest, GetPatientAffiliatesRequest, GetPracticeProvidersRequest, GetProviderReferralAffiliatesRequest, GetReferralRequest, GetReferralTotals, ReferralType, UpdateReferralCommunicationRequest } from 'src/business-center/practice-settings/patient-profile/referral-type/referral-type.model';
import { sourceNameArray } from 'src/business-center/practice-settings/patient-profile/referral-type/referral-type.model';
import { CommunicationCustomEvent } from '../../patient/common/models/communication-custom-event.model';
import { CommunicationEvent } from '../../patient/common/models/enums';
import { PatientCommunication } from '../../patient/common/models/patient-communication.model';

@Injectable({
    providedIn: 'root'
})

export class ReferralManagementHttpService {
     private communicationEventTracker = new BehaviorSubject<CommunicationCustomEvent>(null);
    constructor(
        @Inject('SoarConfig') private soarConfig: any,
        @Inject('ReferralSourcesService') private referralSourcesService,
        private httpClient: HttpClient,
    ) { }

    getReferralAffiliateById<T>(queryDto: { [param: string]: string | readonly string[]; }): Observable<{ Value: T }> {
        const url = this.soarConfig.fuseReferralManagementApiUrl + "/api/referralaffiliate/getbyid";
        const params = new HttpParams({ fromObject: queryDto });
        return this.httpClient.get<{ Value: T }>(url, { params });
    }

    getReferralDirections() {
        return this.httpClient.get(
            this.soarConfig.fuseReferralManagementApiUrl + '/api/getReferralDirections/');
    }

    getReferralCategories() {
        return this.httpClient.get(
            this.soarConfig.fuseReferralManagementApiUrl + '/api/getReferralCategories/');
    }

    createReferralAffiliate = (referralType: ReferralType) => {
        if (referralType) {
            return new Promise((resolve, reject) => {
                const url = `${String(this.soarConfig.fuseReferralManagementApiUrl)}/api/referralaffiliate/create`;
                this.httpClient.post<ReferralType>(url, referralType)
                    .toPromise()
                    .then(res => {
                        resolve(res);
                    }, err => { // Error
                        reject(err);
                    })
            });
        }
    }


    updateReferralAffiliate = (referralType: ReferralType) => {
        if (referralType) {
            return new Promise((resolve, reject) => {
                const url = `${String(this.soarConfig.fuseReferralManagementApiUrl)}/api/referralaffiliate/update`;
                this.httpClient.post<ReferralType>(url, referralType)
                    .toPromise()
                    .then(res => {
                        resolve(res);
                    }, err => { // Error
                        reject(err);
                    })
            });
        }
    }

    // getReferralAffiliateById<T>(queryDto: { [param: string]: string | readonly string[]; }): Observable<{ Value: T }> {
    //   const url = this.soarConfig.fuseReferralManagementApiUrl + "/api/practice/get";
    //   const params = new HttpParams({ fromObject: queryDto });
    //   return this.httpClient.get<{ Value: T }>(url, { params });
    // }

    getPracticesByKeyword(req: GetProviderReferralAffiliatesRequest) {
        let params = new HttpParams()
        for (const key of Object.keys(req)) {
            params = params.append(key, req[key]);
        }

        return this.httpClient.get(
            this.soarConfig.fuseReferralManagementApiUrl + '/api/practice/get', { params }
        );
    }

    getProviderAffiliates(req: GetProviderReferralAffiliatesRequest) {
        let params = new HttpParams()
        for (const key of Object.keys(req)) {
            params = params.append(key, req[key]);
        }

        return this.httpClient.get(
            this.soarConfig.fuseReferralManagementApiUrl + '/api/referralaffiliate/get', { params }
        );
    }

    saveReferral(req, addOrEditReferral) {
        var apiName;
        if (addOrEditReferral == 'editReferral')
            apiName = 'update';
        else apiName = 'create';
        return new Promise((resolve, reject) => {
            this.httpClient.post(this.soarConfig.fuseReferralManagementApiUrl + '/api/referral/' + apiName, req)
                .toPromise()
                .then(res => {
                    resolve(res);
                }, err => { // Error
                    reject(err);
                });
        });
    }

    getPracticeProviders() {
        return this.httpClient.get(
            this.soarConfig.fuseReferralManagementApiUrl + '/api/practice/getPracticeProviders');
    }

    getProviderAffiliatesForCount = (req: GetProviderReferralAffiliatesRequest) => {
        let params = new HttpParams()
        for (const key of Object.keys(req)) {
            params = params.append(key, req[key]);
        }
        return new Promise((resolve, reject) => {
            const url = `${String(this.soarConfig.fuseReferralManagementApiUrl)}/api/referralaffiliate/get`;
            this.httpClient.get(url, { params })
                .toPromise()
                .then((res) => {
                    resolve(res);
                }, (error) => {
                    reject(error);
                })
        });
    }

    getReferral(req: GetReferralRequest) {
        let params = new HttpParams()
        for (const key of Object.keys(req)) {
            params = params.append(key, req[key]);
        }
        return this.httpClient.get(
            this.soarConfig.fuseReferralManagementApiUrl + '/api/referral/get', { params }
        );
    }

    deleteReferral(req) {
        let params = new HttpParams()
        for (const key of Object.keys(req)) {
            params = params.append(key, req[key]);
        }
        return new Promise((resolve, reject) => {
            this.httpClient.delete(this.soarConfig.fuseReferralManagementApiUrl + '/api/referral/delete', { params })
                .toPromise()
                .then(res => {
                    resolve(res);
                }, err => {
                    reject(err);
                });
        });
    }

    getPatientAffiliates(req: GetPatientAffiliatesRequest) {
        let params = new HttpParams()
        for (const key of Object.keys(req)) {
            params = params.append(key, req[key]);
        }

        return this.httpClient.get(
            this.soarConfig.fuseReferralManagementApiUrl + '/api/patientaffiliate/get', { params }
        );
    }

    getPracticeProvidersForReport(req: GetPracticeProvidersRequest) {
        let params = new HttpParams()
        for (const key of Object.keys(req)) {
            params = params.append(key, req[key]);
        }

        return this.httpClient.get(
            this.soarConfig.fuseReferralManagementApiUrl + '/api/practice/getPracticeProviders', { params }
        );
    }

    performDBMigration() {
        return this.httpClient.post(
            this.soarConfig.fuseReferralManagementApiUrl + '/api/practice/performDBMigration', null
        );
    }

    getReferralTotals(req: GetReferralTotals) {
        let params = new HttpParams()
        for (const key of Object.keys(req)) {
            params = params.append(key, req[key]);
        }
        return this.httpClient.get(
            this.soarConfig.fuseReferralManagementApiUrl + '/api/referral/getTotals', { params }
        );

    }

    getSources(): Promise<any> {
        return this.referralSourcesService.get().$promise.then(
            res => {
                let referralSources = res.Value;
                let sourceNames = [
                    { value: "00000000-0000-0000-0000-000000000001", text: "Email" },
                    { value: "00000000-0000-0000-0000-000000000002", text: "Instagram" },
                    { value: "00000000-0000-0000-0000-000000000003", text: "Facebook" },
                    { value: "00000000-0000-0000-0000-000000000004", text: "LinkedIn" },
                    { value: "00000000-0000-0000-0000-000000000005", text: "Twitter" },
                    { value: "00000000-0000-0000-0000-000000000006", text: "Other" }
                ];

                referralSources.forEach((source) => {
                    sourceNames.push({
                        value: source.PatientReferralSourceId,
                        text: source.SourceName
                    });
                });
                sourceNames = sourceNames.sort((a, b) => {
                    return a.text.localeCompare(b.text);
                });

                sourceNames.unshift({
                    value: "00000000-0000-0000-0000-000000000000",
                    text: "+ Add a New Source"
                });

                return sourceNames;
            },
            err => {
                console.log(err);
            }
        );
    }

    createReferralCommunication(req: CreateReferralCommunicationRequest) {

        return this.httpClient.post(this.soarConfig.fuseReferralManagementApiUrl + '/api/referralcommunication/create', req)
            .pipe(
                map((result: any) => {
                    const communication = result;
                    if (communication) {
                        this.setCommunicationEvent({ eventtype: CommunicationEvent.NewCommunication, data: communication });
                    }
                    return communication;
                }), catchError(error => {
                    return throwError(error);
                }));
    }

    getCommunicationReferrals(patientId: string) {
      return this.httpClient.get(
        this.soarConfig.fuseReferralManagementApiUrl + '/api/referralcommunication/referrals/get',
        { params: new HttpParams().set('patientId', patientId) }
      );
    }

    deleteReferralCommunication(referralCommunicationId) {      
      return new Promise((resolve, reject) => {
          this.httpClient.delete(this.soarConfig.fuseReferralManagementApiUrl + '/api/referralcommunication/delete', { params: new HttpParams().set('referralCommunicationId', referralCommunicationId) })
              .toPromise()
              .then(res => {
                  resolve(res);
              }, err => {
                  reject(err);
              });
      });
    }

  updateReferralCommunication = (req: UpdateReferralCommunicationRequest) => {
    if (req) {
      return new Promise((resolve, reject) => {
          const url = `${String(this.soarConfig.fuseReferralManagementApiUrl)}/api/referralcommunication/update`;
          this.httpClient.post<UpdateReferralCommunicationRequest>(url, req)
              .toPromise()
              .then(res => {
                  resolve(res);
              }, err => { // Error
                  reject(err);
              })
      });
    }
  }

    setCommunicationEvent(param: CommunicationCustomEvent): void {
        this.communicationEventTracker.next(param);
    }

    getCommunicationEvent(): BehaviorSubject<CommunicationCustomEvent> {
        return this.communicationEventTracker;
    }
}

