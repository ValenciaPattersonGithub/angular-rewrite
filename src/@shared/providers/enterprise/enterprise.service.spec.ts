import { HttpClient } from '@angular/common/http';
import { MicroServiceApiService } from 'src/security/providers';
import { LegacyLocationService } from '../../../@core/data-services/legacy-location.service';
import { EnterpriseService } from './enterprise.service';

describe('EnterpriseService', () => {

    let service: EnterpriseService;
    let httpClient: Partial<HttpClient>;
    let microServiceApiService: Partial<MicroServiceApiService>;
    let legacyLocationService: Partial<LegacyLocationService>;
    let practiceService;
    
    const entApiUrl = 'mockEntApiUrl';
    const practicePromise = 'mockPracPromise';

    beforeEach(() => {
        microServiceApiService = {
            getEnterpriseApiUrl: jasmine.createSpy().and.returnValue(entApiUrl)
        };
        httpClient = {
            get: jasmine.createSpy().and.returnValue({ toPromise: () => practicePromise })
        };
        practiceService = {
            getCurrentPractice: jasmine.createSpy().and.returnValue({ id: 'practiceId' })
        };
        legacyLocationService = {
            getLocationEnterpriseId: jasmine.createSpy().and.returnValue('mockLegacyLocationId')
        };

        service = new EnterpriseService(practiceService, httpClient as any, microServiceApiService as any, legacyLocationService as any);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set properties', () => {
        expect((service as any).entApiUrl).toBe(entApiUrl);        
    });

    describe('getEnterpriseIdForLocation function ->', () => {

        let entRes, practiceEnt;
        beforeEach(() => {
            entRes = { id: 'entResId' };
            practiceEnt = { id: 'practiceEntId' };
            httpClient.get = jasmine.createSpy().and.returnValue({ toPromise: () => entRes });
            (service as any).practiceEnterprisePromise = Promise.resolve(practiceEnt);
        });

        it('should return value and not call httpClient.get if locationId is present in dictionary', async () => {
            let locationId = 100;
            let entId = 101;
            (service as any).locationEntIds[locationId] = entId;

            let result = await (service as any).getEnterpriseIdForLocation(locationId);

            expect(result).toBe(entId);
            expect(httpClient.get).not.toHaveBeenCalled();
        });

        it('should call httpClient.get with correct parameters', async () => {
            let locationId = 'locId';
            
            await (service as any).getEnterpriseIdForLocation(locationId);

            expect(legacyLocationService.getLocationEnterpriseId).toHaveBeenCalledWith(locationId);
        });

        it('should return entRes.id', async () => {
            let locationId = 'locId';
            
            let result = await (service as any).getEnterpriseIdForLocation(locationId);

            expect(result).toBe('mockLegacyLocationId');
            expect((service as any).locationEntIds[locationId]).toBe('mockLegacyLocationId');
            expect((service as any).entLocationIds['mockLegacyLocationId']).toBe(locationId);
        });

    });

    describe('getEnterpriseIdsForLocations function ->', () => {

        let locEntId;
        beforeEach(() => {
            locEntId = 'locEntId';
            (service as any).getEnterpriseIdForLocation = jasmine.createSpy().and.returnValue(Promise.resolve(locEntId));
        });

        it('should call getEnterpriseIdForLocation when loc.enterpriseId does not exist and return correctly', async () => {
            let storedLocId = 100;
            let storedEntId = 101;
            let locations = [
                { legacyId: 1, enterpriseId: 'entId' },
                { legacyId: 2 },
                { legacyId: storedLocId }
            ];
            (service as any).locationEntIds[storedLocId] = storedEntId;

            let results = await (service as any).getEnterpriseIdsForLocations(locations);

            expect((service as any).getEnterpriseIdForLocation).toHaveBeenCalledTimes(1);
            expect((service as any).getEnterpriseIdForLocation).toHaveBeenCalledWith(locations[1].legacyId);
            expect(results).toEqual([locations[0].enterpriseId, locEntId, storedEntId]);
            let locEntIds = (service as any).locationEntIds;
            let entLocIds = (service as any).entLocationIds;
            expect(locEntIds[locations[0].legacyId]).toBe(locations[0].enterpriseId);
            expect(locEntIds[locations[1].legacyId]).toBe(locEntId);
            expect(entLocIds[locations[0].enterpriseId]).toBe(locations[0].legacyId);
            expect(entLocIds[locEntId]).toBe(locations[1].legacyId);
        });

    });

    describe('getLegacyIdsForRxEnterprises function ->', () => {

        let practiceEnt, retVal;
        beforeEach(() => {
            practiceEnt = { id: 'practiceEntId' };
            retVal = 'returnValue';
            (service as any).practiceEnterprisePromise = Promise.resolve(practiceEnt);
            httpClient.get = jasmine.createSpy().and.returnValue({ toPromise: () => retVal });
        });

        it('should call httpClient.get with correct parameters for each input value', async () => {
            let storedLocId = 100;
            let storedEntId = 101;
            let rxEnts = [
                { enterpriseID: 'id1' },
                { enterpriseID: storedEntId }
            ];
            (service as any).entLocationIds[storedEntId] = storedLocId;

            let results = await (service as any).getLegacyIdsForRxEnterprises(rxEnts);

            expect(httpClient.get).toHaveBeenCalledTimes(1);
            expect(httpClient.get).toHaveBeenCalledWith(
                `${entApiUrl}/api/v1/enterprises/${rxEnts[0].enterpriseID}`,
                { headers: { 'enterpriseid': practiceEnt.id.toString() }}
            );
            expect(results.length).toBe(2);
            let expResultForStored = {
                id: storedEntId,
                legacy_LocationID: storedLocId
            };
            expect(results).toEqual([retVal, expResultForStored]);
            let locEntIds = (service as any).locationEntIds;
            let entLocIds = (service as any).entLocationIds;
            expect(locEntIds[retVal.legacy_LocationID]).toBe(rxEnts[0].enterpriseID);
            expect(entLocIds[rxEnts[0].enterpriseID]).toBe(retVal.legacy_LocationID);
        });

    });

});