import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { EnterpriseService } from 'src/@shared/providers/enterprise/enterprise.service';
import { RxPatient } from 'src/patient/patient-chart/patient-rx/models/patient-rx.model';
import { MicroServiceApiService } from 'src/security/providers';
import {
    RxEnterpriseRequest, RxEnterpriseResponse, RxMedication, RxMedicationResponse,
    RxNotifications, RxNotificationsResponse, RxPatientRequest, RxUserRequest, Rx2PatientRequest
} from '../models/rx.model';
import { RxService } from './rx.service';
import { fakeAsync } from '@angular/core/testing';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { of } from 'rxjs';

describe('RxService', () => {

    let service: RxService;
    let microServiceApiService: Partial<MicroServiceApiService>;
    let httpClient: Partial<HttpClient>;
    let enterpriseService: Partial<EnterpriseService>;
    let referenceDataService, locationServices, practiceService;
    let userServices, platformLocationService;
    let commonServices, patientServices, personServices;
    let featureFlagService: Partial<FeatureFlagService>;

    const rxApiUrl = 'mockRxApiUrl';

    beforeEach(() => {
        microServiceApiService = {
            getPrescriptionsApiUrl: jasmine.createSpy().and.returnValue(rxApiUrl)
        };
        httpClient = {};
        referenceDataService = {
            entityNames: { practiceSettings: 'practiceSettingsKey' },
            get: jasmine.createSpy().and.returnValue('practiceSettings')
        };
        locationServices = {};
        practiceService = {
            getCurrentPractice: jasmine.createSpy().and.returnValue({ id: 'practiceId' })
        };
        userServices = {};
        platformLocationService = {};
        commonServices = {};
        patientServices = {};
        personServices = {};
        enterpriseService = {};
        featureFlagService = {
            getOnce$: jasmine.createSpy().and.returnValue(of('1'))
        };

        service = new RxService(
            referenceDataService, locationServices, practiceService, userServices, platformLocationService,
            personServices, httpClient as any, microServiceApiService as any,
            enterpriseService as any, featureFlagService as any
        );
    });

    beforeAll(() => {
        sessionStorage.setItem('userContext', JSON.stringify({ Result: { User: { UserId: 'mockUserId' } } }));
    });

    afterAll(() => {
        sessionStorage.removeItem('userContext');
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });    

    describe('saveRxClinic function ->', () => {        
        let ofcLocation, rxLocation;
        let saveRxClinicResult, saveRxClinicV2Result;
        beforeEach(() => {            

            ofcLocation = { LocationId: 'mockLocationId' };
            rxLocation = 'mockRxLocation';

            saveRxClinicResult = 'saveResult';
            saveRxClinicV2Result = 'saveV2Result';            
            (service as any).addSaveClinicV2RequestToQueue = jasmine.createSpy().and.returnValue(saveRxClinicV2Result);
        });
    
        it('should call addSaveClinicV2RequestToQueue', async () => {            

            const result = await service.saveRxClinic(ofcLocation, rxLocation);
            expect((service as any).addSaveClinicV2RequestToQueue).toHaveBeenCalledWith({
                Location: ofcLocation, RxLocation: rxLocation
            });
            expect(result).toBe(saveRxClinicV2Result);
        });

    });

    describe('executeSaveV2Clinic function ->', () => {
        
        let ofcLocation, rxLocation;
        let enterpriseId, updateClinicResult, createClinicResult;
        beforeEach(() => {
            enterpriseId = 'entId';
            updateClinicResult = 'updateClinicResult';
            createClinicResult = 'createClinicResult';            

            ofcLocation = { LocationId: 'mockLocationId', IsRxRegistered: true };
            rxLocation = 'mockRxLocation';

            enterpriseService.getEnterpriseIdForLocation = jasmine.createSpy().and.returnValue(enterpriseId);
            (service as any).updateRxClinic = jasmine.createSpy().and.returnValue(updateClinicResult);
            (service as any).createRxClinic = jasmine.createSpy().and.returnValue(createClinicResult);
        });

        it('should call getEnterpriseIdForLocation', async () => {
            await (service as any).executeSaveV2Clinic(ofcLocation, rxLocation);

            expect(enterpriseService.getEnterpriseIdForLocation).toHaveBeenCalledWith(ofcLocation.LocationId);
        });

        it('should call updateRxClinic if location is registered', async () => {
            const result = await (service as any).executeSaveV2Clinic(ofcLocation, rxLocation);

            const rxExpected = new RxEnterpriseRequest(rxLocation);
            expect((service as any).updateRxClinic).toHaveBeenCalledWith(ofcLocation, rxExpected, enterpriseId);
            expect(result).toBe(updateClinicResult);
        });

        describe('when location is not registered ->', () => {

            let rxEnterprise;
            beforeEach(() => {
                rxEnterprise = {};
                ofcLocation.IsRxRegistered = false;

                (service as any).getRxEnterprise = jasmine.createSpy().and.returnValue(rxEnterprise);
            });

            it('should call getRxEnterprise', async () => {
                await (service as any).executeSaveV2Clinic(ofcLocation, rxLocation);

                expect((service as any).getRxEnterprise).toHaveBeenCalledWith(enterpriseId);
            });

            it('should throw error if getRxEnterprise throws error not HttpErrorResponse', async () => {
                (service as any).getRxEnterprise = () => { throw new Error(); };
                let caught = false;

                try {
                    await (service as any).executeSaveV2Clinic(ofcLocation, rxLocation);
                } catch {
                    caught = true;
                }

                expect(caught).toBe(true);
            });

            it('should throw error if getRxEnterprise throws ErrorEvent', async () => {
                (service as any).getRxEnterprise = () => { throw new ErrorEvent('test'); };
                let caught = false;

                try {
                    await (service as any).executeSaveV2Clinic(ofcLocation, rxLocation);
                } catch {
                    caught = true;
                }

                expect(caught).toBe(true);
            });

            it('should throw error if getRxEnterprise throws error with status that is not 404', async () => {
                (service as any).getRxEnterprise = () => { throw new HttpErrorResponse({ status: 400 }); };
                let caught = false;

                try {
                    await (service as any).executeSaveV2Clinic(ofcLocation, rxLocation);
                } catch {
                    caught = true;
                }

                expect(caught).toBe(true);
            });

            it('should call createRxClinic if getRxEnterprise throws error with correct conditions', async () => {
                (service as any).getRxEnterprise = () => { throw new HttpErrorResponse({ status: 404 }); };
                let caught = false;
                let result;

                try {
                    result = await (service as any).executeSaveV2Clinic(ofcLocation, rxLocation);
                } catch (e) {
                    caught = true;
                }

                expect(caught).toBe(false);
                const rxExpected = new RxEnterpriseRequest(rxLocation);
                expect((service as any).createRxClinic).toHaveBeenCalledWith(ofcLocation, rxExpected, enterpriseId);
                expect(result).toBe(createClinicResult);
            });

            it('should call updateRxClinic if result of getRxEnterprise is not null', async () => {
                const result = await (service as any).executeSaveV2Clinic(ofcLocation, rxLocation);

                const rxExpected = new RxEnterpriseRequest(rxLocation);
                expect((service as any).updateRxClinic).toHaveBeenCalledWith(ofcLocation, rxExpected, enterpriseId);
                expect(result).toBe(updateClinicResult);
            });

            it('should call createRxClinic if result of getRxEnterprise is null', async () => {
                (service as any).getRxEnterprise = () => null;
                const result = await (service as any).executeSaveV2Clinic(ofcLocation, rxLocation);

                const rxExpected = new RxEnterpriseRequest(rxLocation);
                expect((service as any).createRxClinic).toHaveBeenCalledWith(ofcLocation, rxExpected, enterpriseId);
                expect(result).toBe(createClinicResult);
            });

        });

    });

    describe('addSaveClinicV2RequestToQueue function ->', async () => {

        let ofcLocation, rxLocation;
        beforeEach((done) => {
            ofcLocation = { LocationId: 'mockLocationId' };
            rxLocation = 'mockRxLocation';

            setTimeout(() => {
                done();
            }, 10);
        });

        it('should call saveClinicQueueSubject.next and return promise', fakeAsync((): void => {
            (service as any).saveClinicV2QueueSubject.next = jasmine.createSpy();

            const result = (service as any).addSaveClinicV2RequestToQueue({ Location: ofcLocation, RxLocation: rxLocation });

            expect((service as any).saveClinicV2QueueSubject.next).toHaveBeenCalled();
            expect(result).toEqual(jasmine.any(Promise));
        }) as any);

    });

    describe('getRxEnterprise function ->', () => {

        it('should call httpClient.get and return result', async () => {
            const enterpriseId = 'entId';
            const toPromiseResult = { id: 'resultId' };
            httpClient.get = jasmine.createSpy().and.returnValue({ toPromise: () => toPromiseResult });

            const result = await (service as any).getRxEnterprise(enterpriseId);

            expect(httpClient.get).toHaveBeenCalledWith(
                `${rxApiUrl}/api/v2/rxenterprises/enterpriseid/${enterpriseId}`,
                { headers: { enterpriseid: enterpriseId.toString() } }
            );
            expect(result).toBe(toPromiseResult);
        });

    });

    describe('createRxClinic function ->', () => {

        it('should call httpClient.post and update location', async () => {
            const ofcLocation = { IsRxRegistered: false };
            const rxEnterprise = 'rxEnterprise';
            const enterpriseId = 'entId';
            const toPromiseResult = { id: 'resultId' };
            const promiseResult = 'promiseResult';
            httpClient.post = jasmine.createSpy().and.returnValue({ toPromise: () => toPromiseResult });
            locationServices.update = jasmine.createSpy().and.returnValue({ $promise: promiseResult });
            referenceDataService.forceEntityExecution = jasmine.createSpy();
            referenceDataService.entityNames.locations = 'locationsKey';

            const result = await (service as any).createRxClinic(ofcLocation, rxEnterprise, enterpriseId);

            expect(httpClient.post).toHaveBeenCalledWith(
                `${rxApiUrl}/api/v2/rxenterprises/enterpriseid/${enterpriseId}`,
                rxEnterprise,
                { headers: { enterpriseid: enterpriseId.toString() } }
            );
            expect(ofcLocation.IsRxRegistered).toBe(true);
            expect(locationServices.update).toHaveBeenCalledWith(ofcLocation);
            expect(referenceDataService.forceEntityExecution).toHaveBeenCalledWith(referenceDataService.entityNames.locations);
            expect(result).toBe(promiseResult);
        });

    });

    describe('updateRxClinic function ->', () => {

        it('should call httpClient.put and return result if location is registered', async () => {
            const ofcLocation = { IsRxRegistered: true };
            const rxEnterprise = 'rxEnterprise';
            const enterpriseId = 'entId';
            const toPromiseResult = { id: 'resultId' };
            const promiseResult = 'promiseResult';
            httpClient.put = jasmine.createSpy().and.returnValue({ toPromise: () => toPromiseResult });
            locationServices.update = jasmine.createSpy().and.returnValue({ $promise: promiseResult });

            const result = await (service as any).updateRxClinic(ofcLocation, rxEnterprise, enterpriseId);

            expect(httpClient.put).toHaveBeenCalledWith(
                `${rxApiUrl}/api/v2/rxenterprises/enterpriseid/${enterpriseId}`,
                rxEnterprise,
                { headers: { enterpriseid: enterpriseId.toString() } }
            );
            expect(locationServices.update).not.toHaveBeenCalled();
            expect(result).toBe(toPromiseResult);
        });

        it('should call httpClient.put and update location if location is not registered', async () => {
            const ofcLocation = { IsRxRegistered: false };
            const rxEnterprise = 'rxEnterprise';
            const enterpriseId = 'entId';
            const toPromiseResult = { id: 'resultId' };
            const promiseResult = 'promiseResult';
            httpClient.put = jasmine.createSpy().and.returnValue({ toPromise: () => toPromiseResult });
            locationServices.update = jasmine.createSpy().and.returnValue({ $promise: promiseResult });
            referenceDataService.forceEntityExecution = jasmine.createSpy();
            referenceDataService.entityNames.locations = 'locations';

            const result = await (service as any).updateRxClinic(ofcLocation, rxEnterprise, enterpriseId);

            expect(httpClient.put).toHaveBeenCalledWith(
                `${rxApiUrl}/api/v2/rxenterprises/enterpriseid/${enterpriseId}`,
                rxEnterprise,
                { headers: { enterpriseid: enterpriseId.toString() } }
            );
            expect(ofcLocation.IsRxRegistered).toBe(true);
            expect(locationServices.update).toHaveBeenCalledWith(ofcLocation);
            expect(referenceDataService.forceEntityExecution).toHaveBeenCalledWith(referenceDataService.entityNames.locations);
            expect(result).toBe(promiseResult);
        });

    });

    describe('getRxClinicianData function ->', () => {

        let currentLocation, currentLocationEntId, userId, rxUserResult, rxEntsResult, entResult;
        beforeEach(() => {
            currentLocation = { id: 'locationId' };
            currentLocationEntId = 'locationEntId';
            userId = 'userId';
            rxUserResult = { clinicianRoleType: 'roleType' };
            rxEntsResult = 'rxEntsResult';
            entResult = new RxEnterpriseResponse();

            platformLocationService.getCurrentLocation = jasmine.createSpy().and.returnValue(currentLocation);
            enterpriseService.getEnterpriseIdForLocation = jasmine.createSpy().and.returnValue(currentLocationEntId);
            httpClient.get = jasmine.createSpy().and.returnValues(
                { toPromise: () => rxUserResult },
                { toPromise: () => rxEntsResult }
            );

            spyOn(service, 'rxAccessCheckWithSessionStorage').and.callFake(() => {
                return rxEntsResult;
            });

            let store = {
                'rxAccess': [entResult]
            };
            const mockSessionStorage = {
                getItem: (key: string): string => {
                    return key in store ? store[key] : null;
                }
            };

            spyOn(sessionStorage, 'getItem').and.callFake(mockSessionStorage.getItem);
        });

        it('should call initial functions', async () => {
            httpClient.get = jasmine.createSpy().and.callFake(() => { throw new HttpErrorResponse({ status: 404 }); });

            await service.getRxClinicianData(userId);

            expect(platformLocationService.getCurrentLocation).toHaveBeenCalledWith();
            expect(enterpriseService.getEnterpriseIdForLocation).toHaveBeenCalledWith(currentLocation.id);
        });

        it('should call httpClient.get', async () => {
            httpClient.get = jasmine.createSpy().and.callFake(() => { throw new HttpErrorResponse({ status: 404 }); });

            await service.getRxClinicianData(userId);

            expect(httpClient.get).toHaveBeenCalledWith(
                `${rxApiUrl}/api/v2/rxusers/userid/${userId}`,
                { headers: { enterpriseid: currentLocationEntId.toString() } }
            );
        });

        it('should throw error if httpClient.get throws error not HttpErrorResponse', async () => {
            httpClient.get = () => { throw new Error(); };
            let caught = false;

            try {
                await service.getRxClinicianData(userId);
            } catch {
                caught = true;
            }

            expect(caught).toBe(true);
        });

        it('should throw error if httpCient.get throws ErrorEvent', async () => {
            httpClient.get = () => { throw new ErrorEvent('test'); };
            let caught = false;

            try {
                await service.getRxClinicianData(userId);
            } catch {
                caught = true;
            }

            expect(caught).toBe(true);
        });

        it('should throw error if httpClient.get throws error with status that is not 404', async () => {
            httpClient.get = () => { throw new HttpErrorResponse({ status: 400 }); };
            let caught = false;

            try {
                await service.getRxClinicianData(userId);
            } catch {
                caught = true;
            }

            expect(caught).toBe(true);
        });

        it('should return empty values if httpClient.get throws error with correct conditions', async () => {
            httpClient.get = () => { throw new HttpErrorResponse({ status: 404 }); };
            let caught = false;
            let result;

            try {
                result = await service.getRxClinicianData(userId);
            } catch (e) {
                caught = true;
            }

            expect(caught).toBe(false);
            expect(result).toEqual({ roles: [], locations: [], isNew: true });
        });

        it('should call functions and return result if result of first get is success', async () => {

            const getLegacyIdsResult = [
                { legacy_LocationID: 'legacyId1', id: 'id1' },
                { legacy_LocationID: 'legacyId2', id: 'id2' }
            ];
            enterpriseService.getLegacyIdsForRxEnterprises = jasmine.createSpy().and.returnValue(getLegacyIdsResult);
            const result = await service.getRxClinicianData(userId);

            // the service.getRxClinicianData(userId) call above will end up calling the rxAccessCheckWithSessionStorage method in the service which caches
            // the rx access values in session storage
            expect(sessionStorage.getItem('rxAccess')).toEqual([entResult]);

            expect(enterpriseService.getLegacyIdsForRxEnterprises).toHaveBeenCalledWith(rxEntsResult);

            expect(result).toEqual({
                roles: rxUserResult.clinicianRoleType,
                locations: [
                    { legacyId: getLegacyIdsResult[0].legacy_LocationID, enterpriseId: getLegacyIdsResult[0].id },
                    { legacyId: getLegacyIdsResult[1].legacy_LocationID, enterpriseId: getLegacyIdsResult[1].id },
                ],
                isNew: false
            });
        });

    });

    describe('saveRxClinician function ->', () => {

        let user, rxUser, rxSettings;
        let saveRxClinicianResult;
        beforeEach(() => {

            user = { UserId: 'mockUserId' };
            rxUser = 'mockRxUser';
            rxSettings = { roles: [], locations: [] };

            saveRxClinicianResult = 'saveResult';
            userServices.RxAccess = { save: jasmine.createSpy().and.returnValue({ $promise: saveRxClinicianResult }) };
        });


        let entIds, authEntId, updateRxUserResult, createRxUserResult;
        beforeEach(() => {
            entIds = ['entId'];
            authEntId = 'authEntId';

            updateRxUserResult = 'updateRxUserResult';
            createRxUserResult = 'createRxUserResult';
            user.IsRxRegistered = true;


            enterpriseService.getEnterpriseIdsForLocations = jasmine.createSpy().and.returnValue(entIds);
            (service as any).getAuthEntIdForLocationList = jasmine.createSpy().and.returnValue(authEntId);
            (service as any).updateRxUser = jasmine.createSpy().and.returnValue(updateRxUserResult);
            (service as any).createRxUser = jasmine.createSpy().and.returnValue(createRxUserResult);
        });

        it('should call getEnterpriseIdsForLocations and getAuthEntIdForLocationList', async () => {
            rxSettings.locations = [{ value: 'locId' }];

            await service.saveRxClinician(user, rxUser, rxSettings);

            expect(enterpriseService.getEnterpriseIdsForLocations).toHaveBeenCalledWith(['locId']);
            expect((service as any).getAuthEntIdForLocationList).toHaveBeenCalledWith(entIds);
        });

        it('should call updateRxUser if user is registered', async () => {
            const result = await service.saveRxClinician(user, rxUser, rxSettings);

            const rxExpected = new RxUserRequest(rxUser, rxSettings);
            expect((service as any).updateRxUser).toHaveBeenCalledWith(rxExpected, entIds, authEntId, user);
            expect(result).toBe(updateRxUserResult);
        });

        it('should clear Address fields if AddressReferrerId is not null', async () => {
            user.AddressReferrerId = 123;
            user.AddressLine1 = '123 Main';

            const result = await service.saveRxClinician(user, rxUser, rxSettings);

            const rxExpected = new RxUserRequest(rxUser, rxSettings);
            expect((service as any).updateRxUser).toHaveBeenCalledWith(rxExpected, entIds, authEntId, user);
            expect(result).toBe(updateRxUserResult);
        });

        describe('when user is not registered ->', () => {

            beforeEach(() => {
                rxUser = {};
                user.IsRxRegistered = false;

                (service as any).getRxUser = jasmine.createSpy().and.returnValue(rxUser);
            });

            it('should call getRxUser', async () => {
                await service.saveRxClinician(user, rxUser, rxSettings);

                expect((service as any).getRxUser).toHaveBeenCalledWith(user.UserId, authEntId);
            });

            it('should throw error if getRxUser throws error not HttpErrorResponse', async () => {
                (service as any).getRxUser = () => { throw new Error(); };
                let caught = false;

                try {
                    await service.saveRxClinician(user, rxUser, rxSettings);
                } catch {
                    caught = true;
                }

                expect(caught).toBe(true);
            });

            it('should throw error if getRxUser throws ErrorEvent', async () => {
                (service as any).getRxUser = () => { throw new ErrorEvent('test'); };
                let caught = false;

                try {
                    await service.saveRxClinician(user, rxUser, rxSettings);
                } catch {
                    caught = true;
                }

                expect(caught).toBe(true);
            });

            it('should throw error if getRxUser throws error with status that is not 404', async () => {
                (service as any).getRxUser = () => { throw new HttpErrorResponse({ status: 400 }); };
                let caught = false;

                try {
                    await service.saveRxClinician(user, rxUser, rxSettings);
                } catch {
                    caught = true;
                }

                expect(caught).toBe(true);
            });

            it('should call createRxUser if getRxUser throws error with correct conditions', async () => {
                (service as any).getRxUser = () => { throw new HttpErrorResponse({ status: 404 }); };
                let caught = false;
                let result;

                try {
                    result = await service.saveRxClinician(user, rxUser, rxSettings);
                } catch (e) {
                    caught = true;
                }

                expect(caught).toBe(false);
                const rxExpected = new RxUserRequest(rxUser, rxSettings);
                expect((service as any).createRxUser).toHaveBeenCalledWith(rxExpected, entIds, authEntId, user);
                expect(result).toBe(createRxUserResult);
            });

            it('should call updateRxUser if result of getRxUser is not null', async () => {
                const result = await service.saveRxClinician(user, rxUser, rxSettings);

                const rxExpected = new RxUserRequest(rxUser, rxSettings);
                expect((service as any).updateRxUser).toHaveBeenCalledWith(rxExpected, entIds, authEntId, user);
                expect(result).toBe(updateRxUserResult);
            });

            it('should call createRxUser if result of getRxUser is null', async () => {
                (service as any).getRxUser = () => null;
                const result = await service.saveRxClinician(user, rxUser, rxSettings);

                const rxExpected = new RxUserRequest(rxUser, rxSettings);
                expect((service as any).createRxUser).toHaveBeenCalledWith(rxExpected, entIds, authEntId, user);
                expect(result).toBe(createRxUserResult);
            });

        });

    });

    describe('getAuthEntIdForLocationList function ->', () => {

        it('should return entIds[0] if entIds is not empty', async () => {
            const entIds = ['entId'];

            const result = await (service as any).getAuthEntIdForLocationList(entIds);

            expect(result).toBe(entIds[0]);
        });

        it('should call functions and return result if entIds is empty', async () => {
            const ofcLocation = { id: 'locId' };
            const entId = 'entId';
            platformLocationService.getCurrentLocation = jasmine.createSpy().and.returnValue(ofcLocation);
            enterpriseService.getEnterpriseIdForLocation = jasmine.createSpy().and.returnValue(entId);

            const result = await (service as any).getAuthEntIdForLocationList([]);

            expect(platformLocationService.getCurrentLocation).toHaveBeenCalledWith();
            expect(enterpriseService.getEnterpriseIdForLocation).toHaveBeenCalledWith(ofcLocation.id);
            expect(result).toBe(entId);
        });

        it('should call functions and return result if entIds is null', async () => {
            const ofcLocation = { id: 'locId' };
            const entId = 'entId';
            platformLocationService.getCurrentLocation = jasmine.createSpy().and.returnValue(ofcLocation);
            enterpriseService.getEnterpriseIdForLocation = jasmine.createSpy().and.returnValue(entId);

            const result = await (service as any).getAuthEntIdForLocationList(null);

            expect(platformLocationService.getCurrentLocation).toHaveBeenCalledWith();
            expect(enterpriseService.getEnterpriseIdForLocation).toHaveBeenCalledWith(ofcLocation.id);
            expect(result).toBe(entId);
        });

    });

    describe('getRxUser function ->', () => {

        it('should call httpClient.get and return result', async () => {
            const userId = 'userId';
            const enterpriseId = 'entId';
            const toPromiseResult = { id: 'resultId' };
            httpClient.get = jasmine.createSpy().and.returnValue({ toPromise: () => toPromiseResult });

            const result = await (service as any).getRxUser(userId, enterpriseId);

            expect(httpClient.get).toHaveBeenCalledWith(
                `${rxApiUrl}/api/v2/rxusers/userid/${userId}`,
                { headers: { enterpriseid: enterpriseId.toString() } }
            );
            expect(result).toBe(toPromiseResult);
        });

    });

    describe('createRxUser function ->', () => {

        it('should call httpClient.post twice and update user', async () => {
            const user = { UserId: 'userId', IsRxRegistered: false };
            const rxUser = 'rxUser';
            const entIds = ['entId'];
            const authEntId = 'authEntId';
            const toPromiseResult = { id: 'resultId' };
            const promiseResult = 'promiseResult';
            httpClient.post = jasmine.createSpy().and.returnValue({ toPromise: () => toPromiseResult });
            userServices.Users = { update: jasmine.createSpy().and.returnValue({ $promise: promiseResult }) };
            referenceDataService.forceEntityExecution = jasmine.createSpy();
            referenceDataService.entityNames.users = 'usersKey';

            const result = await (service as any).createRxUser(rxUser, entIds, authEntId, user);

            expect(httpClient.post).toHaveBeenCalledWith(
                `${rxApiUrl}/api/v2/rxusers/userid/${user.UserId}`,
                rxUser,
                { headers: { enterpriseid: authEntId.toString() } }
            );
            expect(httpClient.post).toHaveBeenCalledWith(
                `${rxApiUrl}/api/v2/rxusers/userid/${user.UserId}/enterprises`,
                { enterpriseIDs: entIds },
                { headers: { enterpriseid: authEntId.toString() } }
            );
            expect(user.IsRxRegistered).toBe(true);
            expect(userServices.Users.update).toHaveBeenCalledWith(user);
            expect(referenceDataService.forceEntityExecution).toHaveBeenCalledWith(referenceDataService.entityNames.users);
            expect(result).toBe(promiseResult);
        });

    });

    describe('updateRxUser function ->', () => {

        it('should call httpClient.put and .post and return result if location is registered', async () => {
            const user = { UserId: 'userId', IsRxRegistered: true };
            const rxUser = 'rxUser';
            const entIds = ['entId'];
            const authEntId = 'authEntId';
            const toPromiseResult = { id: 'resultId' };
            const promiseResult = 'promiseResult';
            httpClient.put = jasmine.createSpy().and.returnValue({ toPromise: () => toPromiseResult });
            httpClient.post = jasmine.createSpy().and.returnValue({ toPromise: () => { } });
            userServices.Users = { update: jasmine.createSpy().and.returnValue({ $promise: promiseResult }) };
            referenceDataService.forceEntityExecution = jasmine.createSpy();
            referenceDataService.entityNames.users = 'usersKey';

            const result = await (service as any).updateRxUser(rxUser, entIds, authEntId, user);

            expect(httpClient.put).toHaveBeenCalledWith(
                `${rxApiUrl}/api/v2/rxusers/userid/${user.UserId}`,
                rxUser,
                { headers: { enterpriseid: authEntId.toString() } }
            );
            expect(httpClient.post).toHaveBeenCalledWith(
                `${rxApiUrl}/api/v2/rxusers/userid/${user.UserId}/enterprises`,
                { enterpriseIDs: entIds },
                { headers: { enterpriseid: authEntId.toString() } }
            );
            expect(userServices.Users.update).not.toHaveBeenCalled();
            expect(referenceDataService.forceEntityExecution).not.toHaveBeenCalled();
            expect(result).toBe(toPromiseResult);
        });

        it('should call httpClient.put and .post and update location if location is not registered', async () => {
            const user = { UserId: 'userId', IsRxRegistered: false };
            const rxUser = 'rxUser';
            const entIds = ['entId'];
            const authEntId = 'authEntId';
            const toPromiseResult = { id: 'resultId' };
            const promiseResult = 'promiseResult';
            httpClient.put = jasmine.createSpy().and.returnValue({ toPromise: () => toPromiseResult });
            httpClient.post = jasmine.createSpy().and.returnValue({ toPromise: () => { } });
            userServices.Users = { update: jasmine.createSpy().and.returnValue({ $promise: promiseResult }) };
            referenceDataService.forceEntityExecution = jasmine.createSpy();
            referenceDataService.entityNames.users = 'usersKey';

            const result = await (service as any).updateRxUser(rxUser, entIds, authEntId, user);

            expect(httpClient.put).toHaveBeenCalledWith(
                `${rxApiUrl}/api/v2/rxusers/userid/${user.UserId}`,
                rxUser,
                { headers: { enterpriseid: authEntId.toString() } }
            );
            expect(httpClient.post).toHaveBeenCalledWith(
                `${rxApiUrl}/api/v2/rxusers/userid/${user.UserId}/enterprises`,
                { enterpriseIDs: entIds },
                { headers: { enterpriseid: authEntId.toString() } }
            );
            expect(user.IsRxRegistered).toBe(true);
            expect(userServices.Users.update).toHaveBeenCalledWith(user);
            expect(referenceDataService.forceEntityExecution).toHaveBeenCalledWith(referenceDataService.entityNames.users);
            expect(result).toBe(promiseResult);
        });

    });

    describe('saveRxPatient function ->', () => {
        
        let patient, fusePatient;
        let currentLocationId;
        let saveRxPatientResult;
        beforeEach(() => {            

            patient = new RxPatient();
            fusePatient = { PatientId: 'patId' };

            currentLocationId = 'currLocId';
            platformLocationService.getCurrentLocation = jasmine.createSpy().and.returnValue({ id: currentLocationId });

            saveRxPatientResult = 'saveResult';
            patientServices.RxPatient = {
                save: jasmine.createSpy().and.returnValue({ $promise: saveRxPatientResult })
            };
        });        

            let entId, updateRxPatientResult, createRxPatientResult, patUrl;
            let locations;
            beforeEach(() => {
                entId = 'entId';
                updateRxPatientResult = { Result: 'updateRxPatientResult' };
                createRxPatientResult = { Result: 'createRxPatientResult' };
                patUrl = 'patientUrl';
                fusePatient.IsRxRegistered = true;
                

                enterpriseService.getEnterpriseIdForLocation = jasmine.createSpy().and.returnValue(entId);
                (service as any).updateRxPatient = jasmine.createSpy().and.returnValue(updateRxPatientResult);
                (service as any).createRxPatient = jasmine.createSpy().and.returnValue(createRxPatientResult);
                (service as any).getRxPatientUrl = jasmine.createSpy().and.returnValue(patUrl);

                locations = [{ LocationId: currentLocationId, IsRxRegistered: true }];
                referenceDataService.entityNames.locations = 'locationsKey';
                referenceDataService.get = jasmine.createSpy().and.returnValue(locations);
            });

            it('should call referenceDataService.get with correct key', async () => {
                await service.saveRxPatient(patient, fusePatient);

                expect(referenceDataService.get).toHaveBeenCalledWith(referenceDataService.entityNames.locations);
            });

            it('should throw error when location is not found', async () => {
                locations[0].LocationId = 'differentLocId';

                let pass = false;
                try {
                    await service.saveRxPatient(patient, fusePatient);
                } catch (e) {
                    expect(e).toBe('Location');
                    pass = true;
                }

                expect(pass).toBe(true);
            });

            it('should call getEnterpriseIdForLocation', async () => {
                await service.saveRxPatient(patient, fusePatient);

                expect(enterpriseService.getEnterpriseIdForLocation).toHaveBeenCalledWith(currentLocationId);
            });

            it('should throw error when call fails', async () => {
                enterpriseService.getEnterpriseIdForLocation = jasmine.createSpy().and.throwError('test');

                let pass = false;
                try {
                    await service.saveRxPatient(patient, fusePatient);
                } catch (e) {
                    expect(e).toBe('Location');
                    pass = true;
                }

                expect(pass).toBe(true);
            });

            it('should call getRxEnterprise if location is not registered', async () => {
                locations[0].IsRxRegistered = false;
                (service as any).getRxEnterprise = jasmine.createSpy().and.returnValue({});

                await service.saveRxPatient(patient, fusePatient);

                expect((service as any).getRxEnterprise).toHaveBeenCalledWith(entId);
            });

            it('should throw error if location is not registered', async () => {
                locations[0].IsRxRegistered = false;
                (service as any).getRxEnterprise = jasmine.createSpy().and.returnValue(null);

                let pass = false;
                try {
                    await service.saveRxPatient(patient, fusePatient);
                } catch (e) {
                    expect(e).toBe('Location');
                    pass = true;
                }

                expect(pass).toBe(true);
            });

            it('should call updateRxPatient if user is registered', async () => {
                const result = await service.saveRxPatient(patient, fusePatient);

                const rxExpected = new Rx2PatientRequest(patient);
                expect((service as any).updateRxPatient).toHaveBeenCalledWith(rxExpected, entId, fusePatient);
                expect((service as any).getRxPatientUrl).toHaveBeenCalledWith(fusePatient.PatientId, entId);
                expect(result).toBe(updateRxPatientResult);
                expect(result.ExternalPatientURL).toBe(patUrl);
            });

            it('should throw error if call fails without status', async () => {
                const error = {};
                (service as any).updateRxPatient = jasmine.createSpy().and.callFake(() => { throw new HttpErrorResponse(error); });

                let pass = false;
                try {
                    await service.saveRxPatient(patient, fusePatient);
                } catch (e) {
                    expect(e).not.toBe('Location');
                    pass = true;
                }

                expect(pass).toBe(true);
            });

            it('should throw error if call fails without 502 status', async () => {
                const error = { status: 400 };
                (service as any).updateRxPatient = jasmine.createSpy().and.callFake(() => { throw new HttpErrorResponse(error); });

                let pass = false;
                try {
                    await service.saveRxPatient(patient, fusePatient);
                } catch (e) {
                    expect(e).not.toBe('Location');
                    pass = true;
                }

                expect(pass).toBe(true);
            });

            it('should throw error if call fails without error', async () => {
                const error = { status: 502 };
                (service as any).updateRxPatient = jasmine.createSpy().and.callFake(() => { throw new HttpErrorResponse(error); });

                let pass = false;
                try {
                    await service.saveRxPatient(patient, fusePatient);
                } catch (e) {
                    expect(e).not.toBe('Location');
                    pass = true;
                }

                expect(pass).toBe(true);
            });

            it('should throw error if call fails without error.Details', async () => {
                const error = { status: 502, error: {} };
                (service as any).updateRxPatient = jasmine.createSpy().and.callFake(() => { throw new HttpErrorResponse(error); });

                let pass = false;
                try {
                    await service.saveRxPatient(patient, fusePatient);
                } catch (e) {
                    expect(e).not.toBe('Location');
                    pass = true;
                }

                expect(pass).toBe(true);
            });

            it('should throw error if call fails without correct error.Details message', async () => {
                const error = { status: 502, error: { Details: 'test details' } };
                (service as any).updateRxPatient = jasmine.createSpy().and.callFake(() => { throw new HttpErrorResponse(error); });

                let pass = false;
                try {
                    await service.saveRxPatient(patient, fusePatient);
                } catch (e) {
                    expect(e).not.toBe('Location');
                    pass = true;
                }

                expect(pass).toBe(true);
            });

            it('should throw Location error if call fails without correct error.Details message', async () => {
                const error = { status: 502, error: { Details: 'Description: Clinician does not have access to the clinic' } };
                (service as any).updateRxPatient = jasmine.createSpy().and.callFake(() => { throw new HttpErrorResponse(error); });

                let pass = false;
                try {
                    await service.saveRxPatient(patient, fusePatient);
                } catch (e) {
                    expect(e).toBe('Location');
                    pass = true;
                }

                expect(pass).toBe(true);
            });

            describe('when patient is not registered ->', () => {

                let rxPatient;
                beforeEach(() => {
                    rxPatient = {};
                    fusePatient.IsRxRegistered = false;

                    (service as any).getRxPatient = jasmine.createSpy().and.returnValue(rxPatient);
                });

                it('should call getRxPatient', async () => {
                    await service.saveRxPatient(patient, fusePatient);

                    expect((service as any).getRxPatient).toHaveBeenCalledWith(fusePatient.PatientId, entId);
                });

                it('should throw error if getRxPatient throws error not HttpErrorResponse', async () => {
                    (service as any).getRxPatient = () => { throw new Error(); };
                    let caught = false;

                    try {
                        await service.saveRxPatient(patient, fusePatient);
                    } catch {
                        caught = true;
                    }

                    expect(caught).toBe(true);
                });

                it('should throw error if getRxPatient throws ErrorEvent', async () => {
                    (service as any).getRxPatient = () => { throw new ErrorEvent('test'); };
                    let caught = false;

                    try {
                        await service.saveRxPatient(patient, fusePatient);
                    } catch {
                        caught = true;
                    }

                    expect(caught).toBe(true);
                });

                it('should throw error if getRxPatient throws error with status that is not 404', async () => {
                    (service as any).getRxPatient = () => { throw new HttpErrorResponse({ status: 400 }); };
                    let caught = false;

                    try {
                        await service.saveRxPatient(patient, fusePatient);
                    } catch {
                        caught = true;
                    }

                    expect(caught).toBe(true);
                });

                it('should call createRxPatient if getRxPatient throws error with correct conditions', async () => {
                    (service as any).getRxPatient = () => { throw new HttpErrorResponse({ status: 404 }); };
                    let caught = false;
                    let result;

                    try {
                        result = await service.saveRxPatient(patient, fusePatient);
                    } catch (e) {
                        caught = true;
                    }

                    expect(caught).toBe(false);
                    const rxExpected = new Rx2PatientRequest(patient);
                    expect((service as any).createRxPatient).toHaveBeenCalledWith(rxExpected, entId, fusePatient);
                    expect(result).toBe(createRxPatientResult);
                });

                it('should call updateRxPatient if result of getRxPatient is not null', async () => {
                    const result = await service.saveRxPatient(patient, fusePatient);

                    const rxExpected = new Rx2PatientRequest(patient);
                    expect((service as any).updateRxPatient).toHaveBeenCalledWith(rxExpected, entId, fusePatient);
                    expect(result).toBe(updateRxPatientResult);
                });

                it('should call createRxPatient if result of getRxPatient is null', async () => {
                    (service as any).getRxPatient = () => null;
                    const result = await service.saveRxPatient(patient, fusePatient);

                    const rxExpected = new Rx2PatientRequest(patient);
                    expect((service as any).createRxPatient).toHaveBeenCalledWith(rxExpected, entId, fusePatient);
                    expect(result).toBe(createRxPatientResult);
                });

            });
        

    });

    describe('getRxPatientMedications function ->', () => {
        
        let patientId, currentLocationId;
        let getMedicationsResult;
        let userId, applicationId;
        beforeEach(() => {            

            patientId = 'patId';

            currentLocationId = 'currLocId';
            platformLocationService.getCurrentLocation = jasmine.createSpy().and.returnValue({ id: currentLocationId });

            userId = 'userId';
            applicationId = 'appId';
            spyOn(sessionStorage, 'getItem').and.returnValue(JSON.stringify({
                Result: {
                    User: { UserId: userId },
                    Application: { ApplicationId: applicationId }
                }
            }));

            getMedicationsResult = 'getMedsResult';
            patientServices.RxPatient = {
                medications: jasmine.createSpy().and.returnValue({ $promise: getMedicationsResult })
            };
        });        
       
            let entId, getResult;
            beforeEach(() => {                

                entId = 'entId';
                enterpriseService.getEnterpriseIdForLocation = jasmine.createSpy().and.returnValue(entId);

                const med = new RxMedicationResponse();
                med.displayName = 'medication';
                med.writtenDate = new Date().toUTCString();
                getResult = [med];
                httpClient.get = jasmine.createSpy().and.returnValue({ toPromise: () => getResult });
            });

            it('should call getEnterpriseIdForLocation', async () => {
                await service.getRxPatientMedications(patientId);

                expect(enterpriseService.getEnterpriseIdForLocation).toHaveBeenCalledWith(currentLocationId);
            });

            it('should call httpClient.get with correct parameters and return correct result', async () => {
                const result = await service.getRxPatientMedications(patientId);

                expect(httpClient.get).not.toHaveBeenCalledWith(
                    `${(service as any).rxApiUrl}/api/v2/medications/patientid/${patientId}`,
                    { headers: { enterpriseid: entId.toString() } }
                );
                expect(httpClient.get).toHaveBeenCalledWith(
                    `${(service as any).rxApiUrl}/api/v2/prescriptions/patientid/${patientId}`,
                    { headers: { enterpriseid: entId.toString() } }
                );
                expect(result).toEqual(getResult/*.concat(getResult)*/.map(r => new RxMedication(r)));
            });        

    });

    describe('getRxPatient function ->', () => {

        it('should call httpClient.get and return result', async () => {
            const patientId = 'patId';
            const enterpriseId = 'entId';
            const toPromiseResult = { id: 'resultId' };
            httpClient.get = jasmine.createSpy().and.returnValue({ toPromise: () => toPromiseResult });

            const result = await (service as any).getRxPatient(patientId, enterpriseId);

            expect(httpClient.get).toHaveBeenCalledWith(
                `${rxApiUrl}/api/v2/rxpatients/patientid/${patientId}`,
                { headers: { enterpriseid: enterpriseId.toString() } }
            );
            expect(result).toBe(toPromiseResult);
        });

    });

    describe('createRxPatient function ->', () => {

        it('should call httpClient.post and update user', async () => {
            const patient = { PatientId: '-id-', IsRxRegistered: false };
            const rxPatient = 'rxPatient';
            const entId = 'entId';
            const toPromiseResult = { id: 'resultId' };
            const promiseResult = 'promiseResult';
            httpClient.post = jasmine.createSpy().and.returnValue({ toPromise: () => toPromiseResult });
            personServices.Persons = { update: jasmine.createSpy().and.returnValue({ $promise: promiseResult }) };

            const result = await (service as any).createRxPatient(rxPatient, entId, patient);

            expect(httpClient.post).toHaveBeenCalledWith(
                `${rxApiUrl}/api/v2/rxpatients/patientid/${patient.PatientId}`,
                rxPatient,
                { headers: { enterpriseid: entId.toString() } }
            );
            expect(patient.IsRxRegistered).toBe(true);
            expect(personServices.Persons.update).toHaveBeenCalledWith({ Profile: patient });
            expect(result).toBe(promiseResult);
        });

    });

    describe('updateRxPatient function ->', () => {

        it('should call httpClient.put and return result if patient is registered', async () => {
            const patient = { PatientId: '-id-', IsRxRegistered: true };
            const rxPatient = 'rxPatient';
            const entId = 'entId';
            const toPromiseResult = { id: 'resultId' };
            const promiseResult = 'promiseResult';
            httpClient.put = jasmine.createSpy().and.returnValue({ toPromise: () => toPromiseResult });
            personServices.Persons = { update: jasmine.createSpy().and.returnValue({ $promise: promiseResult }) };

            const result = await (service as any).updateRxPatient(rxPatient, entId, patient);

            expect(httpClient.put).toHaveBeenCalledWith(
                `${rxApiUrl}/api/v2/rxpatients/patientid/${patient.PatientId}`,
                rxPatient,
                { headers: { enterpriseid: entId.toString() } }
            );
            expect(personServices.Persons.update).not.toHaveBeenCalled();
            expect(result).toBe(toPromiseResult);
        });

        it('should call httpClient.put and update patient if patient is not registered', async () => {
            const patient = { PatientId: '-id-', IsRxRegistered: false };
            const rxPatient = 'rxPatient';
            const entId = 'entId';
            const toPromiseResult = { id: 'resultId' };
            const promiseResult = 'promiseResult';
            httpClient.put = jasmine.createSpy().and.returnValue({ toPromise: () => toPromiseResult });
            personServices.Persons = { update: jasmine.createSpy().and.returnValue({ $promise: promiseResult }) };

            const result = await (service as any).updateRxPatient(rxPatient, entId, patient);

            expect(httpClient.put).toHaveBeenCalledWith(
                `${rxApiUrl}/api/v2/rxpatients/patientid/${patient.PatientId}`,
                rxPatient,
                { headers: { enterpriseid: entId.toString() } }
            );
            expect(patient.IsRxRegistered).toBe(true);
            expect(personServices.Persons.update).toHaveBeenCalledWith({ Profile: patient });
            expect(result).toBe(promiseResult);
        });

    });

    describe('getRxPatientUrl function ->', () => {

        it('should call httpClient.get and return result', async () => {
            const patientId = 'patId';
            const enterpriseId = 'entId';
            const toPromiseResult = { id: 'resultId' };
            httpClient.get = jasmine.createSpy().and.returnValue({ toPromise: () => toPromiseResult });

            const result = await (service as any).getRxPatientUrl(patientId, enterpriseId);

            expect(httpClient.get).toHaveBeenCalledWith(
                `${rxApiUrl}/api/v2/rxpatients/patientid/${patientId}/vendorpatienturl`,
                { headers: { enterpriseid: enterpriseId.toString() } }
            );
            expect(result).toBe(toPromiseResult);
        });

    });

    describe('getRxNotifications function ->', () => {
        
        let userId, currentLocationId, entId;
        let getNotificationsResult;
        let applicationId;
        beforeEach(() => {
            entId = 123;            

            userId = 'userId';

            currentLocationId = 'currLocId';
            platformLocationService.getCurrentLocation = jasmine.createSpy().and.returnValue({ id: currentLocationId });

            applicationId = 'appId';
            spyOn(sessionStorage, 'getItem').and.returnValue(JSON.stringify({
                Result: {
                    Application: { ApplicationId: applicationId }
                }
            }));

            getNotificationsResult = 'getNotificationsResult';            
        });

        let getResult;
        beforeEach(() => {

            const notification = new RxNotificationsResponse();
            notification.pendingRxChangeTotalCount = 100;
            getResult = [notification];
            httpClient.get = jasmine.createSpy().and.returnValue({ toPromise: () => getResult });
        });

        it('should call httpClient.get with correct parameters and return correct result', async () => {
            const result = await service.getRxNotifications(userId, entId);

            expect(httpClient.get).toHaveBeenCalledWith(
                `${(service as any).rxApiUrl}/api/v2/notificationcounts/userid/${userId}`,
                { headers: { enterpriseid: entId.toString() } }
            );
            expect(result).toEqual(new RxNotifications(getResult));
        });

    });

    describe('notificationsPreCheck function ->', () => {

        let userId, currentLocationId;
        let entId, entResult;
        let rxUser;
        let rxEntsResult;

        beforeEach(() => {
            userId = 'userId';
            rxEntsResult = 'rxEntsResult';
            currentLocationId = 'currLocId';
            platformLocationService.getCurrentLocation = jasmine.createSpy().and.returnValue({ id: currentLocationId });

            entId = 'entId';
            enterpriseService.getEnterpriseIdForLocation = jasmine.createSpy().and.returnValue(entId);

            entResult = new RxEnterpriseResponse();
            httpClient.get = jasmine.createSpy().and.returnValue({ toPromise: () => [entResult] });

            rxUser = {};
            (service as any).getRxUser = jasmine.createSpy().and.returnValue(rxUser);

            spyOn(service, 'rxAccessCheckWithSessionStorage').and.callFake(() => {
                return [
                    entResult
                ];
            });

            let store = {
                'rxAccess': [entResult]
            };
            const mockSessionStorage = {
                getItem: (key: string): string => {
                    return key in store ? store[key] : null;
                }
            };

            spyOn(sessionStorage, 'getItem').and.callFake(mockSessionStorage.getItem);
        });

        it('should call getEnterpriseIdForLocation and httpClient.get with correct parameters', async () => {

            await service.notificationsPreCheck(userId);

            expect(enterpriseService.getEnterpriseIdForLocation).toHaveBeenCalledWith(currentLocationId);

            // the service.notificationsPreCheck(userId) call above will end up calling the rxAccessCheckWithSessionStorage method in the service which caches
            // the rx access values in session storage
            expect(sessionStorage.getItem('rxAccess')).toEqual([entResult]);
        });

        it('should return false if result is null', async () => {
            httpClient.get = jasmine.createSpy().and.returnValue({ toPromise: () => null });
            const result = await service.notificationsPreCheck(userId);

            expect(result).toEqual({ result: false });
        });

        it('should return false if result is empty', async () => {
            httpClient.get = jasmine.createSpy().and.returnValue({ toPromise: () => [] });
            const result = await service.notificationsPreCheck(userId);

            expect(result).toEqual({ result: false });
        });

        it('should call getRxUser if result contains the current enterpriseId', async () => {
            entResult.enterpriseID = entId;

            await service.notificationsPreCheck(userId);

            expect((service as any).getRxUser).toHaveBeenCalledWith(userId, entId);
        });

        it('should return false if getRxUser result is null', async () => {
            entResult.enterpriseID = entId;
            (service as any).getRxUser = () => null;

            const result = await service.notificationsPreCheck(userId);

            expect(result).toEqual({ result: false });
        });

        it('should return false if rxUser.clinicianRoleType is null', async () => {
            entResult.enterpriseID = entId;
            rxUser.clinicianRoleType = null;

            const result = await service.notificationsPreCheck(userId);

            expect(result).toEqual({ result: false });
        });

        it('should return false if rxUser.clinicianRoleType is empty', async () => {
            entResult.enterpriseID = entId;
            rxUser.clinicianRoleType = [];

            const result = await service.notificationsPreCheck(userId);

            expect(result).toEqual({ result: false });
        });

        it('should return false if rxUser.clinicianRoleType does not contain prescribing user', async () => {
            entResult.enterpriseID = entId;
            rxUser.clinicianRoleType = [2, 3, 4];

            const result = await service.notificationsPreCheck(userId);

            expect(result).toEqual({ result: false, entId, showAdminLink: true });
        });

        it('should return true if rxUser.clinicianRoleType contains prescribing user', async () => {
            entResult.enterpriseID = entId;
            rxUser.clinicianRoleType = [2, 3, 1, 4];

            const result = await service.notificationsPreCheck(userId);

            expect(result).toEqual({ result: true, entId, showAdminLink: true });
        });

        it('should return current location entId if rxUser locations contains it', async () => {
            entResult.enterpriseID = entId;
            rxUser.clinicianRoleType = [2, 3, 1, 4];

            const result = await service.notificationsPreCheck(userId);

            expect(result).toEqual({ result: true, entId, showAdminLink: true });
        });

        it('should return first location entId if rxUser locations contains it', async () => {
            const otherId = 'otherId';
            entResult.enterpriseID = otherId;
            rxUser.clinicianRoleType = [2, 3, 1, 4];

            const result = await service.notificationsPreCheck(userId);

            expect(result).toEqual({ result: true, entId: otherId, showAdminLink: true });
        });

        it('should return showAdminLink as false if clinicianRoleType does not contain 2 or 4', async () => {
            entResult.enterpriseID = entId;
            rxUser.clinicianRoleType = [1];

            const result = await service.notificationsPreCheck(userId);

            expect(result).toEqual({ result: true, entId, showAdminLink: false });
        });

        it('should return showAdminLink as true if clinicianRoleType contains 2', async () => {
            entResult.enterpriseID = entId;
            rxUser.clinicianRoleType = [1, 2];

            const result = await service.notificationsPreCheck(userId);

            expect(result).toEqual({ result: true, entId, showAdminLink: true });
        });

        it('should return showAdminLink as true if clinicianRoleType contains 4', async () => {
            entResult.enterpriseID = entId;
            rxUser.clinicianRoleType = [1, 4];

            const result = await service.notificationsPreCheck(userId);

            expect(result).toEqual({ result: true, entId, showAdminLink: true });
        });

        it('should return showAdminLink as true if clinicianRoleType contains 2 and 4', async () => {
            entResult.enterpriseID = entId;
            rxUser.clinicianRoleType = [1, 2, 4];

            const result = await service.notificationsPreCheck(userId);

            expect(result).toEqual({ result: true, entId, showAdminLink: true });
        });

    });

    describe('rxAccessCheck function ->', () => {

        let userId, currentLocationId;
        let entId, entResult;
        let rxUser;
        beforeEach(() => {
            userId = 'userId';

            currentLocationId = 'currLocId';
            platformLocationService.getCurrentLocation = jasmine.createSpy().and.returnValue({ id: currentLocationId });

            entId = 'entId';
            enterpriseService.getEnterpriseIdForLocation = jasmine.createSpy().and.returnValue(entId);

            entResult = new RxEnterpriseResponse();
            httpClient.get = jasmine.createSpy().and.returnValue({ toPromise: () => [entResult] });

            rxUser = {};
            (service as any).getRxUser = jasmine.createSpy().and.returnValue(rxUser);

            spyOn(service, 'rxAccessCheckWithSessionStorage').and.callFake(() => {
                return [
                    entResult
                ];
            });

            let store = {
                'rxAccess': [entResult]
            };
            const mockSessionStorage = {
                getItem: (key: string): string => {
                    return key in store ? store[key] : null;
                }
            };

            spyOn(sessionStorage, 'getItem').and.callFake(mockSessionStorage.getItem);
        });

        it('should call getEnterpriseIdForLocation and httpClient.get with correct parameters', async () => {

            await service.rxAccessCheck(userId);

            expect(enterpriseService.getEnterpriseIdForLocation).toHaveBeenCalledWith(currentLocationId);

            // the service.rxAccessCheck(userId) call above will end up calling the rxAccessCheckWithSessionStorage method in the service which caches
            // the rx access values in session storage
            expect(sessionStorage.getItem('rxAccess')).toEqual([entResult]);
        });

        it('should return true when ents contain current enterpriseId', async () => {
            entResult = new RxEnterpriseResponse();
            entResult.enterpriseID = 'entId';
            httpClient.get = jasmine.createSpy().and.returnValue({ toPromise: () => [entResult] });

            const result = await service.rxAccessCheck(userId);
            expect(result).toEqual({ result: true });
        });

        it('should return false when ents does not contain current enterpriseId', async () => {
            entResult = new RxEnterpriseResponse();
            entResult.enterpriseID = 'notInTheList';
            httpClient.get = jasmine.createSpy().and.returnValue({ toPromise: () => [entResult] });

            const result = await service.rxAccessCheck(userId);

            expect(result.result).toEqual(false);
        });
    });

    describe('rxAccessCheck function ->', () => {

        let userId, entResult, currentLocationId, entId;
        beforeEach(() => {

            currentLocationId = 'currLocId';
            platformLocationService.getCurrentLocation = jasmine.createSpy().and.returnValue({ id: currentLocationId });

            entId = 'entId';
            enterpriseService.getEnterpriseIdForLocation = jasmine.createSpy().and.returnValue(entId);

            spyOn(service, 'rxAccessCheckWithSessionStorage').and.callFake(() => {
                return null;
            });
        });

        it('should return false if ents is null or empty', async () => {

            entResult = new RxEnterpriseResponse();
            entResult.enterpriseID = 'entId';

            const result = await service.rxAccessCheck(userId);

            // the new rxAccessCheckWithSessionStorage method will now store the rx access check info into session storage
            // so we had to mock that returning null as the rxAccessCheck contains the logic to return false if rx access
            // data is null.
            expect(result.result).toEqual(false);
        });

    });

});
