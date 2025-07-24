import { SidexisImagingService } from './sidexis.service';
import { HttpClient } from '@angular/common/http';

describe('SidexisImagingService ->', () => {

    let service: SidexisImagingService;
    let dcaConfig;
    let httpClient: Partial<HttpClient>;

    beforeEach(() => {
        dcaConfig = { dcaUrl: 'dcaUrl', sidexisPluginName: 'sidexis plugin' };
        httpClient = {};

        service = new SidexisImagingService(dcaConfig, httpClient as any);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
        expect((service as any).dcaUrl).toBe(dcaConfig.dcaUrl);
    });

    describe('seeIfProviderIsReady function ->', () => {

        beforeEach(() => {
            httpClient.get = jasmine.createSpy().and.returnValue({ subscribe: () => { } });
        });

        it('should return value not make http call if this.readyPromise is not null', async () => {
            (service as any).readyPromise = 'readyPromise';

            let result = await service.seeIfProviderIsReady();

            expect(httpClient.get).not.toHaveBeenCalled();
            expect(result).toBe('readyPromise');
        });

        it('should return value and not make http call if this.integrationId is not null', async () => {
            (service as any).integrationId = 'integrationId';

            let result = await service.seeIfProviderIsReady();

            expect(httpClient.get).not.toHaveBeenCalled();
            expect(result).toBe('integrationId');
        });

        it('should call http.get with correct url and subscribe to results when readyPromise and integrationId are null', async () => {
            let result = service.seeIfProviderIsReady();

            expect(httpClient.get).toHaveBeenCalledWith(`${dcaConfig.dcaUrl}/getintegrations`);
            expect(result).not.toBeNull();
            expect((service as any).readyPromise).not.toBeNull();
        });

        describe('success handler ->', () => {

            let results;
            beforeEach(() => {
                results = [];
                httpClient.get = jasmine.createSpy().and.callFake((url : string) => {
                    return url.includes('getintegrations')
                        ? { subscribe: (success) => success(results) }
                        : { subscribe: (success) => success(true) };
                });
            });

            it('should call http again if found', async () => {
                results.push({ Name: dcaConfig.sidexisPluginName, Id: 'pluginId' });
                
                await service.seeIfProviderIsReady();

                expect(httpClient.get).toHaveBeenCalledWith(`${dcaConfig.dcaUrl}/isintegrationavailable?integrationId=pluginId`);
            });

            it('should not call http again if not found', async () => {
                results.push({ Name: 'randomName', Id: 'pluginId' });

                let errorThrown = false;
                try {
                    await service.seeIfProviderIsReady();
                } catch (error) {
                    expect(error).toBe('Sidexis DCA plugin unavailable');
                    errorThrown = true;
                }

                expect(errorThrown).toBe(true);
                expect(httpClient.get).not.toHaveBeenCalledWith(`${dcaConfig.dcaUrl}/isintegrationavailable?integrationId=pluginId`);
            });

            describe('connection success handler ->', () => {

                let result: boolean;
                beforeEach(() => {
                    let integrations = [{ Name: dcaConfig.sidexisPluginName, Id: 'pluginId' }];
                    httpClient.get = jasmine.createSpy().and.callFake((url : string) => {
                        return url.includes('getintegrations')
                            ? { subscribe: (success) => success(integrations) }
                            : { subscribe: (success) => success(result) };
                    });
                });
    
                it('should set integrationId if isintegrationavailable http call returns true', async () => {
                    result = true;

                    await service.seeIfProviderIsReady();
    
                    expect((service as any).integrationId).toBe('pluginId');
                    expect((service as any).readyPromise).toBeNull();
                });
    
                it('should not set integrationId if isintegrationavaible http call returns false', async () => {
                    result = false;
    
                    let errorThrown = false;
                    try {
                        await service.seeIfProviderIsReady();
                    } catch (error) {
                        expect(error).toBe('Sidexis DCA plugin connection failure or Sidexis not installed');
                        errorThrown = true;
                    }
    
                    expect(errorThrown).toBe(true);
                    expect((service as any).integrationId).not.toBe('pluginId');
                });
    
            });

            describe('connection failure handler ->', () => {

                beforeEach(() => {
                    let integrations = [{ Name: dcaConfig.sidexisPluginName, Id: 'pluginId' }];
                    httpClient.get = jasmine.createSpy().and.callFake((url : string) => {
                        return url.includes('getintegrations')
                            ? { subscribe: (success) => success(integrations) }
                            : { subscribe: (success, failure) => failure() };
                    });
                });
    
                it('should reject the promise with the correct message', async () => {    
                    let errorThrown = false;
                    try {
                        await service.seeIfProviderIsReady();
                    } catch (error) {
                        expect(error).toBe('DCA unavailable');
                        errorThrown = true;
                    }
    
                    expect(errorThrown).toBe(true);
                    expect((service as any).integrationId).not.toBe('pluginId');
                });
    
            });

        });

        describe('failure handler ->', () => {

            beforeEach(() => {
                httpClient.get = jasmine.createSpy().and.returnValue({
                    subscribe: (success, failure) => failure()
                });
            });

            it('should reject promise with correct message', async () => {
                let errorThrown = false;
                try {
                    await service.seeIfProviderIsReady();
                } catch (error) {
                    expect(error).toBe('DCA unavailable');
                    errorThrown = true;
                }

                expect(errorThrown).toBe(true);
                expect((service as any).readyPromise).toBeNull();
            });

        });

    });

    describe('getPatientByPDCOPatientId function ->', () => {

        let toPromiseSpy, toPromiseResult, integrationId;
        beforeEach(() => {
            toPromiseResult = 'toPromiseResult';
            toPromiseSpy = jasmine.createSpy().and.returnValue(toPromiseResult);
            httpClient.get = jasmine.createSpy().and.returnValue({
                toPromise: toPromiseSpy
            });
            (service as any).integrationId = integrationId;
        });

        it('should call http.get with correct url and subscribe to results', async () => {
            let patientId = 'patientId';
            let thirdPartyId = 'thirdPartyId';

            let result = await service.getPatientByPDCOPatientId(patientId, thirdPartyId);

            expect(httpClient.get).toHaveBeenCalledWith(`${dcaConfig.dcaUrl}/PatientInfo?integrationId=${integrationId}&primaryId=S-${thirdPartyId}`);
            expect(toPromiseSpy).toHaveBeenCalled();
            expect(result).toBe(toPromiseResult);
        });

        it('should return null if thirdPartyId is missing or empty', async () => {
            let result1 = await service.getPatientByPDCOPatientId(null, null);
            let result2 = await service.getPatientByPDCOPatientId(null, '');

            expect(httpClient.get).not.toHaveBeenCalled();
            expect(result1).toBeNull();
            expect(result2).toBeNull();
        });

    });

    describe('getUrlForPatientByPatientId function ->', () => {

        it('should return correct url', () => {
            let integrationId = 'integrationId';
            (service as any).integrationId = integrationId;
            let externalPatientId = 'extPatientId';
            let fusePatientId = 'fusePatientId';

            let result = service.getUrlForPatientByPatientId(externalPatientId, fusePatientId);

            expect(result).toBe(`${dcaConfig.dcaUrl}/ViewPatient?integrationId=${integrationId}&patientId=S-${fusePatientId}`);
        });

    });

    describe('getUrlForNewPatient function ->', () => {

        it('should return correct url', () => {
            let integrationId = 'integrationId';
            (service as any).integrationId = integrationId;
            let data = {
                patientId: 'id',
                firstName: 'first',
                lastName: 'last',
                gender: 'M',
                birthDate: 'dob'
            };

            let result = service.getUrlForNewPatient(data);

            expect(result).toBe(`${dcaConfig.dcaUrl}/CaptureImage?integrationId=${integrationId}&patientId=${data.patientId}&lastName=${encodeURIComponent(data.lastName)}&firstName=${encodeURIComponent(data.firstName)}&gender=${data.gender}&birthdate=${data.birthDate}&autoCapture=false&autoClose=false`);
        });

    });

    describe('getAllByPatientId function ->', () => {

        let toPromiseSpy, toPromiseResult, integrationId;
        beforeEach(() => {
            toPromiseResult = 'toPromiseResult';
            toPromiseSpy = jasmine.createSpy().and.returnValue(toPromiseResult);
            httpClient.get = jasmine.createSpy().and.returnValue({
                toPromise: toPromiseSpy
            });
            (service as any).integrationId = integrationId;
        });

        it('should call http.get with correct url and subscribe to results', async () => {
            let externalPatientId = 'patientId';

            let result = await service.getAllByPatientId(externalPatientId);

            expect(httpClient.get).toHaveBeenCalledWith(`${dcaConfig.dcaUrl}/Studies?integrationId=${integrationId}&patientId=${externalPatientId}`);
            expect(toPromiseSpy).toHaveBeenCalled();
            expect(result).toBe(toPromiseResult);
        });

    });

});
