import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MicroServiceApiService } from 'src/security/providers';

declare var angular: angular.IAngularStatic;
import { RxEnterpriseResponse, LegacyRxLocation, RxEnterpriseRequest, RxUserRequest, LegacyRxUser, RxSettings,
    RxPatientRequest, RxMedicationResponse, RxMedication, RxNotificationsResponse, RxNotifications, Rx2PatientRequest } from '../models/rx.model';
import { Location } from 'src/practices/common/models/location.model';
import { RxPatient } from 'src/patient/patient-chart/patient-rx/models/patient-rx.model';
import { EnterpriseService } from 'src/@shared/providers/enterprise/enterprise.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import isEqual from 'lodash/isequal';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { FuseFlag } from 'src/@core/feature-flags';

@Injectable()
export class RxService {

    private rxApiUrl: string;    
    private practiceId: number;
    private saveClinicQueue: any[] = [];
    private currentUserId: any;    
    private saveClinicV2Queue: any[] = [];
    saveClinicV2QueueSubject = new Subject<any>();
    saveClinicV2QueueClear = new Subject<any>();
    

    constructor(
        @Inject('referenceDataService') private referenceDataService,
        @Inject('LocationServices') private locationServices,
        @Inject('practiceService') practiceService,
        @Inject('UserServices') private userServices,
        @Inject('locationService') private platformLocationService,        
        @Inject('PersonServices') private personServices,
        private httpClient: HttpClient,
        microServiceApis: MicroServiceApiService,
        private enterpriseService: EnterpriseService,
        private featureFlagService: FeatureFlagService
    ) {
        this.rxApiUrl = microServiceApis.getPrescriptionsApiUrl();

        const currentPractice = practiceService.getCurrentPractice();
        this.practiceId = 0;
        if (currentPractice !== null) {
            this.practiceId = currentPractice.id;
        }

        var userContext = JSON.parse(sessionStorage.getItem('userContext'));
        this.currentUserId = userContext?.Result.User.UserId;
      

        this.saveClinicV2QueueClear.pipe(debounceTime(10000)).subscribe(() => {
            this.saveClinicV2Queue = [];
        });

        this.saveClinicV2QueueSubject.subscribe((input) => {
            this.saveClinicV2QueueClear.next('');

            // When a request comes in, look in the saveClinicQueue for a duplicate request
            const exactMatch  = this.saveClinicV2Queue.find(
                x => isEqual(x.Input.Location.LocationId, input.Location.LocationId) && isEqual(x.Input.RxLocation, input.RxLocation));
            if (!exactMatch) {
                // If the request isn't a duplicate of one already in the queue, call the saveRxClinic API
                const saveRxPromise = this.executeSaveV2Clinic(input.Location, input.RxLocation);
                this.saveClinicV2Queue.push({ Input: input, Promise: saveRxPromise });
                saveRxPromise.then(
                    (success) => {
                        input.Resolve(success.$promise);
                    },
                    (failure) => {
                        input.Reject(failure.$promise);
                    });
            } else {
                // If the request was a duplicate, return the promise from the original request
                exactMatch.Promise.then(
                    (success) => {
                        input.Resolve(success.$promise);
                    },
                    (failure) => {
                        input.Reject(failure.$promise);
                    });
            }
        });
    }

    private async getRxApiVersion(): Promise<string> {        
        return new Promise((resolve) => {
            resolve('2');            
        });
    }

    //#region Clinic

    async saveRxClinic(location: Location, rxLocation: LegacyRxLocation): Promise<any> {                
        return this.addSaveClinicV2RequestToQueue({ Location: location, RxLocation: rxLocation });        
    }

    private async executeSaveV2Clinic(location: Location, rxLocation: LegacyRxLocation): Promise<any> {
        const entId = await this.enterpriseService.getEnterpriseIdForLocation(location.LocationId);

        const rxEnterprise = new RxEnterpriseRequest(rxLocation);

        if (location.IsRxRegistered) {
            return await this.updateRxClinic(location, rxEnterprise, entId);
        } else {
            let rxEnt: RxEnterpriseResponse;
            try {
                rxEnt = await this.getRxEnterprise(entId);
            } catch (e) {
                if (!(e instanceof HttpErrorResponse) ||
                    (e.error instanceof ErrorEvent) ||
                    e.status != 404) {
                    throw e;
                }
                rxEnt = null;
            }

            if (rxEnt) {
                return await this.updateRxClinic(location, rxEnterprise, entId);
            } else {
                return await this.createRxClinic(location, rxEnterprise, entId);
            }
        }
    }
   

    private async addSaveClinicV2RequestToQueue(location) {
        const promise = new Promise((resolve, reject) => {
            const locationWithPromise = {
                Location: location.Location, RxLocation: location.RxLocation, Resolve: resolve, Reject: reject
            };
            this.saveClinicV2QueueSubject.next(locationWithPromise);
        });

        return promise;
    }

    private async getRxEnterprise(enterpriseId: number): Promise<RxEnterpriseResponse> {
        const rxVersion = await this.getRxApiVersion();
        return await this.httpClient.get<RxEnterpriseResponse>(
            `${this.rxApiUrl}/api/v${rxVersion}/rxenterprises/enterpriseid/${enterpriseId}`,
            { headers: { enterpriseid: enterpriseId.toString() } }
        ).toPromise();
    }
    
    private async createRxClinic(location: Location, rxEnterprise: RxEnterpriseRequest, entId: number): Promise<any> {
        const rxVersion = await this.getRxApiVersion();
        const rxRes = await this.httpClient.post<RxEnterpriseResponse>(
            `${this.rxApiUrl}/api/v${rxVersion}/rxenterprises/enterpriseid/${entId}`,
            rxEnterprise,
            { headers: { enterpriseid: entId.toString() } }
        ).toPromise();

        location.IsRxRegistered = true;
        const result = await this.locationServices.update(location).$promise;

        this.referenceDataService.forceEntityExecution(this.referenceDataService.entityNames.locations);

        return result;
    }

    private async updateRxClinic(location: Location, rxEnterprise: RxEnterpriseRequest, entId: number): Promise<any> {
        const rxVersion = await this.getRxApiVersion();
        const rxRes = await this.httpClient.put<RxEnterpriseResponse>(
            `${this.rxApiUrl}/api/v${rxVersion}/rxenterprises/enterpriseid/${entId}`,
            rxEnterprise,
            { headers: { enterpriseid: entId.toString() } }
        ).toPromise();

        if (location.IsRxRegistered) {
            return rxRes;
        }

        location.IsRxRegistered = true;
        const result = await this.locationServices.update(location).$promise;

        this.referenceDataService.forceEntityExecution(this.referenceDataService.entityNames.locations);

        return result;
    }

    //#endregion

    //#region Clinician

    async getRxClinicianData(userId: string): Promise<any> {
        const ofcLocation = this.platformLocationService.getCurrentLocation();
        const entId = await this.enterpriseService.getEnterpriseIdForLocation(ofcLocation.id);

        let rxUser: any;
        try {
            const rxVersion = await this.getRxApiVersion();
            rxUser = await this.httpClient.get<any>(
                `${this.rxApiUrl}/api/v${rxVersion}/rxusers/userid/${userId}`,
                { headers: { enterpriseid: entId.toString() } }
            ).toPromise();
        } catch (e) {
            if (!(e instanceof HttpErrorResponse) ||
                (e.error instanceof ErrorEvent) ||
                e.status != 404) {
                throw e;
            }
            return { roles: [], locations: [], isNew: true };
        }

        const ents = await this.rxAccessCheckWithSessionStorage(userId, entId);
        const rxEnts = await this.enterpriseService.getLegacyIdsForRxEnterprises(ents);

        return {
            roles: rxUser.clinicianRoleType,
            locations: rxEnts.map(ent => ({ legacyId: ent.legacy_LocationID, enterpriseId: ent.id })),
            isNew: false
        };
    }

    async saveRxClinician(fuseUser: any, rxUser: LegacyRxUser, rxV2Settings: RxSettings): Promise<any> {

        const rxUserRequest = new RxUserRequest(rxUser, rxV2Settings);
        const entIds = await this.enterpriseService.getEnterpriseIdsForLocations(rxV2Settings.locations.map(location => location.value));
        const authEntId = await this.getAuthEntIdForLocationList(entIds);

        if (fuseUser.IsRxRegistered) {
            if (fuseUser.AddressReferrerId != null) {
                fuseUser.AddressLine1 = null;
                fuseUser.AddressLine2 = null;
                fuseUser.City = null;
                fuseUser.State = null;
                fuseUser.ZipCode = null;
            }

            return await this.updateRxUser(rxUserRequest, entIds, authEntId, fuseUser);
        } else {
            let rxUserResult: any;
            try {
                rxUserResult = await this.getRxUser(fuseUser.UserId, authEntId);
            } catch (e) {
                if (!(e instanceof HttpErrorResponse) ||
                    (e.error instanceof ErrorEvent) ||
                    e.status != 404) {
                    throw e;
                }
                rxUserResult = null;
            }

            if (rxUserResult) {
                return await this.updateRxUser(rxUserRequest, entIds, authEntId, fuseUser);
            } else {
                return await this.createRxUser(rxUserRequest, entIds, authEntId, fuseUser);
            }
        }
    }

    private async getAuthEntIdForLocationList(entIds: number[]): Promise<number> {
        if (entIds && entIds.length > 0) {
            return entIds[0];
        } else {
            const ofcLocation = this.platformLocationService.getCurrentLocation();
            return await this.enterpriseService.getEnterpriseIdForLocation(ofcLocation.id);
        }
    }

    private async getRxUser(userId: string, enterpriseId: number): Promise<any> {
        const rxVersion = await this.getRxApiVersion();
        return await this.httpClient.get(
            `${this.rxApiUrl}/api/v${rxVersion}/rxusers/userid/${userId}`,
            { headers: { enterpriseid: enterpriseId.toString() } }
        ).toPromise();
    }

    private async createRxUser(rxUser: RxUserRequest, entIds: number[], authEntId: number, fuseUser: any): Promise<any> {
        const rxVersion = await this.getRxApiVersion();
        await this.httpClient.post(
            `${this.rxApiUrl}/api/v${rxVersion}/rxusers/userid/${fuseUser.UserId}`,
            rxUser,
            { headers: { enterpriseid: authEntId.toString() } }
        ).toPromise();

        await this.httpClient.post(
            `${this.rxApiUrl}/api/v${rxVersion}/rxusers/userid/${fuseUser.UserId}/enterprises`,
            { enterpriseIDs: entIds },
            { headers: { enterpriseid: authEntId.toString() } }
        ).toPromise();

        fuseUser.IsRxRegistered = true;
        const result = await this.userServices.Users.update(fuseUser).$promise;

        this.referenceDataService.forceEntityExecution(this.referenceDataService.entityNames.users);

        return result;
    }

    private async updateRxUser(rxUser: RxUserRequest, entIds: number[], authEntId: number, fuseUser: any): Promise<any> {
        const rxVersion = await this.getRxApiVersion();
        const rxRes = await this.httpClient.put(
            `${this.rxApiUrl}/api/v${rxVersion}/rxusers/userid/${fuseUser.UserId}`,
            rxUser,
            { headers: { enterpriseid: authEntId.toString() } }
        ).toPromise();

        await this.httpClient.post(
            `${this.rxApiUrl}/api/v${rxVersion}/rxusers/userid/${fuseUser.UserId}/enterprises`,
            { enterpriseIDs: entIds },
            { headers: { enterpriseid: authEntId.toString() } }
        ).toPromise();

        if (fuseUser.IsRxRegistered) {
            return rxRes;
        }

        fuseUser.IsRxRegistered = true;
        const result = await this.userServices.Users.update(fuseUser).$promise;

        this.referenceDataService.forceEntityExecution(this.referenceDataService.entityNames.users);

        return result;
    }

    //#endregion

    //#region Patient

    async saveRxPatient(patient: RxPatient, fusePatient: any) {
        const currentLocation = this.platformLocationService.getCurrentLocation();        

        // assume user is registered since they can access tab
        // verify location is registered
            // get from RDS and filter by id
        const locations = this.referenceDataService.get(this.referenceDataService.entityNames.locations);
        const fuseLocation = locations.find(location => location.LocationId === currentLocation.id);
        if (!fuseLocation) {
            return Promise.reject('Location');
        }

        const rxPatientRequest = new Rx2PatientRequest(patient);
        //const rxPatientRequest = new RxPatientRequest(patient);

        let entId: number;
        try {
            entId = await this.enterpriseService.getEnterpriseIdForLocation(currentLocation.id);
        } catch (e) {
            return Promise.reject('Location');
        }

        if (!fuseLocation.IsRxRegistered) {
            // call to verify
            let rxRegistered = false;
            try {
                const rxEnt = await this.getRxEnterprise(entId);
                if (rxEnt) {
                    rxRegistered = true;
                }
            } catch (e) {}
            if (!rxRegistered) {
                return Promise.reject('Location');
            }
        }

        let saveResult: any;
        try {
            if (fusePatient.IsRxRegistered) {
                saveResult = await this.updateRxPatient(rxPatientRequest, entId, fusePatient);
            } else {
                let rxPatientResult: any;
                try {
                    rxPatientResult = await this.getRxPatient(fusePatient.PatientId, entId);
                } catch (e) {
                    if (!(e instanceof HttpErrorResponse) ||
                        (e.error instanceof ErrorEvent) ||
                        e.status != 404) {
                        throw e;
                    }
                    rxPatientResult = null;
                }

                if (rxPatientResult) {
                    saveResult = await this.updateRxPatient(rxPatientRequest, entId, fusePatient);
                } else {
                    saveResult = await this.createRxPatient(rxPatientRequest, entId, fusePatient);
                }
            }
        } catch (e) {
            if (e.status && e.status === 502 &&
                e.error && e.error.Details &&
                e.error.Details.indexOf('Clinician does not have access to the clinic') >= 0
            ) {
                return Promise.reject('Location');
            }

            throw e;
        }

        saveResult.ExternalPatientURL = await this.getRxPatientUrl(fusePatient.PatientId, entId);

        return saveResult;
    }

    async getRxPatientMedications(patientId: string): Promise<RxMedication[]> {
        const currentLocation = this.platformLocationService.getCurrentLocation();        

        const entId = await this.enterpriseService.getEnterpriseIdForLocation(currentLocation.id);

        // this retrieves self-reported medications, which we haven't historically shown on the timeline
        // const medsPromise = this.httpClient.get<RxMedicationResponse[]>(
        //     `${this.rxApiUrl}/api/v1/medications/patientid/${patientId}`,
        //     { headers: { enterpriseid: entId.toString() } }
        // ).toPromise();
        const rxVersion = await this.getRxApiVersion();
        const rxPromise = this.httpClient.get<RxMedicationResponse[]>(
            `${this.rxApiUrl}/api/v${rxVersion}/prescriptions/patientid/${patientId}`,
            { headers: { enterpriseid: entId.toString() } }
        ).toPromise();

        // const meds = await medsPromise;
        const rx = await rxPromise;

        // return meds.concat(rx).map(r => new RxMedication(r));
        return rx.map(r => new RxMedication(r));
    }

    private clearAddressSettings(fusePatient: any) {
        if (fusePatient.AddressReferrerId != null) {
            fusePatient.AddressLine1 = null;
            fusePatient.AddressLine2 = null;
            fusePatient.City = null;
            fusePatient.State = null;
            fusePatient.ZipCode = null;
        }
    }

    private async getRxPatient(patientId: string, enterpriseId: number): Promise<any> {
        const rxVersion = await this.getRxApiVersion();
        return await this.httpClient.get(
            `${this.rxApiUrl}/api/v${rxVersion}/rxpatients/patientid/${patientId}`,
            { headers: { enterpriseid: enterpriseId.toString() } }
        ).toPromise();
    }

    private async createRxPatient(rxPatient: RxPatientRequest, entId: number, fusePatient: any): Promise<any> {
        this.clearAddressSettings(fusePatient);
        const rxVersion = await this.getRxApiVersion();
        const rxRes = await this.httpClient.post(
            `${this.rxApiUrl}/api/v${rxVersion}/rxpatients/patientid/${fusePatient.PatientId}`,
            rxPatient,
            { headers: { enterpriseid: entId.toString() } }
        ).toPromise();

        fusePatient.IsRxRegistered = true;
        return await this.personServices.Persons.update({ Profile: fusePatient}).$promise;
    }

    private async updateRxPatient(rxPatient: Rx2PatientRequest, entId: number, fusePatient: any): Promise<any> {
        const rxVersion = await this.getRxApiVersion();
        this.clearAddressSettings(fusePatient);
        const rxRes = await this.httpClient.put(
            `${this.rxApiUrl}/api/v${rxVersion}/rxpatients/patientid/${fusePatient.PatientId}`,
            rxPatient,
            { headers: { enterpriseid: entId.toString() } }
        ).toPromise();

        if (fusePatient.IsRxRegistered) {
            return rxRes;
        }

        fusePatient.IsRxRegistered = true;
        return await this.personServices.Persons.update({ Profile: fusePatient }).$promise;
    }

    private async getRxPatientUrl(patientId: string, entId: number) {
        const rxVersion = await this.getRxApiVersion();
        return await this.httpClient.get<string>(
            `${this.rxApiUrl}/api/v${rxVersion}/rxpatients/patientid/${patientId}/vendorpatienturl`,
            { headers: { enterpriseid: entId.toString() } }
        ).toPromise();
    }

    //#endregion

    //#region Notifications

    async getRxNotifications(userId: string, entId: number): Promise<RxNotifications> {        
        const rxVersion = await this.getRxApiVersion();
        const notifications = await this.httpClient.get<RxNotificationsResponse>(
            `${this.rxApiUrl}/api/v${rxVersion}/notificationcounts/userid/${userId}`,
            { headers: { enterpriseid: entId.toString() } }
        ).toPromise();

        return new RxNotifications(notifications);
    }

    async notificationsPreCheck(userId): Promise<any> {
        const currentLocation = this.platformLocationService.getCurrentLocation();
        const entId = await this.enterpriseService.getEnterpriseIdForLocation(currentLocation.id);
        const ents = await this.rxAccessCheckWithSessionStorage(userId, entId);

        if (!ents || ents.length <= 0) {
            return { result: false };
        }

        const entIndex = ents.findIndex(e => e.enterpriseID == entId);
        const entIdResult = entIndex < 0 ? ents[0].enterpriseID : entId;

        const rxUser = await this.getRxUser(userId, entId);

        if (!rxUser || !rxUser.clinicianRoleType || rxUser.clinicianRoleType.length <= 0) {
            return { result: false };
        }

        const showNotifications = rxUser.clinicianRoleType.findIndex(id => id === 1) >= 0;
        const showAdminLink = rxUser.clinicianRoleType.findIndex(id => id === 2 || id === 4) >= 0;
        return { result: showNotifications, entId: entIdResult, showAdminLink };
    }

    async rxAccessCheck(userId): Promise<any> {
        const currentLocation = this.platformLocationService.getCurrentLocation();
        const entId = await this.enterpriseService.getEnterpriseIdForLocation(currentLocation.id);                
        const ents = await this.rxAccessCheckWithSessionStorage(userId, entId);

        if (!ents || ents.length <= 0 || ents.findIndex(ent => ent.enterpriseID == entId) < 0) {
            return { result: false, entId: entId, currentLocation: currentLocation, ents: ents };
        }
        else {
            return { result: true };
        }
    }

    async rxAccessCheckWithSessionStorage(userId, enterpriseId): Promise<RxEnterpriseResponse[]> {
        const rxAccessSessionStorageKey = 'rxAccess';
        const rxAccessDeniedStorageKey = 'rxAccessDenied';

        if (userId === this.currentUserId) {
            let rxAccessSessionStorageKeyValue = sessionStorage.getItem(rxAccessSessionStorageKey);
            let rxAccessDeniedStorageKeyKeyValue = sessionStorage.getItem(rxAccessDeniedStorageKey);

            if (rxAccessDeniedStorageKeyKeyValue !== null && JSON.parse(rxAccessDeniedStorageKeyKeyValue) === true) {
                return null;
            }

            if (rxAccessSessionStorageKeyValue !== null && JSON.parse(rxAccessSessionStorageKeyValue) !== null) {
                return JSON.parse(rxAccessSessionStorageKeyValue);
            }
        }

        const rxVersion = await this.getRxApiVersion();
        let rxAccessCheckResponse = await this.httpClient.get<RxEnterpriseResponse[]>(
            `${this.rxApiUrl}/api/v${rxVersion}/rxusers/userid/${userId}/enterprises`,
            { headers: { enterpriseid: enterpriseId.toString() } }
        ).toPromise()
            .catch((err: HttpErrorResponse) => {

                if (err.status == 404 && userId === this.currentUserId) {
                    // 404 returned = they dont have access.
                    sessionStorage.setItem(rxAccessDeniedStorageKey, JSON.stringify(true));
                    return null;
                }
                throw err;
        });;

        if (userId === this.currentUserId) {
            sessionStorage.setItem(rxAccessSessionStorageKey, JSON.stringify(rxAccessCheckResponse));
        }

        return rxAccessCheckResponse;
    }

    ////#endregion
}
