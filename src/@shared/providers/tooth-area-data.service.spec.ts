import { TestBed } from '@angular/core/testing';
import { ToothAreaDataService } from './tooth-area-data.service';
import { ToothAreaData } from './tooth-area-data.model';

describe('ToothAreaDataService', () => {

    let service: ToothAreaDataService;

    const mockStaticData: any = {
        TeethDefinitions: function () { return []; },
        CdtCodeGroups: function () { return []; },
    };

    const mockReferenceDataServices: any = {
        getData: function (x) { return Promise.resolve([]); },
        entityNames: {
            serviceCodes: 'serviceCodes'
        }
    };

    const mockMultiLocationProposedServiceFactory: any = {
        GetSmartCode: function (x, y) { return Promise.resolve({ ServiceCodeId: 3 }); },
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

            providers: [ToothAreaDataService,
                { provide: 'referenceDataService', useValue: mockReferenceDataServices },
                { provide: 'StaticData', useValue: mockStaticData },
                { provide: 'MultiLocationProposedServiceFactory', useValue: mockMultiLocationProposedServiceFactory }
            ],
        });
        service = TestBed.get(ToothAreaDataService);
    });

    describe('setupDataForRangeOfTeeth', () => {
        beforeEach(() => {
            service.teethDefinitions = { Teeth: [{ ToothId: null }, { ToothId: 1 }, { ToothId: 52 }, { ToothId: 53 }] }
        });

        it('should call setMapTooth when teethDefinitions and ToothId', () => {
            service.setMapTooth = jasmine.createSpy().and.returnValue({});
            let result = service.setupDataForRangeOfTeeth();
            expect(service.setMapTooth).toHaveBeenCalled();
        });

        it('should return a list of teeth when teethDefinitions', () => {
            let result = service.setupDataForRangeOfTeeth();
            expect(result).toEqual([{ ToothId: 1, visible: true, selected: false, positionAlreadyTaken: false },
            { ToothId: 52, visible: true, selected: false, positionAlreadyTaken: false, toothIdOfOtherDentitionInSamePosition: 29 }])
        });
    });

    describe('setMapTooth', () => {
        beforeEach(() => {
            service.teethDefinitions = { Teeth: [{ ToothId: null }, { ToothId: 1 }, { ToothId: 52 }, { ToothId: 53 }] }
        });

        it('should call setMapTooth when teethDefinitions and ToothId', () => {
            let tooth = { ToothId: 13 };
            let result = service.setMapTooth(tooth);
            expect(result).toEqual({ ToothId: 13, toothIdOfOtherDentitionInSamePosition: 42 });
        });
    });

    describe('loadToothAreaDataValuesForService', () => {
        beforeEach(() => {
            service.teethDefinitions = {
                Teeth: [{ ToothId: 1, USNumber: '1', RootAbbreviations: ["DB", "P", "MB"], SummarySurfaceAbbreviations: ["M", "B", "O", "L", "B5", "L5", "D"] },
                { ToothId: 52 },
                { ToothId: 53 }]
            }
        });

        it('should set toothAreaData for Mouth code', () => {
            let serviceTransaction = { ServiceCodeId: 1, Tooth: '', Roots: '', Surface: '' };
            service.serviceCodes = serviceCodes;
            let result = service.loadToothAreaDataValuesForService(serviceTransaction);
            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = []
            toothAreaData.toothSelection = '';
            toothAreaData.availableAreas = []
            toothAreaData.availableTeeth = [];
            toothAreaData.serviceCode = { ServiceCodeId: 1, AffectedAreaId: 1, UseCodeForRangeOfTeeth: false };
            toothAreaData.originalServiceCode = { ServiceCodeId: 1, AffectedAreaId: 1, UseCodeForRangeOfTeeth: false };

            expect(result).toEqual({
                ServiceCodeId: 1, Tooth: '', Roots: '', Surface: '',
                $toothAreaData: toothAreaData
            });
        });

        it('should set toothAreaData for Tooth code', () => {
            let serviceTransaction = { ServiceCodeId: 2, Tooth: '1', Roots: '', Surface: '' };
            service.serviceCodes = serviceCodes;
            let result = service.loadToothAreaDataValuesForService(serviceTransaction);
            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = []
            toothAreaData.toothSelection = '1';
            toothAreaData.availableAreas = []
            toothAreaData.availableTeeth = service.teethDefinitions.Teeth;
            toothAreaData.serviceCode = { ServiceCodeId: 2, AffectedAreaId: 5, UseCodeForRangeOfTeeth: false };
            toothAreaData.originalServiceCode = { ServiceCodeId: 2, AffectedAreaId: 5, UseCodeForRangeOfTeeth: false };

            expect(result).toEqual({
                ServiceCodeId: 2, Tooth: '1', Roots: '', Surface: '',
                $toothAreaData: toothAreaData
            });
        });

        it('should set toothAreaData for Root code', () => {
            let serviceTransaction = { ServiceCodeId: 3, Tooth: '1', Roots: 'DB,P,MB', Surface: 'Test' };
            service.serviceCodes = serviceCodes;
            let result = service.loadToothAreaDataValuesForService(serviceTransaction);
            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = ['DB', 'P', 'MB']
            toothAreaData.toothSelection = '1';
            toothAreaData.availableAreas = ['DB', 'P', 'MB']
            toothAreaData.availableTeeth = service.teethDefinitions.Teeth;
            toothAreaData.serviceCode = { ServiceCodeId: 3, AffectedAreaId: 3, UseCodeForRangeOfTeeth: false };
            toothAreaData.originalServiceCode = { ServiceCodeId: 3, AffectedAreaId: 3, UseCodeForRangeOfTeeth: false };

            expect(result).toEqual({
                ServiceCodeId: 3, Tooth: '1', Roots: 'DB,P,MB', Surface: '',
                $toothAreaData: toothAreaData
            });
        });

        it('should set toothAreaData for Surface code', () => {
            let serviceTransaction = { ServiceCodeId: 4, Tooth: '1', Roots: 'Test', Surface: 'M,B,O' };
            service.serviceCodes = serviceCodes;
            let result = service.loadToothAreaDataValuesForService(serviceTransaction);
            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = ['M', 'B', 'O']
            toothAreaData.toothSelection = '1';
            toothAreaData.availableAreas = ["M", "B", "O", "L", "B5", "L5", "D"]
            toothAreaData.availableTeeth = service.teethDefinitions.Teeth;
            toothAreaData.serviceCode = { ServiceCodeId: 4, AffectedAreaId: 4, UseCodeForRangeOfTeeth: false };
            toothAreaData.originalServiceCode = { ServiceCodeId: 4, AffectedAreaId: 4, UseCodeForRangeOfTeeth: false };

            expect(result).toEqual({
                ServiceCodeId: 4, Tooth: '1', Roots: '', Surface: 'M,B,O',
                $toothAreaData: toothAreaData
            });
        });

        it('should negate tooth selection if code was range of teeth and is not anymore', () => {
            service.surfaceAbbreviations = ['test'];
            let serviceTransaction = { ServiceCodeId: 4, Tooth: '1-7,9', Roots: 'Test', Surface: 'M,B,O' };
            service.serviceCodes = serviceCodes;
            let result = service.loadToothAreaDataValuesForService(serviceTransaction);
            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = []
            toothAreaData.toothSelection = '0';
            toothAreaData.availableAreas = ['test']
            toothAreaData.availableTeeth = service.teethDefinitions.Teeth;
            toothAreaData.serviceCode = { ServiceCodeId: 4, AffectedAreaId: 4, UseCodeForRangeOfTeeth: false };
            toothAreaData.originalServiceCode = { ServiceCodeId: 4, AffectedAreaId: 4, UseCodeForRangeOfTeeth: false };

            expect(result).toEqual({
                ServiceCodeId: 4, Tooth: '0', Roots: '', Surface: '',
                $toothAreaData: toothAreaData
            });
        });

        it('should set toothAreaData for RangeOfTeeth code', () => {
            let serviceTransaction = { ServiceCodeId: 5, Tooth: '1', Roots: 'Test', Surface: 'M,B,O' };
            service.serviceCodes = serviceCodes;
            let result = service.loadToothAreaDataValuesForService(serviceTransaction);
            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = []
            toothAreaData.toothSelection = '1';
            toothAreaData.availableAreas = []
            toothAreaData.availableTeeth = service.teethDefinitions.Teeth;
            toothAreaData.serviceCode = { ServiceCodeId: 5, AffectedAreaId: 5, UseCodeForRangeOfTeeth: true };
            toothAreaData.originalServiceCode = { ServiceCodeId: 5, AffectedAreaId: 5, UseCodeForRangeOfTeeth: true };

            expect(result).toEqual({
                ServiceCodeId: 5, Tooth: '1', Roots: '', Surface: '',
                $toothAreaData: toothAreaData
            });
        });
    });

    describe('getTeethForCurrentServiceCode', () => {
        beforeEach(() => {
            service.serviceCodes = serviceCodes;
            service.teethDefinitions = {
                Teeth: [{ ToothId: 1, USNumber: '1', RootAbbreviations: ["DB", "P", "MB"], SummarySurfaceAbbreviations: ["M", "B", "O", "L", "B5", "L5", "D"] },
                { ToothId: 52 },
                { ToothId: 53 }]
            }
        });

        //No CdtCode
        it('should set all available teeth when service code has no cdt code', () => {
            service.cdtCodeGroups = [{ CdtCode: 'test', GroupId: 1, AllowedTeeth: ['1', '2', '3'] }]
            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = []
            toothAreaData.toothSelection = '0';
            toothAreaData.availableAreas = [];
            toothAreaData.availableTeeth = [];
            toothAreaData.serviceCode = { ServiceCodeId: 1, AffectedAreaId: 1, UseCodeForRangeOfTeeth: false };
            toothAreaData.originalServiceCode = { ServiceCodeId: 1, AffectedAreaId: 1, UseCodeForRangeOfTeeth: false };


            let expectedToothAreaSelection = new ToothAreaData();
            expectedToothAreaSelection.areaSelection = []
            expectedToothAreaSelection.toothSelection = '0';
            expectedToothAreaSelection.availableAreas = [];
            expectedToothAreaSelection.availableTeeth = service.teethDefinitions.Teeth;
            expectedToothAreaSelection.serviceCode = { ServiceCodeId: 1, AffectedAreaId: 1, UseCodeForRangeOfTeeth: false };
            expectedToothAreaSelection.originalServiceCode = { ServiceCodeId: 1, AffectedAreaId: 1, UseCodeForRangeOfTeeth: false };

            let result = service.getTeethForCurrentServiceCode(toothAreaData);

            expect(result).toEqual(expectedToothAreaSelection);
        });



        //CdtCode, but not from any group
        it('should set all available teeth when service code has cdt code but is not part of a group', () => {
            service.cdtCodeGroups = [{ CdtCode: 'notHere', GroupId: 1, AllowedTeeth: ['1', '2', '3'] }]
            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = []
            toothAreaData.toothSelection = '0';
            toothAreaData.availableAreas = [];
            toothAreaData.availableTeeth = [];
            toothAreaData.serviceCode = { ServiceCodeId: 6, AffectedAreaId: 5, UseCodeForRangeOfTeeth: true, CdtCodeName: 'test' };
            toothAreaData.originalServiceCode = { ServiceCodeId: 6, AffectedAreaId: 5, UseCodeForRangeOfTeeth: true, CdtCodeName: 'test' };


            let expectedToothAreaSelection = new ToothAreaData();
            expectedToothAreaSelection.areaSelection = []
            expectedToothAreaSelection.toothSelection = '0';
            expectedToothAreaSelection.availableAreas = [];
            expectedToothAreaSelection.availableTeeth = service.teethDefinitions.Teeth;
            expectedToothAreaSelection.serviceCode = { ServiceCodeId: 6, AffectedAreaId: 5, UseCodeForRangeOfTeeth: true, CdtCodeName: 'test' };
            expectedToothAreaSelection.originalServiceCode = { ServiceCodeId: 6, AffectedAreaId: 5, UseCodeForRangeOfTeeth: true, CdtCodeName: 'test' };

            let result = service.getTeethForCurrentServiceCode(toothAreaData);

            expect(result).toEqual(expectedToothAreaSelection);
        });




        //CdtCode, that specifies 'All'
        it('should set all available teeth when service code has cdt code and it specifies all teeth', () => {
            service.cdtCodeGroups = [{ CdtCode: 'test', GroupId: 1, AllowedTeeth: ['All'] }]
            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = []
            toothAreaData.toothSelection = '0';
            toothAreaData.availableAreas = [];
            toothAreaData.availableTeeth = [];
            toothAreaData.serviceCode = { ServiceCodeId: 6, AffectedAreaId: 5, UseCodeForRangeOfTeeth: true, CdtCodeName: 'test' };
            toothAreaData.originalServiceCode = { ServiceCodeId: 6, AffectedAreaId: 5, UseCodeForRangeOfTeeth: true, CdtCodeName: 'test' };


            let expectedToothAreaSelection = new ToothAreaData();
            expectedToothAreaSelection.areaSelection = []
            expectedToothAreaSelection.toothSelection = '0';
            expectedToothAreaSelection.availableAreas = [];
            expectedToothAreaSelection.availableTeeth = service.teethDefinitions.Teeth;
            expectedToothAreaSelection.serviceCode = { ServiceCodeId: 6, AffectedAreaId: 5, UseCodeForRangeOfTeeth: true, CdtCodeName: 'test' };
            expectedToothAreaSelection.originalServiceCode = { ServiceCodeId: 6, AffectedAreaId: 5, UseCodeForRangeOfTeeth: true, CdtCodeName: 'test' };

            let result = service.getTeethForCurrentServiceCode(toothAreaData);

            expect(result).toEqual(expectedToothAreaSelection);
        });



        //CdtCode, that specifies only certain teeth
        it('should set all available teeth when service code has cdt code and it specifies only certain teeth', () => {
            service.cdtCodeGroups = [{ CdtCode: 'test', GroupId: 1, AllowedTeeth: ['1', '2', '3'] }]
            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = []
            toothAreaData.toothSelection = '0';
            toothAreaData.availableAreas = [];
            toothAreaData.availableTeeth = [];
            toothAreaData.serviceCode = { ServiceCodeId: 6, AffectedAreaId: 5, UseCodeForRangeOfTeeth: true, CdtCodeName: 'test' };
            toothAreaData.originalServiceCode = { ServiceCodeId: 6, AffectedAreaId: 5, UseCodeForRangeOfTeeth: true, CdtCodeName: 'test' };


            let expectedToothAreaSelection = new ToothAreaData();
            expectedToothAreaSelection.areaSelection = []
            expectedToothAreaSelection.toothSelection = '0';
            expectedToothAreaSelection.availableAreas = [];
            expectedToothAreaSelection.availableTeeth = [{ ToothId: 1, USNumber: '1', RootAbbreviations: ["DB", "P", "MB"], SummarySurfaceAbbreviations: ["M", "B", "O", "L", "B5", "L5", "D"] }];
            expectedToothAreaSelection.serviceCode = { ServiceCodeId: 6, AffectedAreaId: 5, UseCodeForRangeOfTeeth: true, CdtCodeName: 'test' };
            expectedToothAreaSelection.originalServiceCode = { ServiceCodeId: 6, AffectedAreaId: 5, UseCodeForRangeOfTeeth: true, CdtCodeName: 'test' };

            let result = service.getTeethForCurrentServiceCode(toothAreaData);

            expect(result).toEqual(expectedToothAreaSelection);
        });




    });

    describe('getApplicableTeeth', () => {
        beforeEach(() => {
            service.serviceCodes = serviceCodes;
            service.teethDefinitions = {
                Teeth: [{ ToothId: 1, USNumber: '1', RootAbbreviations: ["DB", "P", "MB"], SummarySurfaceAbbreviations: ["M", "B", "O", "L", "B5", "L5", "D"] },
                { ToothId: 52 },
                { ToothId: 53 }]
            }
        });

        it('should set all available teeth when cdt code specifies all teeth', () => {
            service.cdtCodeGroups = [{ CdtCode: 'test', GroupId: 1, AllowedTeeth: ['All'] }]
            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = []
            toothAreaData.toothSelection = '0';
            toothAreaData.availableAreas = [];
            toothAreaData.availableTeeth = [];
            toothAreaData.serviceCode = { ServiceCodeId: 6, AffectedAreaId: 5, UseCodeForRangeOfTeeth: true, CdtCodeName: 'test' };
            toothAreaData.originalServiceCode = { ServiceCodeId: 6, AffectedAreaId: 5, UseCodeForRangeOfTeeth: true, CdtCodeName: 'test' };


            let expectedToothAreaSelection = new ToothAreaData();
            expectedToothAreaSelection.areaSelection = []
            expectedToothAreaSelection.toothSelection = '0';
            expectedToothAreaSelection.availableAreas = [];
            expectedToothAreaSelection.availableTeeth = service.teethDefinitions.Teeth;
            expectedToothAreaSelection.serviceCode = { ServiceCodeId: 6, AffectedAreaId: 5, UseCodeForRangeOfTeeth: true, CdtCodeName: 'test' };
            expectedToothAreaSelection.originalServiceCode = { ServiceCodeId: 6, AffectedAreaId: 5, UseCodeForRangeOfTeeth: true, CdtCodeName: 'test' };

            let result = service.getApplicableTeeth(toothAreaData, 1);

            expect(result).toEqual(expectedToothAreaSelection);
        });

        it('should set all available teeth when cdt code specifies only certain teeth', () => {
            service.cdtCodeGroups = [{ CdtCode: 'test', GroupId: 1, AllowedTeeth: ['1', '2', '3'] }]
            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = []
            toothAreaData.toothSelection = '0';
            toothAreaData.availableAreas = [];
            toothAreaData.availableTeeth = [];
            toothAreaData.serviceCode = { ServiceCodeId: 6, AffectedAreaId: 5, UseCodeForRangeOfTeeth: true, CdtCodeName: 'test' };
            toothAreaData.originalServiceCode = { ServiceCodeId: 6, AffectedAreaId: 5, UseCodeForRangeOfTeeth: true, CdtCodeName: 'test' };


            let expectedToothAreaSelection = new ToothAreaData();
            expectedToothAreaSelection.areaSelection = []
            expectedToothAreaSelection.toothSelection = '0';
            expectedToothAreaSelection.availableAreas = [];
            expectedToothAreaSelection.availableTeeth = [{ ToothId: 1, USNumber: '1', RootAbbreviations: ["DB", "P", "MB"], SummarySurfaceAbbreviations: ["M", "B", "O", "L", "B5", "L5", "D"] }];
            expectedToothAreaSelection.serviceCode = { ServiceCodeId: 6, AffectedAreaId: 5, UseCodeForRangeOfTeeth: true, CdtCodeName: 'test' };
            expectedToothAreaSelection.originalServiceCode = { ServiceCodeId: 6, AffectedAreaId: 5, UseCodeForRangeOfTeeth: true, CdtCodeName: 'test' };

            let result = service.getApplicableTeeth(toothAreaData, 1);

            expect(result).toEqual(expectedToothAreaSelection);
        });




    });

    describe('toothChange', () => {
        beforeEach(() => {
            service.serviceCodes = serviceCodes;
            service.teethDefinitions = {
                Teeth: [{ ToothId: 1, USNumber: '1', RootAbbreviations: ["DB", "P", "MB"], SummarySurfaceAbbreviations: ["M", "B", "O", "L", "B5", "L5", "D"] },
                { ToothId: 52 },
                { ToothId: 53 }]
            }
            service.rootAbbreviations = ['rootAbbr'];
            service.surfaceAbbreviations = ['surfaceAbbr'];

            service.loadNextSurfaceSmartCode = jasmine.createSpy().and.callFake(function (param) {
                return param;
            });
            service.loadNextRootSmartCode = jasmine.createSpy().and.callFake(function (param) {
                return param;
            });

            service.settleAreaSelection = jasmine.createSpy().and.callFake(function (param) {
                return param;
            });

        });


        //Tooth, root
        it('should set all roots for tooth as availableAreas when tooth is selected', async () => {
            service.cdtCodeGroups = [{ CdtCode: 'test', GroupId: 1, AllowedTeeth: ['All'] }]
            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = []
            toothAreaData.toothSelection = '1';
            toothAreaData.availableAreas = [];
            toothAreaData.availableTeeth = [];
            toothAreaData.serviceCode = { ServiceCodeId: 3, AffectedAreaId: 3, UseCodeForRangeOfTeeth: false };
            toothAreaData.originalServiceCode = { ServiceCodeId: 3, AffectedAreaId: 3, UseCodeForRangeOfTeeth: false };

            let expectedToothAreaSelection = new ToothAreaData();
            expectedToothAreaSelection.areaSelection = []
            expectedToothAreaSelection.toothSelection = '1';
            expectedToothAreaSelection.availableAreas = ["DB", "P", "MB"];
            expectedToothAreaSelection.availableTeeth = [];
            expectedToothAreaSelection.serviceCode = { ServiceCodeId: 3, AffectedAreaId: 3, UseCodeForRangeOfTeeth: false };
            expectedToothAreaSelection.originalServiceCode = { ServiceCodeId: 3, AffectedAreaId: 3, UseCodeForRangeOfTeeth: false };

            const result = await service.toothChange(toothAreaData)
            expect(result).toEqual(expectedToothAreaSelection);
            expect(service.settleAreaSelection).toHaveBeenCalled();
            expect(service.loadNextRootSmartCode).toHaveBeenCalled();
            expect(service.loadNextSurfaceSmartCode).not.toHaveBeenCalled();
        });


        //Tooth, surface
        it('should set all surface for tooth as availableAreas when tooth is selected', async () => {
            service.cdtCodeGroups = [{ CdtCode: 'test', GroupId: 1, AllowedTeeth: ['All'] }];
            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = []
            toothAreaData.toothSelection = '1';
            toothAreaData.availableAreas = [];
            toothAreaData.availableTeeth = [];
            toothAreaData.serviceCode = { ServiceCodeId: 4, AffectedAreaId: 4, UseCodeForRangeOfTeeth: false };
            toothAreaData.originalServiceCode = { ServiceCodeId: 4, AffectedAreaId: 4, UseCodeForRangeOfTeeth: false };

            let expectedToothAreaSelection = new ToothAreaData();
            expectedToothAreaSelection.areaSelection = []
            expectedToothAreaSelection.toothSelection = '1';
            expectedToothAreaSelection.availableAreas = ["M", "B", "O", "L", "B5", "L5", "D"];
            expectedToothAreaSelection.availableTeeth = [];
            expectedToothAreaSelection.serviceCode = { ServiceCodeId: 4, AffectedAreaId: 4, UseCodeForRangeOfTeeth: false };
            expectedToothAreaSelection.originalServiceCode = { ServiceCodeId: 4, AffectedAreaId: 4, UseCodeForRangeOfTeeth: false };

            const result = await service.toothChange(toothAreaData)
            expect(result).toEqual(expectedToothAreaSelection);
            expect(service.settleAreaSelection).toHaveBeenCalled();
            expect(service.loadNextSurfaceSmartCode).toHaveBeenCalled();
            expect(service.loadNextRootSmartCode).not.toHaveBeenCalled();
        });


        //Tooth, neither root, nor surface
        it('should set all surface for tooth as availableAreas when tooth is selected', async () => {
            service.cdtCodeGroups = [{ CdtCode: 'test', GroupId: 1, AllowedTeeth: ['All'] }];
            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = []
            toothAreaData.toothSelection = '1';
            toothAreaData.availableAreas = [];
            toothAreaData.availableTeeth = [];
            toothAreaData.serviceCode = { ServiceCodeId: 1, AffectedAreaId: 1, UseCodeForRangeOfTeeth: false };
            toothAreaData.originalServiceCode = { ServiceCodeId: 1, AffectedAreaId: 1, UseCodeForRangeOfTeeth: false };

            let expectedToothAreaSelection = new ToothAreaData();
            expectedToothAreaSelection.areaSelection = []
            expectedToothAreaSelection.toothSelection = '1';
            expectedToothAreaSelection.availableAreas = [];
            expectedToothAreaSelection.availableTeeth = [];
            expectedToothAreaSelection.serviceCode = { ServiceCodeId: 1, AffectedAreaId: 1, UseCodeForRangeOfTeeth: false };
            expectedToothAreaSelection.originalServiceCode = { ServiceCodeId: 1, AffectedAreaId: 1, UseCodeForRangeOfTeeth: false };

            const result = await service.toothChange(toothAreaData)
            expect(result).toEqual(expectedToothAreaSelection);
            expect(service.settleAreaSelection).toHaveBeenCalled();
            expect(service.loadNextSurfaceSmartCode).not.toHaveBeenCalled();
            expect(service.loadNextRootSmartCode).not.toHaveBeenCalled();
        });


        //No Tooth, root
        it('should set all roots for tooth as availableAreas when tooth is selected', async () => {
            service.cdtCodeGroups = [{ CdtCode: 'test', GroupId: 1, AllowedTeeth: ['All'] }]
            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = []
            toothAreaData.toothSelection = '0';
            toothAreaData.availableAreas = [];
            toothAreaData.availableTeeth = [];
            toothAreaData.serviceCode = { ServiceCodeId: 3, AffectedAreaId: 3, UseCodeForRangeOfTeeth: false };
            toothAreaData.originalServiceCode = { ServiceCodeId: 3, AffectedAreaId: 3, UseCodeForRangeOfTeeth: false };

            let expectedToothAreaSelection = new ToothAreaData();
            expectedToothAreaSelection.areaSelection = []
            expectedToothAreaSelection.toothSelection = '0';
            expectedToothAreaSelection.availableAreas = service.rootAbbreviations;
            expectedToothAreaSelection.availableTeeth = [];
            expectedToothAreaSelection.serviceCode = { ServiceCodeId: 3, AffectedAreaId: 3, UseCodeForRangeOfTeeth: false };
            expectedToothAreaSelection.originalServiceCode = { ServiceCodeId: 3, AffectedAreaId: 3, UseCodeForRangeOfTeeth: false };

            const result = await service.toothChange(toothAreaData)
            expect(result).toEqual(expectedToothAreaSelection);
            expect(service.settleAreaSelection).not.toHaveBeenCalled();
            expect(service.loadNextRootSmartCode).toHaveBeenCalled();
            expect(service.loadNextSurfaceSmartCode).not.toHaveBeenCalled();
        });

        //No Tooth, surface
        it('should set all surface for tooth as availableAreas when tooth is selected', async () => {
            service.cdtCodeGroups = [{ CdtCode: 'test', GroupId: 1, AllowedTeeth: ['All'] }];
            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = []
            toothAreaData.toothSelection = '0';
            toothAreaData.availableAreas = [];
            toothAreaData.availableTeeth = [];
            toothAreaData.serviceCode = { ServiceCodeId: 4, AffectedAreaId: 4, UseCodeForRangeOfTeeth: false };
            toothAreaData.originalServiceCode = { ServiceCodeId: 4, AffectedAreaId: 4, UseCodeForRangeOfTeeth: false };

            let expectedToothAreaSelection = new ToothAreaData();
            expectedToothAreaSelection.areaSelection = []
            expectedToothAreaSelection.toothSelection = '0';
            expectedToothAreaSelection.availableAreas = service.surfaceAbbreviations;
            expectedToothAreaSelection.availableTeeth = [];
            expectedToothAreaSelection.serviceCode = { ServiceCodeId: 4, AffectedAreaId: 4, UseCodeForRangeOfTeeth: false };
            expectedToothAreaSelection.originalServiceCode = { ServiceCodeId: 4, AffectedAreaId: 4, UseCodeForRangeOfTeeth: false };

            const result = await service.toothChange(toothAreaData)
            expect(result).toEqual(expectedToothAreaSelection);
            expect(service.settleAreaSelection).not.toHaveBeenCalled();
            expect(service.loadNextSurfaceSmartCode).toHaveBeenCalled();
            expect(service.loadNextRootSmartCode).not.toHaveBeenCalled()
        });


        //No Tooth, neither root, nor surface
        it('should set all surface for tooth as availableAreas when tooth is selected', async () => {
            service.cdtCodeGroups = [{ CdtCode: 'test', GroupId: 1, AllowedTeeth: ['All'] }];
            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = []
            toothAreaData.toothSelection = '0';
            toothAreaData.availableAreas = [];
            toothAreaData.availableTeeth = [];
            toothAreaData.serviceCode = { ServiceCodeId: 1, AffectedAreaId: 1, UseCodeForRangeOfTeeth: false };
            toothAreaData.originalServiceCode = { ServiceCodeId: 1, AffectedAreaId: 1, UseCodeForRangeOfTeeth: false };

            let expectedToothAreaSelection = new ToothAreaData();
            expectedToothAreaSelection.areaSelection = []
            expectedToothAreaSelection.toothSelection = '0';
            expectedToothAreaSelection.availableAreas = [];
            expectedToothAreaSelection.availableTeeth = [];
            expectedToothAreaSelection.serviceCode = { ServiceCodeId: 1, AffectedAreaId: 1, UseCodeForRangeOfTeeth: false };
            expectedToothAreaSelection.originalServiceCode = { ServiceCodeId: 1, AffectedAreaId: 1, UseCodeForRangeOfTeeth: false };

            const result = await service.toothChange(toothAreaData)
            expect(result).toEqual(expectedToothAreaSelection);
            expect(service.settleAreaSelection).not.toHaveBeenCalled();
            expect(service.loadNextSurfaceSmartCode).not.toHaveBeenCalled();
            expect(service.loadNextRootSmartCode).not.toHaveBeenCalled();
        });
    });

    describe('areaChange', () => {
        beforeEach(() => {

            service.loadNextSurfaceSmartCode = jasmine.createSpy().and.callFake(function (param) {
                return param;
            });

        });

        //No tooth selection
        it('should not call loadNextSurfaceSmartCode when tooth is null', async () => {
            service.cdtCodeGroups = [{ CdtCode: 'test', GroupId: 1, AllowedTeeth: ['All'] }]
            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = []
            toothAreaData.toothSelection = null;
            toothAreaData.availableAreas = [];
            toothAreaData.availableTeeth = [];
            toothAreaData.serviceCode = { ServiceCodeId: 4, AffectedAreaId: 4, UseCodeForRangeOfTeeth: false };

            let expectedToothAreaSelection = new ToothAreaData();
            expectedToothAreaSelection.areaSelection = []
            expectedToothAreaSelection.toothSelection = '1';
            expectedToothAreaSelection.availableAreas = [];
            expectedToothAreaSelection.availableTeeth = [];
            expectedToothAreaSelection.serviceCode = { ServiceCodeId: 4, AffectedAreaId: 4, UseCodeForRangeOfTeeth: false };


            await service.areaChange(toothAreaData);
            expect(service.loadNextSurfaceSmartCode).not.toHaveBeenCalled();
        });

        //AffectedAreaId 4 with 0 tooth selection
        it('should not call loadNextSurfaceSmartCode when tooth is 0', async () => {
            service.cdtCodeGroups = [{ CdtCode: 'test', GroupId: 1, AllowedTeeth: ['All'] }]
            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = []
            toothAreaData.toothSelection = '0';
            toothAreaData.availableAreas = [];
            toothAreaData.availableTeeth = [];
            toothAreaData.serviceCode = { ServiceCodeId: 4, AffectedAreaId: 4, UseCodeForRangeOfTeeth: false };

            let expectedToothAreaSelection = new ToothAreaData();
            expectedToothAreaSelection.areaSelection = []
            expectedToothAreaSelection.toothSelection = '1';
            expectedToothAreaSelection.availableAreas = [];
            expectedToothAreaSelection.availableTeeth = [];
            expectedToothAreaSelection.serviceCode = { ServiceCodeId: 4, AffectedAreaId: 4, UseCodeForRangeOfTeeth: false };


            await service.areaChange(toothAreaData);
            expect(service.loadNextSurfaceSmartCode).not.toHaveBeenCalled();
        });

        //AffectedAreaId 4 with toothSelection
        it('should call loadNextSurfaceSmartCode when tooth is selected and affectedArea is 4', async () => {
            service.cdtCodeGroups = [{ CdtCode: 'test', GroupId: 1, AllowedTeeth: ['All'] }]
            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = []
            toothAreaData.toothSelection = '1';
            toothAreaData.availableAreas = [];
            toothAreaData.availableTeeth = [];
            toothAreaData.serviceCode = { ServiceCodeId: 4, AffectedAreaId: 4, UseCodeForRangeOfTeeth: false };

            let expectedToothAreaSelection = new ToothAreaData();
            expectedToothAreaSelection.areaSelection = []
            expectedToothAreaSelection.toothSelection = '1';
            expectedToothAreaSelection.availableAreas = [];
            expectedToothAreaSelection.availableTeeth = [];
            expectedToothAreaSelection.serviceCode = { ServiceCodeId: 4, AffectedAreaId: 4, UseCodeForRangeOfTeeth: false };


            await service.areaChange(toothAreaData);
            expect(service.loadNextSurfaceSmartCode).toHaveBeenCalled();
        });

        //AffectedAreaId 3 with toothSelection
        it('should not call loadNextSurfaceSmartCode when tooth is selected and affectedArea is not 4', async () => {
            service.cdtCodeGroups = [{ CdtCode: 'test', GroupId: 1, AllowedTeeth: ['All'] }]
            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = []
            toothAreaData.toothSelection = '1';
            toothAreaData.availableAreas = [];
            toothAreaData.availableTeeth = [];
            toothAreaData.serviceCode = { ServiceCodeId: 3, AffectedAreaId: 3, UseCodeForRangeOfTeeth: false };

            let expectedToothAreaSelection = new ToothAreaData();
            expectedToothAreaSelection.areaSelection = []
            expectedToothAreaSelection.toothSelection = '1';
            expectedToothAreaSelection.availableAreas = [];
            expectedToothAreaSelection.availableTeeth = [];
            expectedToothAreaSelection.serviceCode = { ServiceCodeId: 3, AffectedAreaId: 3, UseCodeForRangeOfTeeth: false };


            await service.areaChange(toothAreaData);
            expect(service.loadNextSurfaceSmartCode).not.toHaveBeenCalled();
        });

    });

    describe('findToothFromAvailableTeeth', () => {
        beforeEach(() => {

        });

        //ToothSelection in availableTeeth
        it('should return tooth when toothSelection is in availableTeeth', () => {
            service.cdtCodeGroups = [{ CdtCode: 'test', GroupId: 1, AllowedTeeth: ['All'] }]
            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = []
            toothAreaData.toothSelection = '1';
            toothAreaData.availableAreas = [];
            toothAreaData.availableTeeth = [{ USNumber: '1' }, { USNumber: '2' }];

            let expectedToothAreaSelection = new ToothAreaData();
            expectedToothAreaSelection.areaSelection = []
            expectedToothAreaSelection.toothSelection = '1';
            expectedToothAreaSelection.availableAreas = [];
            expectedToothAreaSelection.availableTeeth = [];


            let result = service.findToothFromAvailableTeeth(toothAreaData);

            expect(result).toEqual({ USNumber: '1' });
        });


        //ToothSelection not in availableTeeth
        it('should return undefined when toothSelection is in availableTeeth', () => {
            service.cdtCodeGroups = [{ CdtCode: 'test', GroupId: 1, AllowedTeeth: ['All'] }]
            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = []
            toothAreaData.toothSelection = '3';
            toothAreaData.availableAreas = [];
            toothAreaData.availableTeeth = [{ USNumber: '1' }, { USNumber: '2' }];

            let expectedToothAreaSelection = new ToothAreaData();
            expectedToothAreaSelection.areaSelection = []
            expectedToothAreaSelection.toothSelection = '1';
            expectedToothAreaSelection.availableAreas = [];
            expectedToothAreaSelection.availableTeeth = [];


            let result = service.findToothFromAvailableTeeth(toothAreaData);

            expect(result).toEqual(undefined);
        });

    });

    describe('settleToothAndAvailableAreas', () => {
        beforeEach(() => {

            service.findToothFromAvailableTeeth = jasmine.createSpy().and.returnValue(
                { ToothId: 1, USNumber: '1', RootAbbreviations: ["DB", "P", "MB"], SummarySurfaceAbbreviations: ["M", "B", "O", "L", "B5", "L5", "D"] }
            );

        });

        //Temptooth returns value, affected area 3
        it('should set availableAreas to tempTooth root abbreviations when root and temp tooth returns', () => {
            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = []
            toothAreaData.toothSelection = '1';
            toothAreaData.availableAreas = [];
            toothAreaData.availableTeeth = [];
            toothAreaData.serviceCode = { ServiceCodeId: 3, AffectedAreaId: 3, UseCodeForRangeOfTeeth: false };

            let expectedToothAreaSelection = new ToothAreaData();
            expectedToothAreaSelection.areaSelection = []
            expectedToothAreaSelection.toothSelection = '1';
            expectedToothAreaSelection.availableAreas = ["DB", "P", "MB"];
            expectedToothAreaSelection.availableTeeth = [];
            expectedToothAreaSelection.serviceCode = { ServiceCodeId: 3, AffectedAreaId: 3, UseCodeForRangeOfTeeth: false };


            let result = service.settleToothAndAvailableAreas(toothAreaData);

            expect(result).toEqual(expectedToothAreaSelection);
        });


        //Temptooth returns value, affected area 4
        it('should set availableAreas to tempTooth surface abbreviations when surface and temp tooth returns', () => {
            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = []
            toothAreaData.toothSelection = '1';
            toothAreaData.availableAreas = [];
            toothAreaData.availableTeeth = [];
            toothAreaData.serviceCode = { ServiceCodeId: 4, AffectedAreaId: 4, UseCodeForRangeOfTeeth: false };

            let expectedToothAreaSelection = new ToothAreaData();
            expectedToothAreaSelection.areaSelection = []
            expectedToothAreaSelection.toothSelection = '1';
            expectedToothAreaSelection.availableAreas = ["M", "B", "O", "L", "B5", "L5", "D"];
            expectedToothAreaSelection.availableTeeth = [];
            expectedToothAreaSelection.serviceCode = { ServiceCodeId: 4, AffectedAreaId: 4, UseCodeForRangeOfTeeth: false };


            let result = service.settleToothAndAvailableAreas(toothAreaData);

            expect(result).toEqual(expectedToothAreaSelection);
        });


        //Temptooth returns value, affected area neither 3, nor 4
        it('should set availableAreas and areaSelection to blank when affected area is not 3 or 4', () => {
            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = []
            toothAreaData.toothSelection = '1';
            toothAreaData.availableAreas = [];
            toothAreaData.availableTeeth = [];
            toothAreaData.serviceCode = { ServiceCodeId: 5, AffectedAreaId: 5, UseCodeForRangeOfTeeth: false };

            let expectedToothAreaSelection = new ToothAreaData();
            expectedToothAreaSelection.areaSelection = []
            expectedToothAreaSelection.toothSelection = '1';
            expectedToothAreaSelection.availableAreas = [];
            expectedToothAreaSelection.availableTeeth = [];
            expectedToothAreaSelection.serviceCode = { ServiceCodeId: 5, AffectedAreaId: 5, UseCodeForRangeOfTeeth: false };


            let result = service.settleToothAndAvailableAreas(toothAreaData);

            expect(result).toEqual(expectedToothAreaSelection);
        });




        //Temptooth returns no value, affected area 3
        it('should set availableAreas to all root abbreviations when root and no temp tooth returns', () => {
            service.findToothFromAvailableTeeth = jasmine.createSpy().and.returnValue(
                undefined
            );
            service.rootAbbreviations = ['test']

            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = []
            toothAreaData.toothSelection = '1';
            toothAreaData.availableAreas = [];
            toothAreaData.availableTeeth = [];
            toothAreaData.serviceCode = { ServiceCodeId: 3, AffectedAreaId: 3, UseCodeForRangeOfTeeth: false };

            let expectedToothAreaSelection = new ToothAreaData();
            expectedToothAreaSelection.areaSelection = []
            expectedToothAreaSelection.toothSelection = '0';
            expectedToothAreaSelection.availableAreas = service.rootAbbreviations;
            expectedToothAreaSelection.availableTeeth = [];
            expectedToothAreaSelection.serviceCode = { ServiceCodeId: 3, AffectedAreaId: 3, UseCodeForRangeOfTeeth: false };


            let result = service.settleToothAndAvailableAreas(toothAreaData);

            expect(result).toEqual(expectedToothAreaSelection);
        });


        //Temptooth returns no value, affected area 4
        it('should set availableAreas to all surface abbreviations when surface and no temp tooth returns', () => {
            service.findToothFromAvailableTeeth = jasmine.createSpy().and.returnValue(
                undefined
            );
            service.surfaceAbbreviations = ['test']

            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = []
            toothAreaData.toothSelection = '1';
            toothAreaData.availableAreas = [];
            toothAreaData.availableTeeth = [];
            toothAreaData.serviceCode = { ServiceCodeId: 4, AffectedAreaId: 4, UseCodeForRangeOfTeeth: false };

            let expectedToothAreaSelection = new ToothAreaData();
            expectedToothAreaSelection.areaSelection = []
            expectedToothAreaSelection.toothSelection = '0';
            expectedToothAreaSelection.availableAreas = service.surfaceAbbreviations;
            expectedToothAreaSelection.availableTeeth = [];
            expectedToothAreaSelection.serviceCode = { ServiceCodeId: 4, AffectedAreaId: 4, UseCodeForRangeOfTeeth: false };


            let result = service.settleToothAndAvailableAreas(toothAreaData);

            expect(result).toEqual(expectedToothAreaSelection);
        });














    });

    describe('settleAreaSelection', () => {
        beforeEach(() => {

            service.findToothFromAvailableTeeth = jasmine.createSpy().and.returnValue(
                { ToothId: 1, USNumber: '1', RootAbbreviations: ["DB", "P", "MB"], SummarySurfaceAbbreviations: ["M", "B", "O", "L", "B5", "L5", "D"] }
            );

        });

        //Temptooth returns value, affected area 3
        it('should return areaSelection based on valid values in availableAreas', () => {
            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = ['M', 'B']
            toothAreaData.toothSelection = '1';
            toothAreaData.availableAreas = ['A', 'B', 'C'];
            toothAreaData.availableTeeth = [];
            toothAreaData.serviceCode = { ServiceCodeId: 3, AffectedAreaId: 3, UseCodeForRangeOfTeeth: false };

            let expectedToothAreaSelection = new ToothAreaData();
            expectedToothAreaSelection.areaSelection = ['B']
            expectedToothAreaSelection.toothSelection = '1';
            expectedToothAreaSelection.availableAreas = ['A', 'B', 'C'];
            expectedToothAreaSelection.availableTeeth = [];
            expectedToothAreaSelection.serviceCode = { ServiceCodeId: 3, AffectedAreaId: 3, UseCodeForRangeOfTeeth: false };


            let result = service.settleAreaSelection(toothAreaData);

            expect(result).toEqual(expectedToothAreaSelection);
        });
    });

    describe('loadNextSurfaceSmartCode', () => {
        beforeEach(() => {

            service.getNextSmartCode = jasmine.createSpy().and.returnValue(
                { ServiceCodeId: 3, AffectedAreaId: 3, UseCodeForRangeOfTeeth: false }
            );

            service.getTeethForCurrentServiceCode = jasmine.createSpy().and.callFake(function (value) {
                return value;
            });

        });

        //NewSmartCode undefined
        it('should return same toothAreaData when newSmartCode is undefined', async () => {
            service.getNextSmartCode = jasmine.createSpy().and.returnValue(
                undefined
            );

            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = ['B']
            toothAreaData.toothSelection = '1';
            toothAreaData.availableAreas = ['A', 'B', 'C'];
            toothAreaData.availableTeeth = [];
            toothAreaData.serviceCode = { ServiceCodeId: 3, AffectedAreaId: 3, UseCodeForRangeOfTeeth: false };

            let expectedToothAreaSelection = new ToothAreaData();
            expectedToothAreaSelection.areaSelection = ['B']
            expectedToothAreaSelection.toothSelection = '1';
            expectedToothAreaSelection.availableAreas = ['A', 'B', 'C'];
            expectedToothAreaSelection.availableTeeth = [];
            expectedToothAreaSelection.serviceCode = { ServiceCodeId: 3, AffectedAreaId: 3, UseCodeForRangeOfTeeth: false };


            const result = await service.loadNextSurfaceSmartCode(toothAreaData);
            expect(result).toEqual(expectedToothAreaSelection);
        });



        //NewSmartCode different than existing code
        it('should set newSmartCode when new code is different', async () => {
            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = ['B']
            toothAreaData.toothSelection = '1';
            toothAreaData.availableAreas = ['A', 'B', 'C'];
            toothAreaData.availableTeeth = [];
            toothAreaData.serviceCode = { ServiceCodeId: 4, AffectedAreaId: 4, UseCodeForRangeOfTeeth: false };

            let expectedToothAreaSelection = new ToothAreaData();
            expectedToothAreaSelection.areaSelection = ['B']
            expectedToothAreaSelection.toothSelection = '1';
            expectedToothAreaSelection.availableAreas = ['A', 'B', 'C'];
            expectedToothAreaSelection.availableTeeth = [];
            expectedToothAreaSelection.serviceCode = { ServiceCodeId: 3, AffectedAreaId: 3, UseCodeForRangeOfTeeth: false };


            const result = await service.loadNextSurfaceSmartCode(toothAreaData);
            expect(result).toEqual(expectedToothAreaSelection);
        });



        //NewSmartCodes same as existing code
        it('should return same toothAreaData when newSmartCode is same', async () => {
            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = ['B']
            toothAreaData.toothSelection = '1';
            toothAreaData.availableAreas = ['A', 'B', 'C'];
            toothAreaData.availableTeeth = [];
            toothAreaData.serviceCode = { ServiceCodeId: 3, AffectedAreaId: 3, UseCodeForRangeOfTeeth: false };

            let expectedToothAreaSelection = new ToothAreaData();
            expectedToothAreaSelection.areaSelection = ['B']
            expectedToothAreaSelection.toothSelection = '1';
            expectedToothAreaSelection.availableAreas = ['A', 'B', 'C'];
            expectedToothAreaSelection.availableTeeth = [];
            expectedToothAreaSelection.serviceCode = { ServiceCodeId: 3, AffectedAreaId: 3, UseCodeForRangeOfTeeth: false };


            const result = await service.loadNextSurfaceSmartCode(toothAreaData);
            expect(result).toEqual(expectedToothAreaSelection);
        });
    });

    describe('loadNextRootSmartCode', () => {
        beforeEach(() => {

            service.getNumberOfRoots = jasmine.createSpy().and.callFake(function (x) {
                return 1;
            });

            service.getNextRootSmartCode = jasmine.createSpy().and.returnValue(
                { ServiceCodeId: 3, AffectedAreaId: 3, UseCodeForRangeOfTeeth: false }
            );

            service.getTeethForCurrentServiceCode = jasmine.createSpy().and.callFake(function (value) {
                return value;
            });
        });

        //NewSmartCode undefined
        it('should return same toothAreaData when newSmartCode is undefined', () => {
            service.getNextRootSmartCode = jasmine.createSpy().and.returnValue(
                undefined
            );

            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = ['B']
            toothAreaData.toothSelection = '1';
            toothAreaData.availableAreas = ['A', 'B', 'C'];
            toothAreaData.availableTeeth = [];
            toothAreaData.serviceCode = { ServiceCodeId: 3, AffectedAreaId: 3, UseCodeForRangeOfTeeth: false };

            let expectedToothAreaSelection = new ToothAreaData();
            expectedToothAreaSelection.areaSelection = ['B']
            expectedToothAreaSelection.toothSelection = '1';
            expectedToothAreaSelection.availableAreas = ['A', 'B', 'C'];
            expectedToothAreaSelection.availableTeeth = [];
            expectedToothAreaSelection.serviceCode = { ServiceCodeId: 3, AffectedAreaId: 3, UseCodeForRangeOfTeeth: false };


            let result = service.loadNextRootSmartCode(toothAreaData);

            expect(result).toEqual(expectedToothAreaSelection);
        });



        //NewSmartCode different than existing code
        it('should set newSmartCode when new code is different', () => {
            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = ['B']
            toothAreaData.toothSelection = '1';
            toothAreaData.availableAreas = ['A', 'B', 'C'];
            toothAreaData.availableTeeth = [];
            toothAreaData.serviceCode = { ServiceCodeId: 4, AffectedAreaId: 4, UseCodeForRangeOfTeeth: false };

            let expectedToothAreaSelection = new ToothAreaData();
            expectedToothAreaSelection.areaSelection = ['B']
            expectedToothAreaSelection.toothSelection = '1';
            expectedToothAreaSelection.availableAreas = ['A', 'B', 'C'];
            expectedToothAreaSelection.availableTeeth = [];
            expectedToothAreaSelection.serviceCode = { ServiceCodeId: 3, AffectedAreaId: 3, UseCodeForRangeOfTeeth: false };


            let result = service.loadNextRootSmartCode(toothAreaData);

            expect(result).toEqual(expectedToothAreaSelection);
        });



        //NewSmartCodes same as existing code
        it('should return same toothAreaData when newSmartCode is same', () => {
            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = ['B']
            toothAreaData.toothSelection = '1';
            toothAreaData.availableAreas = ['A', 'B', 'C'];
            toothAreaData.availableTeeth = [];
            toothAreaData.serviceCode = { ServiceCodeId: 3, AffectedAreaId: 3, UseCodeForRangeOfTeeth: false };

            let expectedToothAreaSelection = new ToothAreaData();
            expectedToothAreaSelection.areaSelection = ['B']
            expectedToothAreaSelection.toothSelection = '1';
            expectedToothAreaSelection.availableAreas = ['A', 'B', 'C'];
            expectedToothAreaSelection.availableTeeth = [];
            expectedToothAreaSelection.serviceCode = { ServiceCodeId: 3, AffectedAreaId: 3, UseCodeForRangeOfTeeth: false };


            let result = service.loadNextRootSmartCode(toothAreaData);

            expect(result).toEqual(expectedToothAreaSelection);
        });



    });

    describe('getNextSmartCode', () => {
        it('should return value from GetSmartCode factory method', async () => {
            const result = await service.getNextSmartCode('test', 'test');
            expect(result).toEqual({ ServiceCodeId: 3 });
        });
    });

    describe('getNextRootSmartCode', () => {
        beforeEach(() => {
            service.serviceCodes = serviceCodes;
        });

        //ActiveAreas, 0
        it('should return empty string when area selection is empty', () => {
            let result = service.getNextRootSmartCode([], { ServiceCodeId: 7, AffectedAreaId: 3, UseCodeForRangeOfTeeth: false, SmartCode3Id: 3 });

            expect(result).toEqual('');
        });

        //ActiveAreas, matching a smart code length        
        it('should return new smart code when area is selected and matches the length in a service code', () => {
            let result = service.getNextRootSmartCode(['A', 'B', 'C'], { ServiceCodeId: 7, AffectedAreaId: 3, UseCodeForRangeOfTeeth: false, SmartCode3Id: 3 });

            expect(result).toEqual({ ServiceCodeId: 3, AffectedAreaId: 3, UseCodeForRangeOfTeeth: false });
        });

        //ActiveAreas, not matching a smart code length
        it('should return undefined when area selected and not matching any smart code lengths', () => {
            let result = service.getNextRootSmartCode(['A', 'C'], { ServiceCodeId: 7, AffectedAreaId: 3, UseCodeForRangeOfTeeth: false, SmartCode3Id: 3 });

            expect(result).toEqual(undefined);
        });
    });

    describe('getNumberOfRoots', () => {
        beforeEach(() => {
            service.oneRootTeeth = ['1', '2', '3']
            service.twoRootTeeth = ['4', '5', '6']
            service.threeRootTeeth = ['7', '8', '9']
        });

        //Teeth empty string
        it('should return empty list when teeth is empty', () => {
            let result = service.getNumberOfRoots("");

            expect(result).toEqual([]);
        });

        //Teeth is one root tooth
        it('should return array with 1 item when tooth in oneRootTeeth', () => {
            let result = service.getNumberOfRoots("1");

            expect(result).toEqual([1]);
        });

        //Teeth is two root tooth
        it('should return array with 2 items when tooth in twoRootTeeth', () => {
            let result = service.getNumberOfRoots("4");

            expect(result).toEqual([1, 2]);
        });

        //Teeth is three root tooth
        it('should return array with 3 items when tooth in twoRootTeeth', () => {
            let result = service.getNumberOfRoots("7");

            expect(result).toEqual([1, 2, 3]);
        });

        //Tooth not in any list
        it('should return empty array when tooth is not in any list', () => {
            let result = service.getNumberOfRoots("90");

            expect(result).toEqual([]);
        });
    });

    describe('setValuesOnServiceTransaction', () => {
        beforeEach(() => {
            service.serviceCodes = serviceCodes;
        });

        //ServiceTransaction Code not matching toothAreaData Code
        it('should set service code and descriptions to match new code', () => {
            service.serviceCodes = [{ ServiceCodeId: 1, Code: 'testCode', Description: 'testDescription', AffectedAreaId: 1, UseCodeForRangeOfTeeth: false }];
            let serviceTransaction = { ServiceCodeId: 2, Tooth: '1', Roots: 'Root', Surface: 'Surface', Fee: 0, };
            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = ['A', 'B']
            toothAreaData.toothSelection = '1';
            toothAreaData.availableAreas = ['A', 'B', 'C'];
            toothAreaData.availableTeeth = [];
            toothAreaData.serviceCode = { ServiceCodeId: 1, Code: 'testCode', Description: 'testDescription', AffectedAreaId: 1, UseCodeForRangeOfTeeth: false, $$locationFee: 15 };


            let result = service.setValuesOnServiceTransaction(serviceTransaction, toothAreaData);

            expect(result).toEqual({ ServiceCodeId: 1, Tooth: '', Roots: '', Surface: '', Code: 'testCode', ServiceCode: 'testCode', Description: 'testDescription', Fee: 15 });
        });

        it('should set fee to 0 when service code changed and new service code has no location fee', () => {
            service.serviceCodes = [{ ServiceCodeId: 1, Code: 'testCode', Description: 'testDescription', AffectedAreaId: 1, UseCodeForRangeOfTeeth: false }];
            let serviceTransaction = { ServiceCodeId: 2, Tooth: '1', Roots: 'Root', Surface: 'Surface', Fee: 15, };
            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = ['A', 'B']
            toothAreaData.toothSelection = '1';
            toothAreaData.availableAreas = ['A', 'B', 'C'];
            toothAreaData.availableTeeth = [];
            toothAreaData.serviceCode = { ServiceCodeId: 1, Code: 'testCode', Description: 'testDescription', AffectedAreaId: 1, UseCodeForRangeOfTeeth: false };


            let result = service.setValuesOnServiceTransaction(serviceTransaction, toothAreaData);

            expect(result).toEqual({ ServiceCodeId: 1, Tooth: '', Roots: '', Surface: '', Code: 'testCode', ServiceCode: 'testCode', Description: 'testDescription', Fee: 0 });
        });

        //Mouth Code
        it('should set tooth, root, and surfaces to empty string for mouth code', () => {
            let serviceTransaction = { ServiceCodeId: 1, Tooth: '1', Roots: 'Root', Surface: 'Surface', Fee: 15 };
            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = ['A', 'B']
            toothAreaData.toothSelection = '1';
            toothAreaData.availableAreas = ['A', 'B', 'C'];
            toothAreaData.availableTeeth = [];
            toothAreaData.serviceCode = { ServiceCodeId: 1, AffectedAreaId: 1, UseCodeForRangeOfTeeth: false };


            let result = service.setValuesOnServiceTransaction(serviceTransaction, toothAreaData);

            expect(result).toEqual({ ServiceCodeId: 1, Tooth: '', Roots: '', Surface: '', Fee: 15 });
        });




        //Tooth Code
        it('should set tooth to toothSelection and root, surfaces to empty string for tooth code', () => {
            let serviceTransaction = { ServiceCodeId: 2, Fee: 1, Tooth: '1', Roots: 'Root', Surface: 'Surface' };
            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = ['A', 'B']
            toothAreaData.toothSelection = '1';
            toothAreaData.availableAreas = ['A', 'B', 'C'];
            toothAreaData.availableTeeth = [];
            toothAreaData.serviceCode = { ServiceCodeId: 2, AffectedAreaId: 5, UseCodeForRangeOfTeeth: false, $$locationFee: 15 };


            let result = service.setValuesOnServiceTransaction(serviceTransaction, toothAreaData);

            expect(result).toEqual({ ServiceCodeId: 2, Tooth: '1', Roots: '', Surface: '', Fee: 1 });
        });



        //Root Code
        it('should set tooth and root to selections, surfaces to empty string for root code', () => {
            let serviceTransaction = { ServiceCodeId: 3, Tooth: '1', Roots: 'Root', Surface: 'Surface', Fee: 15 };
            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = ['A', 'B']
            toothAreaData.toothSelection = '1';
            toothAreaData.availableAreas = ['A', 'B', 'C'];
            toothAreaData.availableTeeth = [];
            toothAreaData.serviceCode = { ServiceCodeId: 3, AffectedAreaId: 3, UseCodeForRangeOfTeeth: false };


            let result = service.setValuesOnServiceTransaction(serviceTransaction, toothAreaData);

            expect(result).toEqual({ ServiceCodeId: 3, Tooth: '1', Roots: 'A,B', Surface: '', Fee: 15 });
        });


        //Surface Code
        it('should set tooth and surface to selections, roots to empty string for surface code', () => {
            let serviceTransaction = { ServiceCodeId: 4, Tooth: '1', Roots: 'Root', Surface: 'Surface', Fee: 15 };
            let toothAreaData = new ToothAreaData();
            toothAreaData.areaSelection = ['A', 'B']
            toothAreaData.toothSelection = '1';
            toothAreaData.availableAreas = ['A', 'B', 'C'];
            toothAreaData.availableTeeth = [];
            toothAreaData.serviceCode = { ServiceCodeId: 4, AffectedAreaId: 4, UseCodeForRangeOfTeeth: false };


            let result = service.setValuesOnServiceTransaction(serviceTransaction, toothAreaData);

            expect(result).toEqual({ ServiceCodeId: 4, Tooth: '1', Roots: '', Surface: 'A,B', Fee: 15 });
        });



    });




    describe('scope.checkRange ->', function () {
        var toothRange, arches;
        beforeEach(function () {
            toothRange = [
                '1', '2'
            ];

            arches = ['Upper'];
            service.teethDefinitions = {
                Teeth: [{ USNumber: '1' }, { USNumber: '2' }, { USNumber: '9' }, { USNumber: '10' }]
            };

            //listHelper.findItemByFieldValue = jasmine.createSpy('listHelper.findItemByFieldValue').and.returnValue({});
        });
        it('should add to the array of selected arches', function () {
            var result = service.checkRange(toothRange, arches);
            expect(result.length).toBe(3);
        });

        it('should add to the array of selected arches when range is 9-10', function () {
            toothRange = ['9', '10'];
            var result = service.checkRange(toothRange, arches);
            expect(result.length).toBe(3);
        });
    });


});
