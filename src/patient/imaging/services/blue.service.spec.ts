import { HttpBackend, HttpHeaders, HttpResponse } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import * as moment from 'moment';
import { of } from 'rxjs';
import { MicroServiceApiService } from 'src/security/providers';
import { BlueImagingService } from './blue.service';
import { IndexedDbCacheService } from 'src/@shared/providers/indexed-db-cache.service';

describe('BlueImagingService ->', () => {

    let service: BlueImagingService;
    let tokenService, applicationService, practiceService, sessionService, soarConfig;
    let microServiceApiService: Partial<MicroServiceApiService>;
    let httpBackend: Partial<HttpBackend>;
    let sanitizer: Partial<DomSanitizer>;
    let indexedDbCacheService: Partial<IndexedDbCacheService>;

    const blueUrl = 'blueImagingApiUrl';

    beforeEach(() => {
        tokenService = {};
        applicationService = {};
        practiceService = {};
        sessionService = {};
        soarConfig = {};
        microServiceApiService = {
            getBlueImagingApiUrl: jasmine.createSpy().and.returnValue(blueUrl)
        };
        httpBackend = {};
        sanitizer = {};
        indexedDbCacheService = {
            getOrAdd: (id: string, callback: () => Promise<Blob | null>) => callback()
        };
        service = new BlueImagingService(
            tokenService, applicationService, practiceService, sessionService, soarConfig,
            microServiceApiService as any, httpBackend as any, sanitizer as any, indexedDbCacheService as any);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
        expect(microServiceApiService.getBlueImagingApiUrl).toHaveBeenCalled();
        expect((service as any).blueImagingUrl).toBe(blueUrl);
        expect((service as any).http).toBeTruthy();
    });

    describe('seeIfProviderIsReady function ->', () => {

        it('should return true when feature is enabled', async () => {
            (service as any).featurePromise = Promise.resolve(true);
            const result = await service.seeIfProviderIsReady();
            expect(result).toBe(true);
        });

        it('should throw an Error when feature is not enabled', async () => {
            (service as any).featurePromise = Promise.resolve(false);
            let errorThrown = false;
            try {
                await service.seeIfProviderIsReady();
            } catch (err) {
                errorThrown = true;
            }
            expect(errorThrown).toBe(true);
        });

    });

    describe('getPatientByPDCOPatientId function ->', () => {

        let handleResult, headerName, headerValue;
        beforeEach(() => {
            handleResult = 'toPromiseResult';
            httpBackend.handle = jasmine.createSpy().and.returnValue(of(new HttpResponse<string>({ body: handleResult })));

            headerName = 'testHeader';
            headerValue = 'testHeaderValue';
            (service as any).getHeaders = jasmine.createSpy().and.returnValue(new HttpHeaders().set(headerName, headerValue));
        });

        it('should return null if patientId is missing or empty', async () => {
            const result1 = await service.getPatientByPDCOPatientId(null, null);
            const result2 = await service.getPatientByPDCOPatientId('', '');

            expect(httpBackend.handle).not.toHaveBeenCalled();
            expect(result1).toBeNull();
            expect(result2).toBeNull();
        });

        it('should call http.get with correct url and return promise when patientId is not null', async () => {
            const patientId = 'patientId';
            const thirdPartyId = 'thirdPartyId';

            const result = await service.getPatientByPDCOPatientId(patientId, thirdPartyId);

            expect((service as any).getHeaders).toHaveBeenCalled();

            const calls = (httpBackend.handle as jasmine.Spy).calls;
            expect(calls.count()).toBe(1);

            const args = calls.first().args[0];
            expect(args.url).toBe(`${blueUrl}/api/imagingintegration/patientinfo?patId=${patientId}`);
            expect(args.headers.get(headerName)).toBe(headerValue);

            expect(result).toBe(handleResult);
        });

    });

    describe('getUrlForPreferences function ->', () => {

        let handleResult, headerName, headerValue, token, appId, practiceId, userContextSpy, userId, patientData;
        beforeEach(() => {
            handleResult = 'toPromiseResult';
            httpBackend.handle = jasmine.createSpy().and.returnValue(of(new HttpResponse<string>({ body: handleResult })));

            headerName = 'testHeader';
            headerValue = 'testHeaderValue';
            (service as any).getHeaders = jasmine.createSpy().and.returnValue(new HttpHeaders().set(headerName, headerValue));

            token = 'testToken';
            tokenService.getCachedToken = jasmine.createSpy().and.returnValue(token);

            appId = 'testAppId';
            applicationService.getApplicationId = jasmine.createSpy().and.returnValue(appId);

            practiceId = 'testPracticeId';
            practiceService.getCurrentPractice = jasmine.createSpy().and.returnValue({ id: practiceId });

            userId = 'testUserId';
            userContextSpy = jasmine.createSpy().and.returnValue({ Result: { User: { UserId: userId } } });
            sessionService.userContext = { get: userContextSpy };

            patientData = {};
        });

        it('should call http.get with correct parameters', async () => {
            const fusePatientId = 'patientId';

            await service.getUrlForPreferences();

            expect((service as any).getHeaders).toHaveBeenCalled();

            const calls = (httpBackend.handle as jasmine.Spy).calls;
            expect(calls.count()).toBe(1);

            const args = calls.first().args[0];
            expect(args.url).toBe(`${blueUrl}/api/imagingintegration/url/settings`);
            expect(args.headers.get(headerName)).toBe(headerValue);
            expect(args.responseType).toBe('text');
        });

        it('should call other service functions', async () => {
            const fusePatientId = 'patientId';

            await service.getUrlForPreferences();

            expect(tokenService.getCachedToken).toHaveBeenCalled();
            expect(applicationService.getApplicationId).toHaveBeenCalled();
            expect(practiceService.getCurrentPractice).toHaveBeenCalled();
            expect(userContextSpy).toHaveBeenCalled();
        });

        it('should return url with correct data', async () => {
            const result = await service.getUrlForPreferences();

            expect(result).toBe(`${handleResult}?accessToken=${token}&practiceId=${practiceId}&applicationId=${appId}&empId=${userId}`);
        });

    });

    describe('updatePatientLocation function ->', () => {

        let handleResult, headerName, headerValue, token, appId, practiceId, userContextSpy, userId, patientData;
        beforeEach(() => {
            handleResult = 'toPromiseResult';
            httpBackend.handle = jasmine.createSpy().and.returnValue(of(new HttpResponse<string>({ body: handleResult })));

            headerName = 'testHeader';
            headerValue = 'testHeaderValue';
            (service as any).getHeaders = jasmine.createSpy().and.returnValue(new HttpHeaders().set(headerName, headerValue));

            token = 'testToken';
            tokenService.getCachedToken = jasmine.createSpy().and.returnValue(token);

            appId = 'testAppId';
            applicationService.getApplicationId = jasmine.createSpy().and.returnValue(appId);

            practiceId = 'testPracticeId';
            practiceService.getCurrentPractice = jasmine.createSpy().and.returnValue({ id: practiceId });

            userId = 'testUserId';
            userContextSpy = jasmine.createSpy().and.returnValue({ Result: { User: { UserId: userId } } });
            sessionService.userContext = { get: userContextSpy };

            patientData = {};

            
        });

        it('should return null when patient does not exist in blue', async () => {

            const fusePatientId = 'patientId';
            
            service.getPatientByPDCOPatientId = jasmine.createSpy().and.returnValue(Promise.resolve({ Value: null }));            

            let response =  await service.updatePatientLocation(fusePatientId, 'locationId');

            expect(service.getPatientByPDCOPatientId).toHaveBeenCalled();
            expect(response).toBe(null);           
        });

        it('should call location update when patient exists in blue', async () => {

            const fusePatientId = 'patientId';
            
            spyOn(service, 'getPatientByPDCOPatientId').and.returnValue(Promise.resolve({ Value: "PatientExists" }));

            await service.updatePatientLocation(fusePatientId, 'locationId');            

            expect((service as any).getHeaders).toHaveBeenCalled();

            const calls = (httpBackend.handle as jasmine.Spy).calls;
            expect(calls.count()).toBe(1);

            const args = calls.first().args[0];
            expect(args.url).toBe(`${blueUrl}/api/Patient/Location?patId=patientId&patLocId=locationId`);
            expect(args.headers.get(headerName)).toBe(headerValue);
            expect(args.responseType).toBe('json');
        });
        
    });


    describe('getUrlForPatientByPatientId function ->', () => {

        let handleResult, headerName, headerValue, token, appId, practiceId, userContextSpy, userId, patientData;
        beforeEach(() => {
            handleResult = 'toPromiseResult';
            httpBackend.handle = jasmine.createSpy().and.returnValue(of(new HttpResponse<string>({ body: handleResult })));

            headerName = 'testHeader';
            headerValue = 'testHeaderValue';
            (service as any).getHeaders = jasmine.createSpy().and.returnValue(new HttpHeaders().set(headerName, headerValue));

            token = 'testToken';
            tokenService.getCachedToken = jasmine.createSpy().and.returnValue(token);

            appId = 'testAppId';
            applicationService.getApplicationId = jasmine.createSpy().and.returnValue(appId);

            practiceId = 'testPracticeId';
            practiceService.getCurrentPractice = jasmine.createSpy().and.returnValue({ id: practiceId });

            userId = 'testUserId';
            userContextSpy = jasmine.createSpy().and.returnValue({ Result: { User: { UserId: userId } } });
            sessionService.userContext = { get: userContextSpy };

            patientData = {};
        });

        it('should call http.get with correct parameters', async () => {
            const fusePatientId = 'patientId';

            await service.getUrlForPatientByPatientId(null, fusePatientId, patientData);

            expect((service as any).getHeaders).toHaveBeenCalled();

            const calls = (httpBackend.handle as jasmine.Spy).calls;
            expect(calls.count()).toBe(1);

            const args = calls.first().args[0];
            expect(args.url).toBe(`${blueUrl}/api/imagingintegration/url/patient?&patId=${fusePatientId}`);
            expect(args.headers.get(headerName)).toBe(headerValue);
            expect(args.responseType).toBe('text');
        });

        it('should call other service functions', async () => {
            const fusePatientId = 'patientId';

            await service.getUrlForPatientByPatientId(null, fusePatientId, patientData);

            expect(tokenService.getCachedToken).toHaveBeenCalled();
            expect(applicationService.getApplicationId).toHaveBeenCalled();
            expect(practiceService.getCurrentPractice).toHaveBeenCalled();
            expect(userContextSpy).toHaveBeenCalled();
        });

        it('should return url with correct data', async () => {
            const fusePatientId = 'patientId';
            patientData = {
                firstName: 'first',
                lastName: 'last',
                birthDate: '1984-05-10',
                gender: 'gender'
            };

            const result = await service.getUrlForPatientByPatientId(null, fusePatientId, patientData);

            // tslint:disable-next-line: max-line-length
            expect(result).toBe(`${handleResult}?accessToken=${token}&practiceId=${practiceId}&applicationId=${appId}&empId=${userId}&&patId=${fusePatientId}&patFirstName=${patientData.firstName}&patLastName=${patientData.lastName}&patBirthdate=${patientData.birthDate}&patGender=${patientData.gender}&patLocId=${patientData.primLocation}&patNorm=5`);
        });

        it('should return url with correct data when birthDate is null', async () => {
            const fusePatientId = 'patientId';
            patientData = {
                firstName: 'first',
                lastName: 'last',
                gender: 'gender'
            };

            const result = await service.getUrlForPatientByPatientId(null, fusePatientId, patientData);

            // tslint:disable-next-line: max-line-length
            expect(result).toBe(`${handleResult}?accessToken=${token}&practiceId=${practiceId}&applicationId=${appId}&empId=${userId}&&patId=${fusePatientId}&patFirstName=${patientData.firstName}&patLastName=${patientData.lastName}&patGender=${patientData.gender}&patLocId=${patientData.primLocation}&patNorm=5`);
        });

    });

    describe('getUrlForNewPatient function ->', () => {

        let patientData, handleResult, headerName, headerValue, token, appId, practiceId, userContextSpy, userId;
        beforeEach(() => {
            patientData = {
                patientId: 'testId',
                firstName: 'testFirstName',
                lastName: 'testLastName',
                birthDate: '1984-05-10',
                gender: 'gender'
            };

            handleResult = 'toPromiseResult';
            httpBackend.handle = jasmine.createSpy().and.returnValue(of(new HttpResponse<string>({ body: handleResult })));

            headerName = 'testHeader';
            headerValue = 'testHeaderValue';
            (service as any).getHeaders = jasmine.createSpy().and.returnValue(new HttpHeaders().set(headerName, headerValue));

            token = 'testToken';
            tokenService.getCachedToken = jasmine.createSpy().and.returnValue(token);

            appId = 'testAppId';
            applicationService.getApplicationId = jasmine.createSpy().and.returnValue(appId);

            practiceId = 'testPracticeId';
            practiceService.getCurrentPractice = jasmine.createSpy().and.returnValue({ id: practiceId });

            userId = 'testUserId';
            userContextSpy = jasmine.createSpy().and.returnValue({ Result: { User: { UserId: userId } } });
            sessionService.userContext = { get: userContextSpy };
        });

        it('should call http.get with correct parameters', async () => {
            await service.getUrlForNewPatient(patientData);

            expect((service as any).getHeaders).toHaveBeenCalled();

            const calls = (httpBackend.handle as jasmine.Spy).calls;
            expect(calls.count()).toBe(1);

            const args = calls.first().args[0];
            // tslint:disable-next-line: max-line-length
            expect(args.url).toBe(`${blueUrl}/api/imagingintegration/url/capture?&patientId=${patientData.patientId}&lastName=${encodeURIComponent(patientData.lastName)}&firstName=${encodeURIComponent(patientData.firstName)}&dateOfBirth=${patientData.birthDate}&otherId=${patientData.patientId}`, );
            expect(args.headers.get(headerName)).toBe(headerValue);
            expect(args.responseType).toBe('text');
        });

        it('should call other service functions', async () => {
            await service.getUrlForNewPatient(patientData);

            expect(tokenService.getCachedToken).toHaveBeenCalled();
            expect(applicationService.getApplicationId).toHaveBeenCalled();
            expect(practiceService.getCurrentPractice).toHaveBeenCalled();
            expect(userContextSpy).toHaveBeenCalled();
        });

        it('should return url with correct data', async () => {
            const result = await service.getUrlForNewPatient(patientData);

            // tslint:disable-next-line: max-line-length
            expect(result).toBe(`${handleResult}?accessToken=${token}&practiceId=${practiceId}&applicationId=${appId}&empId=${userId}&patId=${patientData.patientId}&patFirstName=${encodeURIComponent(patientData.firstName)}&patLastName=${encodeURIComponent(patientData.lastName)}&patBirthdate=${patientData.birthDate}&patGender=${patientData.gender}&patLocId=${patientData.primLocation}&patNorm=5&initTpName=Exam&initTpDate=${moment().format('YYYY-MM-DD')}`);
        });

        it('should return url with correct data when birthDate is null', async () => {
            patientData.birthDate = null;
            const result = await service.getUrlForNewPatient(patientData);

            // tslint:disable-next-line: max-line-length
            expect(result).toBe(`${handleResult}?accessToken=${token}&practiceId=${practiceId}&applicationId=${appId}&empId=${userId}&patId=${patientData.patientId}&patFirstName=${encodeURIComponent(patientData.firstName)}&patLastName=${encodeURIComponent(patientData.lastName)}&patGender=${patientData.gender}&patLocId=${patientData.primLocation}&patNorm=5&initTpName=Exam&initTpDate=${moment().format('YYYY-MM-DD')}`);
        });

    });

    describe('getAllByPatientId function ->', () => {

        let handleResult, headerName, headerValue;
        beforeEach(() => {
            handleResult = 'toPromiseResult';
            httpBackend.handle = jasmine.createSpy().and.returnValue(of(new HttpResponse<string>({ body: handleResult })));

            headerName = 'testHeader';
            headerValue = 'testHeaderValue';
            (service as any).getHeaders = jasmine.createSpy().and.returnValue(new HttpHeaders().set(headerName, headerValue));
        });

        it('should return null if externalPatientId is missing or empty', async () => {
            const result1 = await service.getAllByPatientId(null);
            const result2 = await service.getAllByPatientId('');

            expect(httpBackend.handle).not.toHaveBeenCalled();
            expect(result1).toBeNull();
            expect(result2).toBeNull();
        });

        it('should call http.get with correct url and return promise when externalPatientId is not null', async () => {
            const patientId = 'patientId';

            const result = await service.getAllByPatientId(patientId);

            expect((service as any).getHeaders).toHaveBeenCalled();

            const calls = (httpBackend.handle as jasmine.Spy).calls;
            expect(calls.count()).toBe(1);

            const args = calls.first().args[0];
            expect(args.url).toBe(`${blueUrl}/api/imagingintegration/study?patId=${patientId}`);
            expect(args.headers.get(headerName)).toBe(headerValue);

            expect(result).toBe(handleResult);
        });

    });

    describe('getImageBitmapByImageId function ->', () => {

        let handleResult, headerName, headerValue;
        beforeEach(() => {
            handleResult = new ArrayBuffer(0);
            httpBackend.handle = jasmine.createSpy().and.returnValue(of(new HttpResponse<ArrayBuffer>({ body: handleResult })));

            headerName = 'testHeader';
            headerValue = 'testHeaderValue';
            (service as any).getHeaders = jasmine.createSpy().and.returnValue(new HttpHeaders().set(headerName, headerValue));
        });

        it('should return null if imageId is missing or empty', async () => {
            const result1 = await service.getImageBitmapByImageId(null, '1234');
            const result2 = await service.getImageBitmapByImageId('', '1234');

            expect(httpBackend.handle).not.toHaveBeenCalled();
            expect(result1).toBeNull();
            expect(result2).toBeNull();
        });

        it('should call http.get with correct url and return promise when imageId is not null', async () => {
            const imageId = 'imageId';
            const patientId = 'patientId';

            const result = await service.getImageBitmapByImageId(imageId, patientId);

            expect((service as any).getHeaders).toHaveBeenCalled();

            const calls = (httpBackend.handle as jasmine.Spy).calls;
            expect(calls.count()).toBe(1);

            const args = calls.first().args[0];
            expect(args.url).toBe(`${blueUrl}/api/imagingintegration/bitmap2?patId=${patientId}&imageId=${imageId}`);
            expect(args.headers.get(headerName)).toBe(headerValue);
            expect(args.responseType).toBe('arraybuffer');

            expect(result).toBe(handleResult);
        });

    });

    describe('getImageThumbnailByImageId function ->', () => {

        let handleResult, headerName, headerValue;
        beforeEach(() => {
            handleResult = new ArrayBuffer(0);
            httpBackend.handle = jasmine.createSpy().and.returnValue(of(new HttpResponse<ArrayBuffer>({ body: handleResult })));

            headerName = 'testHeader';
            headerValue = 'testHeaderValue';
            (service as any).getHeaders = jasmine.createSpy().and.returnValue(new HttpHeaders().set(headerName, headerValue));
        });

        it('should return null if imageId is missing or empty', async () => {
            const result1 = await service.getImageThumbnailByImageId(null, '1234');
            const result2 = await service.getImageThumbnailByImageId('', '1234');

            expect(httpBackend.handle).not.toHaveBeenCalled();
            expect(result1).toBeNull();
            expect(result2).toBeNull();
        });

        it('should call http.get with correct url and return promise when imageId is not null', async () => {
            const imageId = 'imageId';
            const patientId = 'patientId';

            const result = await service.getImageThumbnailByImageId(imageId, patientId);

            expect((service as any).getHeaders).toHaveBeenCalled();

            const calls = (httpBackend.handle as jasmine.Spy).calls;
            expect(calls.count()).toBe(1);

            const args = calls.first().args[0];
            expect(args.url).toBe(`${blueUrl}/api/imagingintegration/bitmap/thumbnail2?patId=${patientId}&imageId=${imageId}`);
            expect(args.headers.get(headerName)).toBe(headerValue);
            expect(args.responseType).toBe('arraybuffer');

            expect(result).toBe(handleResult);
        });

    });

    describe('getUrlForExamByPatientIdExamId function ->', () => {

        let patientId, examId, patientData, handleResult, headerName, headerValue, token, appId, practiceId, userContextSpy, userId;
        beforeEach(() => {
            patientId = 'testPatientId';
            examId = 'testExamId';
            patientData = {
                patientId,
                firstName: 'testFirstName',
                lastName: 'testLastName',
                birthDate: '1984-05-10',
                gender: 'gender',
                primLocation: 'testLocation'
            };

            handleResult = 'toPromiseResult';
            httpBackend.handle = jasmine.createSpy().and.returnValue(of(new HttpResponse<string>({ body: handleResult })));

            headerName = 'testHeader';
            headerValue = 'testHeaderValue';
            (service as any).getHeaders = jasmine.createSpy().and.returnValue(new HttpHeaders().set(headerName, headerValue));

            token = 'testToken';
            tokenService.getCachedToken = jasmine.createSpy().and.returnValue(token);

            appId = 'testAppId';
            applicationService.getApplicationId = jasmine.createSpy().and.returnValue(appId);

            practiceId = 'testPracticeId';
            practiceService.getCurrentPractice = jasmine.createSpy().and.returnValue({ id: practiceId });

            userId = 'testUserId';
            userContextSpy = jasmine.createSpy().and.returnValue({ Result: { User: { UserId: userId } } });
            sessionService.userContext = { get: userContextSpy };
        });

        it('should call http.get with correct parameters', async () => {
            await service.getUrlForExamByPatientIdExamId(patientId, examId, patientData);

            expect((service as any).getHeaders).toHaveBeenCalled();

            const calls = (httpBackend.handle as jasmine.Spy).calls;
            expect(calls.count()).toBe(1);

            const args = calls.first().args[0];
            expect(args.url).toBe(`${blueUrl}/api/imagingintegration/url/study?studyId=${examId}`, );
            expect(args.headers.get(headerName)).toBe(headerValue);
            expect(args.responseType).toBe('text');
        });

        it('should call other service functions', async () => {
            await service.getUrlForExamByPatientIdExamId(patientId, examId, patientData);

            expect(tokenService.getCachedToken).toHaveBeenCalled();
            expect(applicationService.getApplicationId).toHaveBeenCalled();
            expect(practiceService.getCurrentPractice).toHaveBeenCalled();
            expect(userContextSpy).toHaveBeenCalled();
        });

        it('should return url with correct data', async () => {
            const result = await service.getUrlForExamByPatientIdExamId(patientId, examId, patientData);

            // tslint:disable-next-line: max-line-length
            expect(result).toBe(`${handleResult}?accessToken=${token}&practiceId=${practiceId}&applicationId=${appId}&empId=${userId}&patId=${patientId}&patFirstName=${encodeURIComponent(patientData.firstName)}&patLastName=${encodeURIComponent(patientData.lastName)}&patBirthdate=${moment(patientData.birthDate).format('YYYY-MM-DD')}&patGender=${patientData.gender}&patLocId=${patientData.primLocation}&patNorm=5&initTpId=${examId}`);
        });

        it('should return url with correct data when birthDate is null', async () => {
            patientData.birthDate = null;
            const result = await service.getUrlForExamByPatientIdExamId(patientId, examId, patientData);

            // tslint:disable-next-line: max-line-length
            expect(result).toBe(`${handleResult}?accessToken=${token}&practiceId=${practiceId}&applicationId=${appId}&empId=${userId}&patId=${patientId}&patFirstName=${encodeURIComponent(patientData.firstName)}&patLastName=${encodeURIComponent(patientData.lastName)}&patGender=${patientData.gender}&patLocId=${patientData.primLocation}&patNorm=5&initTpId=${examId}`);
        });

    });

    describe('getHeaders function ->', () => {

        let token, appId, practiceId, userContextSpy, userId;
        beforeEach(() => {
            token = 'testToken';
            tokenService.getCachedToken = jasmine.createSpy().and.returnValue(token);

            appId = 'testAppId';
            applicationService.getApplicationId = jasmine.createSpy().and.returnValue(appId);

            practiceId = 'testPracticeId';
            practiceService.getCurrentPractice = jasmine.createSpy().and.returnValue({ id: practiceId });

            userId = 'testUserId';
            userContextSpy = jasmine.createSpy().and.returnValue({ Result: { User: { UserId: userId } } });
            sessionService.userContext = { get: userContextSpy };
        });

        it('should call service functions', () => {
            (service as any).getHeaders();

            expect(tokenService.getCachedToken).toHaveBeenCalled();
            expect(applicationService.getApplicationId).toHaveBeenCalled();
            expect(practiceService.getCurrentPractice).toHaveBeenCalled();
            expect(userContextSpy).toHaveBeenCalled();
        });

        it('should return correct headers set', () => {
            const result = (service as any).getHeaders();

            expect(result.get('Authorization')).toBe(`Bearer ${token}`);
            expect(result.get('pat-practice-id')).toBe(practiceId);
            expect(result.get('application-id')).toBe(appId);
            expect(result.get('employee-id')).toBe(userId);
        });

    });

    describe('formatBirthDate function ->', () => {

        it('should return correct date with Z', () => {
            let date = '1988-10-26T00:00:00Z';
            var result = (service as any).formatBirthDate(date);
            expect(result).toBe('1988-10-26');
        });


        it('should return correct date without Z', () => {
            let date = '1988-10-26T00:00:00';
            var result = (service as any).formatBirthDate(date);
            expect(result).toBe('1988-10-26');
        });
    });

});
