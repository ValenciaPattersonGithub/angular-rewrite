import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { OrderByPipe } from 'src/@shared/pipes/order-by/order-by.pipe';
import { FeeListsLandingComponent } from './fee-lists-landing.component';
import { cloneDeep } from 'lodash';
import { Observable, of, throwError } from 'rxjs';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { FeeListDto, FeeListLocationDTO, FeeListsService } from 'src/@shared/providers/fee-lists.service';
import { BrowserModule } from '@angular/platform-browser';
import { AuthAccess } from 'src/@shared/models/auth-access.model';
import { HttpErrorResponse } from '@angular/common/http';
import { configureTestSuite } from 'src/configure-test-suite';
import { PageNavigationComponent } from 'src/@shared/components/page-navigation/page-navigation.component';
//#region mocks

let dummyData;
let mockServiceCodes;
let feeListsInputMock;
let feeLists;
let res;
let mocklocalize;
let mockToastrFactory;
let mockpatSecurityService;
let mocklocation;
let mockStaticData;
let mockListHelper;
let mockFeeListService;
let mockReportsFactory;
let mockreferenceDataService;
let mockModalFactory;

describe('FeeListsLandingComponent', () => {
    let component: FeeListsLandingComponent;
    let fixture: ComponentFixture<FeeListsLandingComponent>;

    configureTestSuite(() => {
        dummyData = {
            FeeList: {
                FeeListId: 2, Name: 'RARTVMQJTEWOZB', PublishDate: '2022-08-30T05:33:38.8192973',
                DraftDate: null, ServiceCodes: [{
                    CdtCodeId: "17b87dff-292d-46c1-baa0-b3953a78fa70",
                    CdtCodeName: "D9942",
                    Code: "D9942",
                    DataTag: "AAAAAAAO0y4=",
                    Description: "repair and/or reline of occlusal guard",
                    Fee: 51,
                    FeeListId: 2,
                    FeeListServiceCodeId: 1445,
                    InactivationDate: null,
                    IsActive: true,
                    NewFee: 51,
                    NewTaxableServiceTypeId: 3,
                    ServiceCodeId: "bd00d294-4c6f-445c-9ea2-0020487a73c4",
                    ServiceTypeDescription: "Adjunctive General Services",
                    ServiceTypeId: "d80667df-df6c-4166-bd4d-75009207eaf2",
                    TaxableServiceTypeId: 3,
                }]
            }
        }

        mockServiceCodes = [
            {
                $$AffectedAreaName: "Mouth",
                $$Dirty: false,
                $$FeeString: "0.00",
                $$IsActiveName: "Active",
                $$IsActiveNo: false,
                $$IsActiveYes: true,
                $$IsEligibleForDiscountName: "Yes",
                $$IsEligibleForDiscountNo: false,
                $$IsEligibleForDiscountYes: true,
                $$OriginalAffectedAreaId: "1",
                $$SubmitOnInsuranceName: "Yes",
                $$SubmitOnInsuranceNo: false,
                $$SubmitOnInsuranceYes: true,
                $$UsuallyPerformedByProviderTypeName: "Dentist",
                $$hashKey: "object:885",
                $$locationFee: 0,
                $$locationTaxableServiceTypeId: 1,
                $$serviceTransactionFee: 0,
                AffectedAreaId: "1",
                AffectedAreaName: null,
                AmaDiagnosisCode: null,
                CPT: null,
                CdtCodeId: null,
                CdtCodeName: "",
                Code: "ServiceCodeCode",
                CompleteDescription: null,
                DataTag: "ServiceCodeDataTag",
                DateModified: "2022-07-20T11:50:09.3773119",
                Description: "e5679i",
                DisplayAs: "!@#$++--",
                DrawTypeDescription: null,
                DrawTypeId: "525",
                IconName: "",
                InactivationDate: null,
                InactivationRemoveReferences: false,
                IsActive: true,
                IsEligibleForDiscount: true,
                IsSwiftPickCode: false,
                LastUsedDate: null,
                LocationSpecificInfo: [],
                Modifications: [],
                Modifier: null,
                Notes: "",
                PracticeId: 322,
                ServiceCodeId: "1",
                ServiceTypeDescription: "01111tes",
                ServiceTypeId: "1",
                SetsToothAsMissing: false,
                SmartCode1Id: null,
                SmartCode2Id: null,
                SmartCode3Id: null,
                SmartCode4Id: null,
                SmartCode5Id: null,
                SubmitOnInsurance: true,
                SwiftPickServiceCodes: null,
                TimesUsed: 0,
                UseCodeForRangeOfTeeth: false,
                UseSmartCodes: false,
                UserModified: "215de079-e9d0-4e07-912b-f7eabc6b038e",
                UsuallyPerformedByProviderTypeId: "1",
                UsuallyPerformedByProviderTypeName: null,
            },
            {
                $$AffectedAreaName: "Tooth",
                $$Dirty: false,
                $$FeeString: "0.00",
                $$IsActiveName: "Active",
                $$IsActiveNo: false,
                $$IsActiveYes: true,
                $$IsEligibleForDiscountName: "Yes",
                $$IsEligibleForDiscountNo: false,
                $$IsEligibleForDiscountYes: true,
                $$OriginalAffectedAreaId: "101",
                $$SubmitOnInsuranceName: "Yes",
                $$SubmitOnInsuranceNo: false,
                $$SubmitOnInsuranceYes: true,
                $$UsuallyPerformedByProviderTypeName: "Dentist",
                $$hashKey: "object:885",
                $$locationFee: 0,
                $$locationTaxableServiceTypeId: 1,
                $$serviceTransactionFee: 0,
                TaxableServiceTypeId: 60,
                AffectedAreaId: "1010",
                AffectedAreaName: null,
                AmaDiagnosisCode: null,
                CPT: null,
                CdtCodeId: null,
                CdtCodeName: "",
                Code: "!@#$++--",
                CompleteDescription: null,
                DataTag: "AAAAAATNeYg=",
                DateModified: "2022-07-20T11:50:09.3773119",
                Description: "e5679i",
                DisplayAs: "!@#$++--",
                DrawTypeDescription: null,
                DrawTypeId: "111",
                IconName: "",
                InactivationDate: null,
                InactivationRemoveReferences: false,
                IsActive: true,
                IsEligibleForDiscount: true,
                IsSwiftPickCode: false,
                LastUsedDate: null,
                LocationSpecificInfo: [],
                Modifications: [],
                Modifier: null,
                Notes: "",
                PracticeId: 322,
                ServiceCodeId: "2",
                ServiceTypeDescription: "01111tes",
                ServiceTypeId: "b1a248f8-4200-4248-bf04-697a66b95724",
                SetsToothAsMissing: false,
                SmartCode1Id: null,
                SmartCode2Id: null,
                SmartCode3Id: null,
                SmartCode4Id: null,
                SmartCode5Id: null,
                SubmitOnInsurance: true,
                SwiftPickServiceCodes: [{
                    AffectedAreaId: 1,
                    CdtCodeName: "OldCdtCodeName",
                    Code: "OldCode",
                    DataTag: "OldDataTag",
                    DateModified: "2022-09-23T19:20:42.7066804",
                    Description: "OldDescription",
                    DisplayAs: "Modify - Log Ver",
                    ServiceCodeId: "1",
                    SwiftPickCodeId: "36dea4d5-3abf-4155-8a85-44bfbd763e5b",
                    SwiftPickServiceCodeId: "1aed9dc0-1d15-454a-8896-467a565b01ff",
                    UserModified: "46036023-d22b-4b0e-a0f6-c0120e19b7e0",
                    UsuallyPerformedByProviderTypeId: 1
                }],
                TimesUsed: 0,
                UseCodeForRangeOfTeeth: false,
                UseSmartCodes: false,
                UserModified: "215de079-e9d0-4e07-912b-f7eabc6b038e",
                UsuallyPerformedByProviderTypeId: "1",
                UsuallyPerformedByProviderTypeName: null,
            },
            {
                AffectedAreaId: 0,
                AffectedAreaName: null,
                AmaDiagnosisCode: null,
                CPT: null,
                CdtCodeId: null,
                CdtCodeName: "",
                Code: "AArea",
                CompleteDescription: null,
                DataTag: "AAAAABVgTro=",
                DateModified: "2022-10-18T09:15:11.3009155Z",
                Description: "Affected Areasss",
                DisplayAs: "Affected Areas",
                DrawTypeDescription: null,
                DrawTypeId: null,
                IconName: null,
                InactivationDate: null,
                InactivationRemoveReferences: false,
                IsActive: true,
                IsEligibleForDiscount: false,
                IsSwiftPickCode: true,
                LastUsedDate: null,
                SwiftPickServiceCodes: [{
                    AffectedAreaId: 1,
                    CdtCodeName: "",
                    Code: "VSCALR",
                    DataTag: "AAAAABVEMYc=",
                    DateModified: "2022-09-23T19:20:42.7066804",
                    Description: "This is for verify the activity log report! Modified",
                    DisplayAs: "Modify - Log Ver",
                    ServiceCodeId: "8bd0216b-5146-477b-ba4c-b21c99b1c82a",
                    SwiftPickCodeId: "36dea4d5-3abf-4155-8a85-44bfbd763e5b",
                    SwiftPickServiceCodeId: "1aed9dc0-1d15-454a-8896-467a565b01ff",
                    UserModified: "46036023-d22b-4b0e-a0f6-c0120e19b7e0",
                    UsuallyPerformedByProviderTypeId: 1
                }],

            }
        ]

        feeListsInputMock = [];
        for (let i = 1; i < 4; i++) {
            feeListsInputMock.push({
                Name: "Fee List " + i,
                FeeListId: i,
                Locations: []
            });
        }

        feeLists = [{
            Name: 'Denise-Location',
            FeeListId: 'Denise-Location'
        },
        {
            Name: 'PracticeDefault',
            FeeListId: 'PracticeDefault'
        },
        {
            Name: 'QA Fee List',
            FeeListId: 'QA Fee List',
        }];

        res = {
            Value: feeListsInputMock
        };

        sessionStorage.setItem(
            "userLocation",
            JSON.stringify({ userLocationId: { id: 1 } })
        );
        //#endregion

        mocklocalize = {
            getLocalizedString: () => 'translated text'
        };

        mockToastrFactory = {
            success: jasmine.createSpy('toastrFactory.success'),
            error: jasmine.createSpy('toastrFactory.error')
        };

        mockpatSecurityService = {
            IsAuthorizedByAbbreviation: jasmine.createSpy("patSecurityService.IsAuthorizedByAbbreviation").and.returnValue(true),
            IsAuthorizedByAbbreviationAtLocation: jasmine.createSpy("patSecurityService.IsAuthorizedByAbbreviationAtLocation").and.returnValue(true),
            generateMessage: jasmine.createSpy("patSecurityService.generateMessage")
        };

        mocklocation = {
            path: jasmine.createSpy().and.returnValue('/')
        };

        mockStaticData = {
            TaxableServices: (res) => {
                return {
                    then: (res) => {
                        res({ Value: [] })
                    }
                }
            }
        };

        mockListHelper = {

        };

        mockFeeListService = {
            FeeLists: jasmine.createSpy().and.returnValue({ then: jasmine.createSpy().and.returnValue(res) }),
            get: jasmine.createSpy().and.returnValue({
                pipe: jasmine.createSpy().and.returnValue({
                    type: "confirm",
                    subscribe: () => { },
                    filter: (f) => { return f }
                }),
            }),
            create: jasmine.createSpy(),
            update: jasmine.createSpy(),
            authAccess: jasmine.createSpy().and.returnValue(true),
            save: jasmine.createSpy(),
            new: jasmine.createSpy(),
            getById: jasmine.createSpy(),
            delete: jasmine.createSpy().and.callFake(() => {
                return new Promise((resolve, reject) => {
                    resolve({ Value: feeLists }),
                        reject({});
                });
            }),
            deleteDraft: jasmine.createSpy().and.callFake(() => {
                return new Promise((resolve, reject) => {
                    resolve({ Value: feeLists }),
                        reject({});
                });
            }),
        };

        mockReportsFactory = {
            GetReportArray: jasmine.createSpy('[12]'),
            OpenReportPage: jasmine.createSpy()
        };

        mockreferenceDataService = {
            get: jasmine.createSpy().and.returnValue([]),
            forceEntityExecution: jasmine.createSpy().and.returnValue([]),
            entityNames: {
                feeLists: feeLists,
                serviceCodes: mockServiceCodes
            }
        };

        mockModalFactory = {
            CancelModal: jasmine
                .createSpy('ModalFactory.CancelModal')
                .and.returnValue({ then: () => { } }),
            ConfirmModal: jasmine.createSpy().and.returnValue({ then: jasmine.createSpy() })
        };

        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), FormsModule, ReactiveFormsModule, BrowserModule],
            providers: [
                { provide: "localize", useValue: mocklocalize },
                { provide: "toastrFactory", useValue: mockToastrFactory },
                { provide: "patSecurityService", useValue: mockpatSecurityService },
                { provide: "$location", useValue: mocklocation },
                { provide: "StaticData", useValue: mockStaticData },
                { provide: "ListHelper", useValue: mockListHelper },
                { provide: FeeListsService, useValue: mockFeeListService },
                { provide: "ReportsFactory", useValue: mockReportsFactory },
                { provide: "referenceDataService", useValue: mockreferenceDataService },
                { provide: 'ModalFactory', useValue: mockModalFactory },
            ],
            declarations: [OrderByPipe, FeeListsLandingComponent, PageNavigationComponent]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FeeListsLandingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.feeListsData = feeListsInputMock;
        component.authAccess = new AuthAccess();
        component.authAccess.view = true;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit -->', () => {
        it('should call getPageNavigation function', () => {
            component.getPageNavigation = jasmine.createSpy();
            component.ngOnInit();
            expect(component.getPageNavigation).toHaveBeenCalled();
        });

        it('should call getTaxableServices function', () => {
            component.getTaxableServices = jasmine.createSpy();
            component.ngOnInit();
            expect(component.getTaxableServices).toHaveBeenCalled();
        });

        it('should call getReportsData function', () => {
            component.getReportsData = jasmine.createSpy();
            component.ngOnInit();
            expect(component.getReportsData).toHaveBeenCalled();
        });
    })

    describe('getPageNavigation function -->', () => {
        it('should set the breadCrumbs property', () => {
            component.getPageNavigation();
            fixture.detectChanges();
            expect(component.breadCrumbs).not.toBeNull();
        });
    })

    describe('getTaxableServices', () => {
        it('should set getTaxableServices', () => {
            component.getTaxableServices();
            fixture.detectChanges();
            expect(component.taxableServices).not.toBeNull();
        })
    })

    describe('authViewAccess -->', () => {
        it('should call notifyNotAuthorized when user is not authorized for view', () => {
            mockpatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(false);
            component.authViewAccess();
            expect(mockToastrFactory.error).toHaveBeenCalled();
        });
    })

    describe('setFeeListData function -->', () => {
        it('should set data for feelist from service method', () => {
            spyOn(component, 'getFeeLists');
            component.feeListsArray = feeListsInputMock;
            component.getFeeLists();
            expect(component.feeListsArray).toEqual(component.feeListsData);
        });

        it('should call addLocationNames if feeListsArray has values', () => {
            component.addLocationNames = jasmine.createSpy();
            component.loadLocationName();
            component.addLocationNames(component.feeListsArray[0]);
            expect(component.addLocationNames).toHaveBeenCalledWith(component.feeListsArray[0]);
        });

        it('should not call addLocationNames if feeListsArray has no values', () => {
            component.addLocationNames = jasmine.createSpy();
            component.feeListsData = [];
            component.loadLocationName();
            expect(component.addLocationNames).not.toHaveBeenCalled();
        });

        it('should add new location to feeList', () => {
            let feeList = {
                LocationNames: '',
                Locations: [
                    { Value: 'Feelist Location' }
                ]
            };
            component.addLocationNames(feeList);
            expect(feeList.LocationNames).toBe('Feelist Location');
        });

        it('should remove last comma', () => {
            const feeList = {
                LocationNames: '',
                Locations: [
                    { Value: 'Feelist Location 1' },
                    { Value: 'Feelist Location 2' },
                    { Value: 'Feelist Location 3' }
                ]
            };
            component.addLocationNames(feeList);
            expect(feeList.LocationNames).toBe('Feelist Location 1, Feelist Location 2, Feelist Location 3');
        });
    })

    describe('getReports function -> ', () => {
        it('should set reports if hasReport Access', () => {
            component.hasReportAccess = true;
            component.getReportsData();
            expect(component.reports).not.toBeNull();
        });

        it('should set reports is in if dont have Report Access', () => {
            component.hasReportAccess = false;
            component.getReportsData();
            expect(component.reports).toBeNull();
        });
    });

    describe('selectedReportChange function -> ', () => {
        it('should call selectedReportChange method', () => {
            component.reports = [{ ReportTitle: '' }];
            component.selectedReportChange(17);
            expect(component.selectedReport.ReportId).toBeNull();
        });
    });

    describe('changeSortingForGrid function -> ', () => {
        it('should initialize sort order to asc ', () => {
            expect(component.orderBy.asc).toBe(true);
        });

        it('should change sort order to desc if sort column selected again ', () => {
            expect(component.orderBy.asc).toBe(true);
            component.changeSortingForGrid('Name');
            expect(component.orderBy.asc).toBe(false);
            component.changeSortingForGrid('Name');
            expect(component.orderBy.asc).toBe(true);
        });
    });

    describe('resetDataForCrud function -> ', () => {
        it('should reset page to original state', () => {
            let mockBreadCrumbs = [
                {
                    name: 'Practice Settings',
                    path: '#/BusinessCenter/PracticeSettings/',
                    title: 'Practice Settings'
                },
                {
                    name: 'Location Fee Lists',
                    path: '#/BusinessCenter/FeeLists/',
                    title: 'Location Fee Lists'
                },
                {
                    name: 'Location Fee Lists2',
                    path: '#/BusinessCenter/FeeLists/',
                    title: 'Location Fee Lists'
                }
            ];
            component.breadCrumbs = mockBreadCrumbs
            component.dataForCrudOperation.BreadCrumbs = mockBreadCrumbs;
            component.dataForCrudOperation.DataHasChanged = true;
            component.dataForCrudOperation.SaveAsDraft = true;
            component.dataForCrudOperation.EditMode = true;
            component.dataForCrudOperation.ViewOnly = true;
            component.dataForCrudOperation.Create = true;
            component.editOrViewMode = true;
            component.orderBy = {
                field: 'Fee',
                asc: false
            };
            component.resetDataForCrud();
            expect(component.orderBy.field).toBe('Name');
            expect(component.orderBy.asc).toBe(true);
            expect(component.dataForCrudOperation.SaveAsDraft).toBe(false);
            expect(component.dataForCrudOperation.DataHasChanged).toBe(false);
            expect(component.dataForCrudOperation.EditMode).toBe(false);
            expect(component.dataForCrudOperation.ViewOnly).toBe(false);
            expect(component.dataForCrudOperation.Create).toBe(false);
            expect(component.editOrViewMode).toBe(false);
        });
    });

    describe('resetData function -> ', () => {
        it('should reset component.dataForCrudOperation.DataHasChanged', () => {
            component.resetData();
            expect(component.dataForCrudOperation.DataHasChanged).toBe(false);
        });
    });

    describe('getFeeLists -->', () => {
        it('should call getFeeLists and execute success method', fakeAsync(() => {
            component.authAccess.view = true;
            component.handleLoadFeeListSuccess = jasmine.createSpy();
            mockFeeListService.get.and.returnValue(of(res));
            component.loadingFeeList = true;
            component.getFeeLists();
            tick();
            expect(component.loadingFeeList).toBe(false);
            expect(mockFeeListService.get).toHaveBeenCalled();
            expect(component.handleLoadFeeListSuccess).toHaveBeenCalled();
        }));

        it('should call feeListsService to get fee list data and execute error method', fakeAsync(() => {
            component.authAccess.view = true;
            let errorResponse = new HttpErrorResponse({
                error: 'test 404 error',
                status: 404, statusText: 'Not Found'
            });
            component.handleLoadFeeListError = jasmine.createSpy();
            mockFeeListService.get.and.returnValue(throwError(errorResponse));
            component.getFeeLists();
            tick();
            expect(mockFeeListService.get).toHaveBeenCalled();
            expect(component.handleLoadFeeListError).toHaveBeenCalled();
        }));
    });

    describe('handleLoadFeeListSuccess', () => {
        it('should call handleLoadFeeListSuccess', () => {
            let feeListData: FeeListLocationDTO[] = [{ FeeListId: 1, Name: 'Test1', DraftDate: "" }, { FeeListId: 2, Name: 'Test2', DraftDate: "" }]
            let feeLists: SoarResponse<FeeListLocationDTO[]> = { Value: feeListData };
            spyOn(component, 'loadLocationName');
            component.handleLoadFeeListSuccess(feeLists);
            expect(component.feeListsData).toBe(feeLists.Value);
            expect(component.loadLocationName).toHaveBeenCalled();
        });
    });

    describe('handleLoadFeeListError', () => {
        it('should call mocktoastrFactory error when handleLoadFeeListError called', () => {
            component.handleLoadFeeListError();
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })
    });

    describe('cancel function -> ', () => {
        it('should call component.resetDataForCrud', () => {
            spyOn(component, 'resetDataForCrud');
            component.cancel();
            expect(component.resetDataForCrud).toHaveBeenCalled();
        });
    })

    describe('save function -> ', () => {
        it('should call feeListHttpService.create with feeList if user has edit access and Create Mode', () => {
            mockFeeListService.create = jasmine.createSpy().and.returnValue(new Observable<SoarResponse<FeeListDto>>());
            component.authAccess.create = true;
            component.dataForCrudOperation.EditMode = false;
            let feeLists = res.Value;
            component.dataForCrudOperation.FeeList = feeLists[0];
            component.dataForCrudOperation.SaveAsDraft = true;
            component.save();
            expect(mockFeeListService.create).toHaveBeenCalledWith(component.dataForCrudOperation.FeeList);
        });

        it('should call mockFeeListHttpService.update with feeList and EditMode and filter out unchanged services', () => {
            mockFeeListService.update = jasmine.createSpy().and.returnValue(new Observable<SoarResponse<FeeListDto>>());
            component.authAccess.update = true;
            component.dataForCrudOperation.EditMode = true;
            component.dataForCrudOperation.SaveAsDraft = false;
            let feeLists = res.Value;
            component.dataForCrudOperation.FeeList = feeLists[0];
            component.dataForCrudOperation.FeeList.ServiceCodes = [{
                Fee: 1,
                NewFee: 2,
                TaxableServiceTypeId: 1,
                NewTaxableServiceTypeId: 1
            },
            {
                Fee: 1,
                NewFee: 2,
                TaxableServiceTypeId: 1,
                NewTaxableServiceTypeId: 2
            },
            {
                Fee: 1,
                NewFee: 1,
                TaxableServiceTypeId: 1,
                NewTaxableServiceTypeId: 1
            },
            {
                Fee: 2,
                NewFee: 2,
                TaxableServiceTypeId: 3,
                NewTaxableServiceTypeId: 1
            }];
            let expected = [{
                Fee: 1,
                NewFee: 2,
                TaxableServiceTypeId: 1,
                NewTaxableServiceTypeId: 1
            },
            {
                Fee: 1,
                NewFee: 2,
                TaxableServiceTypeId: 1,
                NewTaxableServiceTypeId: 2
            },
            {
                Fee: 2,
                NewFee: 2,
                TaxableServiceTypeId: 3,
                NewTaxableServiceTypeId: 1
            }];

            component.save();
            expect(mockFeeListService.update).toHaveBeenCalledWith(jasmine.objectContaining({ ServiceCodes: expected }), false);
        });

        it('should call mockFeeListHttpService.update with feeList and saveAsDraft and EditMode and filter out unchanged services', () => {
            mockFeeListService.update = jasmine.createSpy().and.returnValue(new Observable<SoarResponse<FeeListDto>>());
            component.authAccess.update = true;
            component.dataForCrudOperation.EditMode = true;
            component.dataForCrudOperation.SaveAsDraft = true;
            let feeLists = res.Value;
            component.dataForCrudOperation.FeeList = feeLists[0];
            component.dataForCrudOperation.FeeList.ServiceCodes = [{
                $$DraftModified: true,
                Fee: 1,
                NewFee: 2,
                TaxableServiceTypeId: 1,
                NewTaxableServiceTypeId: 1
            },
            {
                $$DraftModified: false,
                Fee: 1,
                NewFee: 2,
                TaxableServiceTypeId: 1,
                NewTaxableServiceTypeId: 2
            },
            {
                Fee: 1,
                NewFee: 1,
                TaxableServiceTypeId: 1,
                NewTaxableServiceTypeId: 1
            }];
            let expected = [{
                $$DraftModified: true,
                Fee: 1,
                NewFee: 2,
                TaxableServiceTypeId: 1,
                NewTaxableServiceTypeId: 1
            }];

            component.save();
            expect(mockFeeListService.update).toHaveBeenCalledWith(jasmine.objectContaining({ ServiceCodes: expected }), true);
        });

        it('should call mockFeeListHttpService.update with feeList and saveAsDraft if user has create access and EditMode', () => {
            mockFeeListService.update = jasmine.createSpy().and.returnValue(new Observable<SoarResponse<FeeListDto>>());
            component.authAccess.update = true;
            component.dataForCrudOperation.EditMode = true;
            let feeLists = res.Value;
            component.dataForCrudOperation.FeeList = feeLists[0];
            component.dataForCrudOperation.SaveAsDraft = true;
            component.save();
            expect(mockFeeListService.update).toHaveBeenCalledWith(component.dataForCrudOperation.FeeList, true);
        });

        it('should not call mockFeeListHttpService.update if user doesnt have permissions if EditMode', () => {
            mockFeeListService.update = jasmine.createSpy()
            component.authAccess.update = false;
            component.dataForCrudOperation.EditMode = true;
            component.save();
            expect(mockFeeListService.update).not.toHaveBeenCalled();
        });

        it('should not call feeListsService.save if user doesnt have permissions if not EditMode', () => {
            mockFeeListService.create = jasmine.createSpy()
            component.authAccess.create = false;
            component.dataForCrudOperation.EditMode = false;
            component.save();
            expect(mockFeeListService.create).not.toHaveBeenCalled();
        });
    });

    describe('handleFeeListSaveError', () => {
        it('should call mocktoastrFactory error when handleFeeListSaveError called', () => {
            component.handleFeeListSaveError();
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })
    });

    //viewFeeList
    describe('viewFeeList -->', () => {
        let feeList = {
            FeeListId: 0,
            Locations: []
        };
        it('should call feeListsService.getById with FeeListId', fakeAsync(() => {
            component.authAccess.view = true;
            component.dataForCrudOperation.ViewOnly = true;
            component.handleViewFeeListSuccess = jasmine.createSpy();
            mockFeeListService.getById.and.returnValue(of(res));
            component.viewFeeList(feeList);
            tick();
            expect(component.loadingFeeList).toBe(false);
            expect(mockFeeListService.getById).toHaveBeenCalled();
            expect(component.handleViewFeeListSuccess).toHaveBeenCalled();
        }));

        it('should call viewFeeList and execute error method', fakeAsync(() => {
            component.authAccess.view = true;
            let errorResponse = new HttpErrorResponse({
                error: 'test 404 error',
                status: 404, statusText: 'Not Found'
            });
            component.handleViewFeeListResponseError = jasmine.createSpy();
            mockFeeListService.getById.and.returnValue(throwError(errorResponse));
            component.viewFeeList(feeList);
            tick();
            expect(mockFeeListService.getById).toHaveBeenCalled();
            expect(component.handleViewFeeListResponseError).toHaveBeenCalled();
        }));
    });

    describe('handleViewFeeListSuccess', () => {
        it('should call handleViewFeeListSuccess when FeeList exists', () => {
            component.taxableServices = [{ Id: 3, Name: 'Test1' }];
            let feeListData: FeeListDto = { FeeListId: 1, Name: 'Test1', PublishDate: null, DraftDate: dummyData.FeeList.DraftDate, ServiceCodes: dummyData.FeeList.ServiceCodes, DataTag: "" }
            let feeLists: SoarResponse<FeeListDto> = { Value: feeListData };
            component.handleViewFeeListSuccess(feeLists);
            expect(component.dataForCrudOperation.FeeList).toBe(feeListData);
            component.dataForCrudOperation.FeeList.ServiceCodes.forEach((sc) => {
                expect(sc.CdtCodeName).toBeDefined();
                expect(sc.$$TaxableServiceTypeName).toBeDefined();
            });
            expect(component.editOrViewMode).toBe(true);
            expect(component.loadingFeeList).toBe(false);
        });
    });

    describe('handleViewFeeListResponseError', () => {
        it('should call mocktoastrFactory error when handleViewFeeListResponseError called', () => {
            component.handleViewFeeListResponseError();
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })
    });

    describe('changeSortingForGrid function -> ', () => {
        it('should initialize sort order to asc ', () => {
            expect(component.orderBy.asc).toBe(true);
        });

        it('should change sort order to desc if sort column selected again ', () => {
            expect(component.orderBy.asc).toBe(true);
            component.changeSortingForGrid('Name');
            expect(component.orderBy.asc).toBe(false);
            component.changeSortingForGrid('Name');
            expect(component.orderBy.asc).toBe(true);
        });
    })

    describe('editFeeList function if authAccess.Edit is true and loadingFeeList is false -> ', () => {
        beforeEach(() => {
            let feeList = {
                FeeListId: 0
            };
            component.dataForCrudOperation = {
                SaveAsDraft: true,
                EditMode: false,
                ViewOnly: false,
                Create: false,
                BackupFeeList: {},
                DataHasChanged: false,
                DraftDataHasChanged: false,
                BreadCrumbs: [],
                FeeList: {
                    FeeListId: 0,
                    ServiceCodes: mockServiceCodes
                }
            }
            component.loadingFeeList = false;
            component.authAccess = new AuthAccess();
            component.authAccess.view = true;
            component.authAccess.update = true;
            feeList = cloneDeep(feeListsInputMock[0]);
            mockFeeListService.getById = jasmine.createSpy().and.returnValue(new Observable<SoarResponse<FeeListDto>>());
        })

        it('should set dataForCrudOperation.EditMode to true', fakeAsync(() => {
            let feeList = {
                FeeListId: 0
            };
            component.authAccess.update = true;
            component.editFeeList(feeList);
            tick();
            expect(component.loadingFeeList).toBe(true);
        }));
        it('should set loadingFeeList to true', fakeAsync(() => {
            let feeList = {
                FeeListId: 0
            };
            component.authAccess.update = true;
            component.editFeeList(feeList);
            tick();
            expect(component.dataForCrudOperation.EditMode).toBe(true);
        }));

        it('should call feeListsService.getById', fakeAsync(() => {
            let feeList = {
                FeeListId: 0
            };
            component.authAccess.update = true;
            component.feeListsArray = feeListsInputMock;
            component.editFeeList(feeList);
            tick();
            expect(mockFeeListService.getById).toHaveBeenCalledWith(feeList);
        }));
        it('should call feeListsService.getById with FeeListId if loadingFeeList is false', fakeAsync(() => {
            mockFeeListService.getById = jasmine.createSpy().and.returnValue(new Observable<SoarResponse<FeeListDto>>());
            component.authAccess.update = true;
            component.loadingFeeList = false;
            let feeLists = res.Value;
            let feeList = feeLists[0];
            component.editFeeList(feeList.feeListId);
            tick();
            expect(component.dataForCrudOperation.EditMode).toBe(true);
            expect(component.loadingFeeList).toBe(true);
        }));

        it('should not call FeeList with FeeListId if loadingFeeList is true', fakeAsync(() => {
            component.authAccess.update = true;
            component.loadingFeeList = true;
            let feeLists = res.Value;
            let feeList = feeLists[0];
            component.editFeeList(feeList.FeeListId);
            tick();
            expect(mockFeeListService.getById).not.toHaveBeenCalled();
            expect(component.dataForCrudOperation.EditMode).toBe(false);
            expect(component.loadingFeeList).toBe(true);
        }));
    })

    describe('editFeeList function if authAccess.Edit is false or loadingFeeList is true -> ', () => {

        beforeEach(() => {
            let feeList = {
                FeeListId: 0
            };
            component.dataForCrudOperation = {
                SaveAsDraft: true,
                EditMode: false,
                ViewOnly: false,
                Create: false,
                BackupFeeList: {},
                DataHasChanged: false,
                DraftDataHasChanged: false,
                BreadCrumbs: [],
                FeeList: {
                    FeeListId: 0,
                    ServiceCodes: mockServiceCodes
                }
            }
            component.loadingFeeList = false;
            component.authAccess.update = true;
            feeList = cloneDeep(feeListsInputMock[0]);

            mockFeeListService.getById = jasmine.createSpy().and.returnValue(of({ Value: { ServiceCodes: [] } }));
        })

        it('should not call feeListsService.getById', fakeAsync(() => {
            let feeList = {
                FeeListId: 0
            };
            component.authAccess.update = true;
            component.editFeeList(feeList.FeeListId);
            tick();
            expect(mockFeeListService.getById).not.toHaveBeenCalledWith();
        }));
    })

    describe('deleteFeeList function if authAccess.Delete is false  -> ', () => {
        beforeEach(() => {
            let feeList = {
                FeeListId: 0
            };
            component.dataForCrudOperation = {
                SaveAsDraft: true,
                EditMode: false,
                ViewOnly: false,
                Create: false,
                BackupFeeList: {},
                DataHasChanged: false,
                DraftDataHasChanged: false,
                BreadCrumbs: [],
                FeeList: {
                    FeeListId: 0,
                    ServiceCodes: mockServiceCodes
                }
            }
            component.authAccess.delete = false;
            component.feeListsArray = feeListsInputMock;
            feeList = cloneDeep(feeListsInputMock[0]);
        })

        it('should not call feeListsService.get', () => {
            let feeList = {
                FeeListId: 0
            };
            mockFeeListService.get = jasmine.createSpy().and.returnValue(new Observable<SoarResponse<FeeListLocationDTO[]>>());
            component.authAccess.delete = false;
            component.deleteFeeList(feeList.FeeListId);
            expect(mockFeeListService.get).not.toHaveBeenCalled();
        });
    });

    describe('deleteFeeList function if authAccess.Delete is true  -> ', () => {
        beforeEach(() => {
            let feeList = {
                FeeListId: 0
            };
            component.dataForCrudOperation = {
                SaveAsDraft: true,
                EditMode: false,
                ViewOnly: false,
                Create: false,
                BackupFeeList: {},
                DataHasChanged: false,
                DraftDataHasChanged: false,
                BreadCrumbs: [],
                FeeList: {
                    FeeListId: 0,
                    ServiceCodes: mockServiceCodes
                }
            }
            component.authAccess.delete = false;
            component.feeListsArray = feeListsInputMock;
            feeList = cloneDeep(feeListsInputMock[0]);
        })


        it('should call feeListsService.getFeeLists', () => {
            let feeList = {
                FeeListId: 0
            };
            mockFeeListService.get = jasmine.createSpy().and.returnValue(new Observable<SoarResponse<FeeListLocationDTO[]>>());
            component.authAccess.delete = true;
            component.deleteFeeList(feeList.FeeListId);
            expect(mockFeeListService.get).toHaveBeenCalled();
        });
    });

    describe('handleFeeListToDeleteResponseSuccess', () => {
        it('should call confirmNoDelete when selectedFeeList has data', () => {
            let feeList = {
                FeeListId: 1
            };
            let feeListData: FeeListLocationDTO[] = [{
                FeeListId: 1, Name: 'Test1', DraftDate: "", Locations: [{
                    Key: 1,
                    Value: 'testLoc',
                }]
            }, { FeeListId: 3, Name: 'Test3', DraftDate: "", Locations: [] }]
            let feeLists: SoarResponse<FeeListLocationDTO[]> = { Value: feeListData };
            spyOn(component, 'confirmNoDelete');
            component.handleFeeListToDeleteResponseSuccess(feeLists, feeList.FeeListId);
            expect(component.confirmNoDelete).toHaveBeenCalledWith(feeLists.Value[0]);
        });

        it('should not call confirmDelete when selectedFeeList exist with no locations', () => {
            let feeList = {
                FeeListId: 1
            };
            let feeListData: FeeListLocationDTO[] = [{ FeeListId: 1, Name: 'Test1', DraftDate: "", Locations: [] }, {
                FeeListId: 3, Name: 'Test3', DraftDate: "", Locations: [{
                    Key: 1,
                    Value: 'testLoc3',
                }]
            }]
            let feeLists: SoarResponse<FeeListLocationDTO[]> = { Value: feeListData };
            spyOn(component, 'confirmDelete');
            component.handleFeeListToDeleteResponseSuccess(feeLists, feeList.FeeListId);
            expect(component.confirmDelete).toHaveBeenCalledWith(feeLists.Value[0]);
        });
    });

    describe('handleFeeListToDeleteResponseError', () => {
        it('should call mocktoastrFactory error when handleFeeListToDeleteResponseError called', () => {
            component.handleFeeListToDeleteResponseError();
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })
    });

    describe('confirmDelete function  -> ', () => {
        it('should call modalFactory.ConfirmModal', () => {
            let feeList = {
                FeeListId: 0,
                Locations: []
            };
            component.confirmDelete(feeList);
            expect(mockModalFactory.ConfirmModal).toHaveBeenCalled();
            mockModalFactory.ConfirmModal = jasmine.createSpy().and.returnValue({
                then: jasmine.createSpy().and.returnValue(null)
            });
        });
    });

    describe('confirmNoDelete function  -> ', () => {
        it('should call modalFactory.ConfirmModal', () => {
            let feeList = {
                FeeListId: 0,
                Locations: [{
                    Key: 1,
                    Value: 'testLoc',
                }]
            };
            component.confirmNoDelete(feeList);
            expect(mockModalFactory.ConfirmModal).toHaveBeenCalled();
            mockModalFactory.ConfirmModal = jasmine.createSpy().and.returnValue({
                then: jasmine.createSpy().and.returnValue(null)
            });
        });
    })

    describe('deleteConfirmed function  -> ', () => {
        it('should call modalFactory.ConfirmModal', () => {
            let feeList = {
                FeeListId: 0,
                Locations: []
            };
            component.deleteConfirmed(feeList);
            expect(mockFeeListService.delete).toHaveBeenCalledWith(feeList);
        });
    });

    describe('confirmNoDelete function  -> ', () => {
        it('should call modalFactory.ConfirmModal', () => {
            let feeList = {
                FeeListId: 0,
                Locations: [{
                    Key: 1,
                    Value: 'testLoc',
                }]
            };
            component.confirmDeleteFeeListDraft(feeList);
            expect(mockModalFactory.ConfirmModal).toHaveBeenCalled();
        });
    })

    describe('deleteFeeListDraftConfirmed function  -> ', () => {
        it('should call modalFactory.ConfirmModal', () => {
            let feeList = cloneDeep(feeListsInputMock[0]);
            feeList.Locations = [];
            component.deleteFeeListDraftConfirmed(feeList);
            expect(mockFeeListService.deleteDraft).toHaveBeenCalledWith(feeList);
        });
    });

    describe('navigateToLanding function  -> ', () => {
        it('should call navigateToLanding method', () => {
            let name = mocklocalize.getLocalizedString();
            component.navigateToLanding(name);
            expect(mocklocalize.getLocalizedString()).toEqual(name);
        });

        it('should call resetDataForCrud', () => {
            const resetDataForCrudSpy = spyOn(component, 'resetDataForCrud');
            let name = mocklocalize.getLocalizedString();
            component.navigateToLanding(name);
            component.resetDataForCrud();
            expect(resetDataForCrudSpy).toHaveBeenCalled();
        });
    });

    //deleteFeeListDraft
    describe('deleteFeeListDraft -->', () => {
        it('should call deleteFeeListDraft method if authAccess.Delete is true  ->', fakeAsync(() => {
            component.authAccess.delete = true;
            component.handleFeeListsToDeleteDraftResponseSuccess = jasmine.createSpy();
            mockFeeListService.get.and.returnValue(of(res));
            component.loadingFeeList = true;
            component.deleteFeeListDraft();
            tick();
            expect(component.loadingFeeList).toBe(false);
            expect(mockFeeListService.get).toHaveBeenCalled();
            expect(component.handleFeeListsToDeleteDraftResponseSuccess).toHaveBeenCalled();
        }));

        it('should call deleteFeeListDraft data and execute error method', fakeAsync(() => {
            component.authAccess.delete = true;
            let errorResponse = new HttpErrorResponse({
                error: 'test 404 error',
                status: 404, statusText: 'Not Found'
            });
            component.handleFeeListToDeleteDraftResponseError = jasmine.createSpy();
            mockFeeListService.get.and.returnValue(throwError(errorResponse));
            component.deleteFeeListDraft();
            tick();
            expect(mockFeeListService.get).toHaveBeenCalled();
            expect(component.handleFeeListToDeleteDraftResponseError).toHaveBeenCalled();
        }));
    });

    describe('handleFeeListsToDeleteDraftResponseSuccess', () => {
        it('should call confirmDeleteFeeListDraft when selectedFeeList exists', () => {
            let feeList = {
                FeeListId: 1
            };
            let feeListData: FeeListLocationDTO[] = [{ FeeListId: 1, Name: 'Test1', DraftDate: "" }, { FeeListId: 2, Name: 'Test2', DraftDate: "" }]
            let feeLists: SoarResponse<FeeListLocationDTO[]> = { Value: feeListData };
            spyOn(component, 'confirmDeleteFeeListDraft');
            component.handleFeeListsToDeleteDraftResponseSuccess(feeLists, feeList.FeeListId);
            expect(component.confirmDeleteFeeListDraft).toHaveBeenCalledWith(component.dataForCrudOperation.FeeList);
        });

        it('should not call confirmDeleteFeeListDraft when selectedFeeList does not exist', () => {
            let feeList = {
                FeeListId: 1
            };
            let feeListData: FeeListLocationDTO[] = [{ FeeListId: 2, Name: 'Test2', DraftDate: "" }, { FeeListId: 3, Name: 'Test3', DraftDate: "" }]
            let feeLists: SoarResponse<FeeListLocationDTO[]> = { Value: feeListData };
            spyOn(component, 'confirmDeleteFeeListDraft');
            component.handleFeeListsToDeleteDraftResponseSuccess(feeLists, feeList.FeeListId);
            expect(component.confirmDeleteFeeListDraft).not.toHaveBeenCalled();
        });
    });

    describe('handleFeeListToDeleteDraftResponseError', () => {
        it('should call mocktoastrFactory error when handleFeeListToDeleteDraftResponseError called', () => {
            component.handleFeeListToDeleteDraftResponseError();
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })
    });

    //initNewFeeList
    describe('initNewFeeList -->', () => {
        it('should call initNewFeeList to get fee list data and execute success method', fakeAsync(() => {
            component.authAccess.create = true;
            component.handleFeeListInitNewSuccess = jasmine.createSpy();
            mockFeeListService.new.and.returnValue(of(res));
            component.dataForCrudOperation.Create = true;
            component.loadingFeeList = true;
            component.initNewFeeList();
            tick();
            expect(component.loadingFeeList).toBe(false);
            expect(mockFeeListService.new).toHaveBeenCalled();
            expect(component.handleFeeListInitNewSuccess).toHaveBeenCalled();
        }));

        it('should call initNewFeeList and execute error method', fakeAsync(() => {
            component.authAccess.create = true;
            let errorResponse = new HttpErrorResponse({
                error: 'test 404 error',
                status: 404, statusText: 'Not Found'
            });
            component.handleFeeListInitNewError = jasmine.createSpy();
            mockFeeListService.new.and.returnValue(throwError(errorResponse));
            component.initNewFeeList();
            tick();
            expect(mockFeeListService.new).toHaveBeenCalled();
            expect(component.handleFeeListInitNewError).toHaveBeenCalled();
        }));
    });

    describe('handleFeeListInitNewSuccess', () => {
        it('should call handleFeeListInitNewSuccess when FeeList exists', () => {
            let isCreateMode = true;
            component.taxableServices = [
                { Id: 1, Name: 'TaxableService1' },
                { Id: 2, Name: 'TaxableService2' },
            ];
            let feeListData: FeeListDto = { FeeListId: 1, Name: 'Test1', PublishDate: null, DraftDate: dummyData.FeeList.DraftDate, ServiceCodes: dummyData.FeeList.ServiceCodes, DataTag: "" }
            let feeLists: SoarResponse<FeeListDto> = { Value: feeListData };
            component.dataForCrudOperation.FeeList = feeLists.Value;
            component.dataForCrudOperation.BackupFeeList = cloneDeep(feeListData);
            component.handleFeeListInitNewSuccess(feeLists, isCreateMode);
            component.dataForCrudOperation.FeeList.ServiceCodes.forEach((sc) => {
                expect(sc.CdtCodeName).toBeDefined();
                expect(sc.$$TaxableServiceTypeName).toBeDefined();
            });
            expect(component.editOrViewMode).toBe(isCreateMode);
            expect(component.loadingFeeList).toBe(false);
            expect(component.breadCrumbs.length).toBe(3);
        });
    });

    describe('handleFeeListInitNewError', () => {
        it('should call mocktoastrFactory error when handleFeeListInitNewError called', () => {
            component.handleFeeListInitNewError();
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })
    });

    //editFeeList
    describe('editFeeList -->', () => {
        let feeList = {
            FeeListId: 0,
            Locations: []
        };
        it('should call editFeeList to update fee list data and execute success method', fakeAsync(() => {
            component.authAccess.update = true;
            component.dataForCrudOperation.EditMode = true;
            component.handleEditFeeListSuccess = jasmine.createSpy();
            mockFeeListService.getById.and.returnValue(of(res));
            component.editFeeList(feeList.FeeListId);
            tick();
            expect(component.loadingFeeList).toBe(false);
            expect(mockFeeListService.getById).toHaveBeenCalled();
            expect(component.handleEditFeeListSuccess).toHaveBeenCalled();
        }));

        it('should call editFeeList and execute error method', fakeAsync(() => {
            component.authAccess.update = true;
            let errorResponse = new HttpErrorResponse({
                error: 'test 404 error',
                status: 404, statusText: 'Not Found'
            });
            component.handleEditFeeListError = jasmine.createSpy();
            mockFeeListService.getById.and.returnValue(throwError(errorResponse));
            component.editFeeList(feeList.FeeListId);
            tick();
            expect(mockFeeListService.getById).toHaveBeenCalled();
            expect(component.handleEditFeeListError).toHaveBeenCalled();
        }));
    });

    describe('handleEditFeeListSuccess', () => {
        it('should call handleEditFeeListSuccess when FeeList exists', () => {
            component.taxableServices = [{ Id: 3, Name: 'Test1' }];
            let isCreateMode = true;
            let feeListData: FeeListDto = { FeeListId: 1, Name: 'Test1', PublishDate: null, DraftDate: dummyData.FeeList.DraftDate, ServiceCodes: dummyData.FeeList.ServiceCodes, DataTag: "" }
            let backupFeeListData = cloneDeep(feeListData);
            let feeLists: SoarResponse<FeeListDto> = { Value: feeListData };
            component.handleEditFeeListSuccess(feeLists, isCreateMode);
            expect(component.dataForCrudOperation.FeeList).toBe(feeListData);
            expect(component.dataForCrudOperation.BackupFeeList).toEqual(backupFeeListData);
            component.dataForCrudOperation.FeeList.ServiceCodes.forEach((sc) => {
                expect(sc.CdtCodeName).toBeDefined();
                expect(sc.$$TaxableServiceTypeName).toBeDefined();
            });
            expect(component.editOrViewMode).toBe(isCreateMode);
            expect(component.loadingFeeList).toBe(false);
        });
    });

    describe('handleEditFeeListError', () => {
        it('should call mocktoastrFactory error when handleEditFeeListError called', () => {
            component.handleEditFeeListError();
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })
    });
});
