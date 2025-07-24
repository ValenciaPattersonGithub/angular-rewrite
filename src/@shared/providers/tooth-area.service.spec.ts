import { TestBed } from '@angular/core/testing';
import { ToothAreaService } from './tooth-area.service';
import { ToothAreaData } from './tooth-area-data.model';
import { ToothAreaDataService } from './tooth-area-data.service';

describe('ToothAreaService', () => {

    let service: ToothAreaService;

    const mockStaticData: any = {
        TeethDefinitions: function () { return []; },
        CdtCodeGroups: function () { return []; },
    };

    const mockToothAreaDataService: any = {
        toothChange: jasmine.createSpy().and.callFake(function (x) { return x; }),
        areaChange: jasmine.createSpy().and.callFake(function (x) { return x; }),
        setValuesOnServiceTransaction: jasmine.createSpy().and.callFake(function (x) { return x; }),
    };

    const mockMultiLocationProposedServiceFactory: any = {
        GetSmartCode: function (x, y) { return { ServiceCodeId: 3 }; },
    };

    const mockReferenceDataServices: any = {
        get: function (x) { return []; },
        entityNames: {
            serviceCodes: [{ Description: 'code1', ServiceCodeId: '1', DiscountableServiceTypeId: '1' }]
        }
    };

    let serviceCodes = [
        { ServiceCodeId: 1, AffectedAreaId: 1, UseCodeForRangeOfTeeth: false }, //Mouth
        { ServiceCodeId: 2, AffectedAreaId: 5, UseCodeForRangeOfTeeth: false }, //Tooth
        { ServiceCodeId: 3, AffectedAreaId: 3, UseCodeForRangeOfTeeth: false }, //Root
        { ServiceCodeId: 4, AffectedAreaId: 4, UseCodeForRangeOfTeeth: false }, //Surface
        { ServiceCodeId: 5, AffectedAreaId: 5, UseCodeForRangeOfTeeth: true }, //RangeOfTeeth
        { ServiceCodeId: 6, AffectedAreaId: 5, UseCodeForRangeOfTeeth: true, CdtCodeName: 'test' }, //WithCdtCode        
        { ServiceCodeId: 7, AffectedAreaId: 3, UseCodeForRangeOfTeeth: false, SmartCode3Id: 3 }, //WithSmartCode        
    ]





    beforeEach(() => {
        TestBed.configureTestingModule({

            providers: [ToothAreaService,
                { provide: 'referenceDataService', useValue: mockReferenceDataServices },
                { provide: ToothAreaDataService, useValue: mockToothAreaDataService },
                { provide: 'StaticData', useValue: mockStaticData },
                { provide: 'MultiLocationProposedServiceFactory', useValue: mockMultiLocationProposedServiceFactory }
            ],
        });
        service = TestBed.get(ToothAreaService);
    });

    describe('toothChange', () => {
        beforeEach(() => {


            service.toothAreaData = new ToothAreaData();
            service.toothAreaData.areaSelection = ['A', 'B'];
            service.toothAreaData.toothSelection = '1';
            service.toothAreaData.availableAreas = ['A', 'B', 'C'];
            service.toothAreaData.availableTeeth = [];
            service.toothAreaData.serviceCode = { ServiceCodeId: 1, Code: 'testCode', Description: 'testDescription', AffectedAreaId: 1, UseCodeForRangeOfTeeth: false };
        });

        it('should set toothSelection to tooth passed in', async () => {
            let result = await service.toothChange('12');
            expect(service.toothAreaData.toothSelection).toBe('12')
        });

        it('should call toothAreaDataService.toothChange', () => {
            let result = service.toothChange('1');
            expect(mockToothAreaDataService.toothChange).toHaveBeenCalled();
        });

        it('should set intialAreas to AreaSelected on change if Root', async () => {
            service.toothAreaData.serviceCode.AffectedAreaId = 3;
            let result = await service.toothChange('1');
            expect(service.toothAreaData.areaSelection).toEqual(service.toothAreaData.availableAreas);
        });

        it('should NOT set intialAreas to AreaSelected on change if NOT root', async () => {
            service.toothAreaData.serviceCode.AffectedAreaId = 2;
            let result = await service.toothChange('1');
            expect(service.toothAreaData.areaSelection).toEqual(['A', 'B']);
        });
    });

    describe('areaChange', () => {
        beforeEach(() => {


            service.toothAreaData = new ToothAreaData();
            service.toothAreaData.areaSelection = ['A', 'B']
            service.toothAreaData.toothSelection = '1';
            service.toothAreaData.availableAreas = ['A', 'B', 'C'];
            service.toothAreaData.availableTeeth = [];
            service.toothAreaData.serviceCode = { ServiceCodeId: 1, Code: 'testCode', Description: 'testDescription', AffectedAreaId: 1, UseCodeForRangeOfTeeth: false };
        });


        it('should set toothSelection to tooth passed in', async () => {
            let result = await service.areaChange('A');
            expect(service.toothAreaData.areaSelection).toBe('A')
        });

        it('should call toothAreaDataService.toothChange', async () => {
            let result = await service.areaChange('1');
            expect(mockToothAreaDataService.areaChange).toHaveBeenCalled();
        });
    });

    describe('setValuesOnServiceTransaction', () => {
        beforeEach(() => {
        });

        //ServiceTransaction Code not matching toothAreaData Code
        it('should call data service setValuesOnServiceTransactions', () => {
            let result = service.setValuesOnServiceTransaction('test', 'data');

            expect(mockToothAreaDataService.setValuesOnServiceTransaction).toHaveBeenCalled();
        });



    });



});
