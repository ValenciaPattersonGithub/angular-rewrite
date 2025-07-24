import { TestBed } from '@angular/core/testing';

import { ImagingMasterService } from './imaging-master.service';
import { ImagingProviderService } from './imaging-provider.service';
import { ImagingProvider, ImagingProviderStatus } from './imaging-enums';

declare let _: any;

describe('ImagingMasterService ->', () => {

    let service: ImagingMasterService;
    let mockProviderService: jasmine.SpyObj<ImagingProviderService>;

    beforeEach(() => {
        const providerServiceSpy = jasmine.createSpyObj('ImagingProviderService', ['resolveMultiple']);
        providerServiceSpy.activeServices$ = {
            subscribe: jasmine.createSpy()
        }

        mockProviderService = providerServiceSpy;

        TestBed.configureTestingModule({
            providers: [
                ImagingMasterService,
                { provide: ImagingProviderService, useValue: providerServiceSpy }
            ]
        });
        service = TestBed.inject(ImagingMasterService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('constructor ->', () => {
        it('should set initial values', () => {
            const statusObj = {};
            statusObj[ImagingProvider.Apteryx] = { status: ImagingProviderStatus.None };
            statusObj[ImagingProvider.Apteryx2] = { status: ImagingProviderStatus.None };
            statusObj[ImagingProvider.Sidexis] = { status: ImagingProviderStatus.None };
            statusObj[ImagingProvider.Blue] = { status: ImagingProviderStatus.None }
            expect((service as any).status).toEqual(statusObj);
        });

        it('should subscribe to activeServices$', () => {
            expect(mockProviderService.activeServices$.subscribe).toHaveBeenCalled();
        })

    });

    describe('initializeServices function ->', () => {

        it('should set statuses to NotAvailable', () => {
            (service as any).initializeServices();

            const statusObj = {};
            statusObj[ImagingProvider.Apteryx] = { status: ImagingProviderStatus.NotAvailable };
            statusObj[ImagingProvider.Apteryx2] = { status: ImagingProviderStatus.NotAvailable };
            statusObj[ImagingProvider.Sidexis] = { status: ImagingProviderStatus.NotAvailable };
            statusObj[ImagingProvider.Blue] = { status: ImagingProviderStatus.NotAvailable };
            expect((service as any).status).toEqual(statusObj);
        });

        it('should call resolveMultiple if services is empty', () => {
            (service as any).initializeServices();

            expect(mockProviderService.resolveMultiple).toHaveBeenCalled();
        });

        it('should set status to initializing and call seeIfProviderIsReady for supplied services', () => {
            const shouldCallSpy = jasmine.createSpy().and.returnValue({ then: () => { return { catch: () => { } } } });
            const shouldNotCallSpy = jasmine.createSpy();
            const services = [
                { name: ImagingProvider.Apteryx, service: { seeIfProviderIsReady: shouldCallSpy } },
                { name: 'not a real provider', service: { seeIfProviderIsReady: shouldNotCallSpy } }
            ];

            (service as any).initializeServices(services);

            expect((service as any).status[ImagingProvider.Apteryx].status).toEqual(ImagingProviderStatus.Initializing);
            expect(shouldCallSpy).toHaveBeenCalled();
            expect(shouldNotCallSpy).not.toHaveBeenCalled();
        });

        it('should set status to ready if provider call succeeds', () => {
            const spy = jasmine.createSpy().and.returnValue({ then: (cb) => { cb(); return { catch: () => { } } } });
            const services = [
                { name: ImagingProvider.Apteryx, service: { seeIfProviderIsReady: spy } }
            ];

            (service as any).initializeServices(services);

            expect((service as any).status[ImagingProvider.Apteryx].status).toEqual(ImagingProviderStatus.Ready);
        });

        it('should set status to Error if provider call fails', () => {
            const spy = jasmine.createSpy().and.returnValue({ then: () => { return { catch: (cb) => { cb(); } } } });
            const services = [
                { name: ImagingProvider.Apteryx, service: { seeIfProviderIsReady: spy } }
            ];

            (service as any).initializeServices(services);

            expect((service as any).status[ImagingProvider.Apteryx].status).toEqual(ImagingProviderStatus.Error);
            expect((service as any).status[ImagingProvider.Apteryx].message).toEqual('An error occurred initializing the imaging service');
        });

        it('should set status message if provider call fails with error', () => {
            const error = 'test error';
            const spy = jasmine.createSpy().and.returnValue({ then: () => { return { catch: (cb) => { cb(error); } } } });
            const services = [
                { name: ImagingProvider.Apteryx, service: { seeIfProviderIsReady: spy } }
            ];

            (service as any).initializeServices(services);

            expect((service as any).status[ImagingProvider.Apteryx].status).toEqual(ImagingProviderStatus.Error);
            expect((service as any).status[ImagingProvider.Apteryx].message).toEqual(error);
        });

    });

    describe('getServiceStatus function ->', () => {

        beforeEach(() => {
            (service as any).serviceInitializationPromises = [Promise.resolve()];
        })

        it('should return status object', async () => {
            const retVal = await service.getServiceStatus();

            expect(retVal).toBe((service as any).status);
        })

    });

    describe('getReadyServices function ->', () => {

        beforeEach(() => {
            (service as any).serviceInitializationPromises = [Promise.resolve()];
        })

        it('should return Ready service statuses', async () => {
            (service as any).status['test service'] = { status: ImagingProviderStatus.Ready };

            const retVal = await service.getReadyServices();

            expect(retVal).toEqual(_.pickBy((service as any).status, service => service.status === ImagingProviderStatus.Ready));
        })

    });

    describe('getPatientByFusePatientId function ->', () => {

        let retVal, mockProvider;
        beforeEach(() => {
            retVal = 'callServices return value';
            mockProvider = { getPatientByPDCOPatientId: jasmine.createSpy() };
            (service as any).callServices = jasmine.createSpy().and.callFake((p, ex) => { ex(mockProvider); return retVal; })
        });

        it('should call the callServices function', async () => {
            const providers = ['test1', 'test2'];
            const patientId = 'patientId';
            const thirdPartyId = 'thirdPartyId';

            const result = await service.getPatientByFusePatientId(patientId, thirdPartyId, providers);

            expect(result).toBe(retVal);
            expect((service as any).callServices).toHaveBeenCalledWith(providers, jasmine.any(Function));
            expect(mockProvider.getPatientByPDCOPatientId).toHaveBeenCalledWith(patientId, thirdPartyId);
        });

    });

    describe('getUrlForPatientByExternalPatientId function ->', () => {

        let retVal, mockProvider, providerName;
        beforeEach(() => {
            providerName = 'test1';
            retVal = {};
            retVal[providerName] = 'callServices return value';
            mockProvider = { getUrlForPatientByPatientId: jasmine.createSpy() };
            (service as any).callServices = jasmine.createSpy().and.callFake((p, ex) => { ex(mockProvider); return retVal; })
        });

        it('should call the callServices function', async () => {
            const provider = 'test1';
            const externalPatientId = 'extPatientId';
            const fusePatientId = 'fusePatientId';
            const patientData = 'patientData';

            const result = await service.getUrlForPatientByExternalPatientId(externalPatientId, fusePatientId, provider, patientData);

            expect(result).toBe(retVal[providerName]);
            expect((service as any).callServices).toHaveBeenCalledWith([provider], jasmine.any(Function));
            expect(mockProvider.getUrlForPatientByPatientId).toHaveBeenCalledWith(externalPatientId, fusePatientId, patientData);
        });

    });

    describe('getUrlForNewPatient function ->', () => {

        let retVal, mockProvider, providerName;
        beforeEach(() => {
            providerName = 'test1';
            retVal = {};
            retVal[providerName] = 'callServices return value';
            mockProvider = { getUrlForNewPatient: jasmine.createSpy() };
            (service as any).callServices = jasmine.createSpy().and.callFake((p, ex) => { ex(mockProvider); return retVal; })
        });

        it('should call the callServices function', async () => {
            const provider = 'test1';
            const patientData = 'patientData';

            const result = await service.getUrlForNewPatient(patientData, provider);

            expect(result).toBe(retVal[providerName]);
            expect((service as any).callServices).toHaveBeenCalledWith([provider], jasmine.any(Function));
            expect(mockProvider.getUrlForNewPatient).toHaveBeenCalledWith(patientData);
        });

    });

    describe('getUrlForExamByPatientIdExamId function ->', () => {

        let retVal, mockProvider, providerName;
        beforeEach(() => {
            providerName = 'test1';
            retVal = {};
            retVal[providerName] = 'callServices return value';
            mockProvider = { getUrlForExamByPatientIdExamId: jasmine.createSpy() };
            (service as any).callServices = jasmine.createSpy().and.callFake((p, ex) => { ex(mockProvider); return retVal; })
        });

        it('should call the callServices function', async () => {
            const provider = 'test1';
            const patientData = 'testPatientData';
            const patientId = 'testPatientId';
            const examId = 'testExamId'

            const result = await service.getUrlForExamByPatientIdExamId(patientId, provider, examId, patientData);

            expect(result).toBe(retVal[providerName]);
            expect((service as any).callServices).toHaveBeenCalledWith([provider], jasmine.any(Function));
            expect(mockProvider.getUrlForExamByPatientIdExamId).toHaveBeenCalledWith(patientId, examId, patientData);
        });

    });

    describe('callServices function ->', () => {

        let statusObj, executor;
        beforeEach(() => {
            statusObj = {
                service1: { status: ImagingProviderStatus.None },
                service2: { status: ImagingProviderStatus.None }
            };
            (service as any).status = statusObj;
            executor = jasmine.createSpy().and.returnValue({
                then: () => { return { catch: () => { } } }
            });
        });

        it('should not call executor for services that are not ready', async () => {
            const providers = ['service1'];

            const result = await (service as any).callServices(providers, executor);

            expect(executor).not.toHaveBeenCalled();
            expect(result).toEqual({});
        });

        it('should not call executor for services that are not in provider parameter list', async () => {
            const providers = ['service1'];
            statusObj.service2.status = ImagingProviderStatus.Ready;

            const result = await (service as any).callServices(providers, executor);

            expect(executor).not.toHaveBeenCalled();
            expect(result).toEqual({});
        });

        it('should call executor for all ready services in parameter list', async () => {
            const providers = ['service1', 'service2'];
            statusObj.service1.status = statusObj.service2.status = ImagingProviderStatus.Ready;

            const result = await (service as any).callServices(providers, executor);

            expect(executor).toHaveBeenCalledTimes(2);
        });

        it('should call executor for all ready services if providers parameter is empty', async () => {
            const providers = [];
            statusObj.service1.status = statusObj.service2.status = ImagingProviderStatus.Ready;

            const result = await (service as any).callServices(providers, executor);

            expect(executor).toHaveBeenCalledTimes(2);
        });

        it('should correctly wrap successful and failed results', async () => {
            const providers = [];
            statusObj.service1 = { status: ImagingProviderStatus.Ready, service: 'service1' };
            statusObj.service2 = { status: ImagingProviderStatus.Ready, service: 'service2' };
            const successRes = 'success';
            const errorRes = 'error';
            executor = (service) => {
                return new Promise((resolve, reject) => {
                    service == 'service1' ? resolve(successRes) : reject(errorRes);
                });
            }

            const result = await (service as any).callServices(providers, executor);

            expect(result).toEqual({
                service1: { success: true, result: successRes },
                service2: { success: false, error: errorRes }
            });
        });

    });

});
