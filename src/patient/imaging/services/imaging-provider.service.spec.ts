import { TestBed } from '@angular/core/testing';

import { ImagingProviderService } from './imaging-provider.service';
import { SidexisImagingService } from './sidexis.service';
import { ImagingProvider } from './imaging-enums';
import { BlueImagingService } from './blue.service';

describe('ImagingProviderService', () => {

    let service: ImagingProviderService;
    let mockApteryxService, mockApteryx2Service, mockPlatformSessionService;
    let mockSidexisService: Partial<SidexisImagingService>;
    let mockBlueService: Partial<BlueImagingService>;

    beforeEach(() => {
        mockApteryxService = {};
        mockApteryx2Service = {};
        mockSidexisService = {};
        mockPlatformSessionService = {};
        mockBlueService = {};

        service = new ImagingProviderService(
            mockApteryxService, mockApteryx2Service, mockPlatformSessionService, mockSidexisService as any, mockBlueService as any);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('resolve function ->', () => {

        beforeEach(() => {
            (service as any).pickImagingVendor = jasmine.createSpy().and.returnValue('test');
        })

        it('should call pickImagingVendor if provider is empty', () => {
            service.resolve();

            expect((service as any).pickImagingVendor).toHaveBeenCalled();
        });

        it('should return the correct service if provider is not specified', () => {
            (service as any).pickImagingVendor = () => ImagingProvider.Apteryx;
            const result = service.resolve();

            expect(result).toBe(mockApteryxService);
        });

    });


    describe('resolveSpecific function ->', () => {

        beforeEach(() => {
            (service as any).pickImagingVendor = jasmine.createSpy().and.returnValue('test');
        })

        //Copilot generated these from only the test names. Once I made the first 2, it suggested the other 4

        it('should return null if Blue and Blue is not enabled', () => {
            mockPlatformSessionService.getSessionStorage = jasmine.createSpy().and.returnValue([]);

            const result = service.resolveSpecific(ImagingProvider.Blue);
            expect(result).toBeNull();
        });

        it('should return Blue if Blue and Blue is enabled', () => {
            mockPlatformSessionService.getSessionStorage = jasmine.createSpy().and.returnValue([{ VendorId: 5 }]);

            const result = service.resolveSpecific(ImagingProvider.Blue);
            expect(result).toBe(mockBlueService);
        });

        it('should return null if Apteryx2 and Apteryx2 is not enabled', () => {
            mockPlatformSessionService.getSessionStorage = jasmine.createSpy().and.returnValue([]);

            const result = service.resolveSpecific(ImagingProvider.Apteryx2);
            expect(result).toBeNull();
        });

        it('should return Apteryx2 if Apteryx2 and Apteryx2 is enabled', () => {
            mockPlatformSessionService.getSessionStorage = jasmine.createSpy().and.returnValue([{ VendorId: 3 }]);

            const result = service.resolveSpecific(ImagingProvider.Apteryx2);
            expect(result).toBe(mockApteryx2Service);
        });

        it('should return null if Apteryx and Apteryx is not enabled', () => {
            mockPlatformSessionService.getSessionStorage = jasmine.createSpy().and.returnValue([]);

            const result = service.resolveSpecific(ImagingProvider.Apteryx);
            expect(result).toBeNull();
        });

        it('should return Apteryx if Apteryx and Apteryx is enabled', () => {
            mockPlatformSessionService.getSessionStorage = jasmine.createSpy().and.returnValue([{ VendorId: 1 }]);

            const result = service.resolveSpecific(ImagingProvider.Apteryx);
            expect(result).toBe(mockApteryxService);
        });

        
        

    });

    describe('resolveMultiple function ->', () => {

        beforeEach(() => {
            (service as any).pickMultipleImagingVendors = jasmine.createSpy().and.returnValue([]);
            mockApteryxService.seeIfProviderIsReady = jasmine.createSpy().and.returnValue({ catch: () => { } });
            mockApteryx2Service.seeIfProviderIsReady = jasmine.createSpy().and.returnValue({ catch: () => { } });
            mockSidexisService.seeIfProviderIsReady = jasmine.createSpy().and.returnValue({ catch: () => { } });
        });

        it('should call pickMultipleImagingVendors if providers is empty', () => {
            service.resolveMultiple();

            expect((service as any).pickMultipleImagingVendors).toHaveBeenCalled();
        });

        it('should not call pickMultipleImagingVendors if providers is not empty', () => {
            service.resolveMultiple(['testservice']);

            expect((service as any).pickMultipleImagingVendors).not.toHaveBeenCalled();
        });

        it('should return correct services when specified', () => {
            const result = service.resolveMultiple([ImagingProvider.Apteryx, ImagingProvider.Apteryx2]);

            expect(result).toEqual([
                { name: ImagingProvider.Apteryx, service: mockApteryxService },
                { name: ImagingProvider.Apteryx2, service: mockApteryx2Service }
            ]);
        });

        it('should return correct services when not specified', () => {
            (service as any).pickMultipleImagingVendors = () => [ImagingProvider.Sidexis];

            const result = service.resolveMultiple();

            expect(result).toEqual([
                { name: ImagingProvider.Sidexis, service: mockSidexisService }
            ]);
        });

        it('should call seeIfProviderIsReady for each service', () => {
            service.resolveMultiple([ImagingProvider.Apteryx, ImagingProvider.Apteryx2]);

            expect(mockApteryxService.seeIfProviderIsReady).toHaveBeenCalled();
            expect(mockApteryx2Service.seeIfProviderIsReady).toHaveBeenCalled();
            expect(mockSidexisService.seeIfProviderIsReady).not.toHaveBeenCalled();
        });

        it('should handle errors from seeIfProviderIsReady', () => {
            mockApteryxService.seeIfProviderIsReady = () => { return { catch: (cb) => cb() }; };

            service.resolveMultiple([ImagingProvider.Apteryx]);
        });

        it('should call activeServicesSource.next with services', () => {
            const sub = jasmine.createSpy();
            service.activeServices$.subscribe(sub);

            const result = service.resolveMultiple([ImagingProvider.Apteryx, ImagingProvider.Sidexis]);

            expect(sub).toHaveBeenCalledWith([]);
            expect(sub).toHaveBeenCalledWith(result);
            expect(sub).toHaveBeenCalledTimes(2);
        });

        it('should call activeServicesSource.next with services', () => {
            (service as any).pickMultipleImagingVendors = jasmine.createSpy().and.returnValue([]);
            const sub = jasmine.createSpy();
            service.activeServices$.subscribe(sub);
            sub.calls.reset();

            const result = service.resolveMultiple();

            expect(sub).not.toHaveBeenCalled();
        });

    });

    describe('pickImagingVendor function ->', () => {

        let sessionResult: any[];
        beforeEach(() => {
            sessionResult = [];
            mockPlatformSessionService.getSessionStorage = jasmine.createSpy().and.returnValue(sessionResult);
        });

        it('should call platformSessionService.getSessionStorage', () => {
            (service as any).pickImagingVendor();

            expect(mockPlatformSessionService.getSessionStorage).toHaveBeenCalledWith('practiceImagingVendors');
        });

        it('should return Apteryx2 if vendors contains VendorId 3', () => {
            sessionResult.push({ VendorId: 4 });
            sessionResult.push({ VendorId: 1 });
            sessionResult.push({ VendorId: 3 });

            const result = (service as any).pickImagingVendor();

            expect(result).toBe(ImagingProvider.Apteryx2);
        });

        it('should return Apteryx if vendors contains VendorId 1 but not VendorId 3', () => {
            sessionResult.push({ VendorId: 4 });
            sessionResult.push({ VendorId: 1 });

            const result = (service as any).pickImagingVendor();

            expect(result).toBe(ImagingProvider.Apteryx);
        });

        it('should return null if vendors contains neither Apteryx nor Apteryx2', () => {
            sessionResult.push({ VendorId: 4 });

            const result = (service as any).pickImagingVendor();

            expect(result).toBeNull();
        });

    });

    describe('pickMultipleImagingVendors function ->', () => {

        let sessionResult: any[];
        beforeEach(() => {
            sessionResult = [];
            mockPlatformSessionService.getSessionStorage = jasmine.createSpy().and.returnValue(sessionResult);
        });

        it('should call platformSessionService.getSessionStorage', () => {
            (service as any).pickMultipleImagingVendors();

            expect(mockPlatformSessionService.getSessionStorage).toHaveBeenCalledWith('practiceImagingVendors');
        });

        it('should return empty array if vendors does not include a valid VendorId', () => {
            sessionResult.push({ VendorId: 0 });

            const result = (service as any).pickMultipleImagingVendors();

            expect(result).toEqual([]);
        });

        it('should include Apteryx2 if vendors includes VendorId 3', () => {
            sessionResult.push({ VendorId: 3 });

            const result = (service as any).pickMultipleImagingVendors();

            expect(result).toEqual([ImagingProvider.Apteryx2]);
        });

        it('should include Apteryx if vendors includes VendorId 1', () => {
            sessionResult.push({ VendorId: 1 });

            const result = (service as any).pickMultipleImagingVendors();

            expect(result).toEqual([ImagingProvider.Apteryx]);
        });

        it('should include Sidexis if vendors includes VendorId 4', () => {
            sessionResult.push({ VendorId: 4 });

            const result = (service as any).pickMultipleImagingVendors();

            expect(result).toEqual([ImagingProvider.Sidexis]);
        });

        it('should include SidBlue if vendors includes VendorId 5', () => {
            sessionResult.push({ VendorId: 5 });

            const result = (service as any).pickMultipleImagingVendors();

            expect(result).toEqual([ImagingProvider.Blue]);
        });

        it('should include multiple results if multiple valid VendorIds are returned', () => {
            sessionResult.push({ VendorId: 3 });
            sessionResult.push({ VendorId: 1 });
            sessionResult.push({ VendorId: 4 });
            sessionResult.push({ VendorId: 5 });

            const result = (service as any).pickMultipleImagingVendors();

            expect(result).toEqual([ImagingProvider.Apteryx2, ImagingProvider.Sidexis, ImagingProvider.Blue]);
        });

    });

});
