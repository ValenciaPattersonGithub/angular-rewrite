import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { configureTestSuite } from 'src/configure-test-suite';
import { By } from '@angular/platform-browser';
import { DebugElement, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ServiceCodeSearchComponent } from './service-code-search.component';
import { BoldTextIfContainsPipe, Search1Pipe } from 'src/@shared/pipes';
import { AppCheckBoxComponent } from 'src/@shared/components/form-controls/check-box/check-box.component';
import { cloneDeep } from 'lodash';
import { GridModule, PageChangeEvent } from '@progress/kendo-angular-grid';
import { SwiftpickCodeCrudComponent } from '../swiftpick-code-crud/swiftpick-code-crud.component';
import { DialogContainerService, DialogService } from '@progress/kendo-angular-dialog';
import { ServiceCodesService } from 'src/@shared/providers/service-codes.service';
import { ServiceCodeModel } from '../service-code-model';
import { ServiceCodeSearchInitialDataService } from '../service-code-search-initial-data.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PreventiveCareService } from 'src/@shared/providers/preventive-care.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

//mockServiceCode data which we are going to set service codes data
let mockServiceCodes: ServiceCodeModel[];
//to set initial data
let tempInitialData;
let mockLocalizeService;
let mockServiceCodesService;
let mockChartingFavoritesFactory;
let mockReferenceDataService;
let mockToastrFactory;
let mockPatSecurityService;
let mockReportsFactory;
let mockModalFactory;
let mockLocation;
let mockPreventiveCareService;
let mockServiceCodeSearchInitialDataService;
//Using below object to add/update new single record to add in existing data
let newServiceCode;
// mock for boundObjectFactory
let mockBoundObjectFactory;

describe('ServiceCodeSearchComponent', () => {
    let component: ServiceCodeSearchComponent;
    let fixture: ComponentFixture<ServiceCodeSearchComponent>;
    //Implemented SwiftpickCodeCrudComponent as we need to access properties and methods from SwiftpickCodeCrudComponent
    let SwiftpickCodeCrudComponentInstance: SwiftpickCodeCrudComponent;
    let swiftCodeCrudFixture: ComponentFixture<SwiftpickCodeCrudComponent>;
    let de: DebugElement;

    beforeEach(() => {
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
                AffectedAreaId: 1,
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
                UsuallyPerformedByProviderTypeId: 1,
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
                AffectedAreaId: 1010,
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
                UsuallyPerformedByProviderTypeId: 1,
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

        //to set initial data
        tempInitialData = {
            ServiceCodes: [{
                ServiceCodeId: 1,
                CdtCodeId: 1,
                Code: 'myCode',
                Description: 'myDescription',
                ServiceTypeId: 1,
                DisplayAs: 'customName',
                Fee: '10.6',
                TaxableServiceTypeId: 0,
                AffectedAreaId: 0,
                UsuallyPerformedByProviderTypeId: '',
                UseCodeForRangeOfTeeth: false,
                SetsToothAsMissing: false,
                IsActive: true,
                IsEligibleForDiscount: false,
                Notes: 'myNotes',
                SubmitOnInsurance: true,
                IconName: null,
                UseSmartCodes: false,
                SmartCode1Id: null,
                SmartCode2Id: null,
                SmartCode3Id: null,
                SmartCode4Id: null,
                SmartCode5Id: null,
            }],
            ServiceTypes: [
                { "ServiceTypeId": "1", "IsSystemType": true, "Description": "Adjunctive General Services", "IsAssociatedWithServiceCode": false },
                { "ServiceTypeId": "c44c441e-d3c5-47ff-83b3-617e7c59804c", "IsSystemType": false, "Description": "custom servicetype", "IsAssociatedWithServiceCode": false },
                { "ServiceTypeId": "9f8e66fa-350b-4970-8dfa-873a69e7f10f", "IsSystemType": false, "Description": "custom servicetype2", "IsAssociatedWithServiceCode": false },
                { "ServiceTypeId": "cc08eb08-425d-43af-9d9d-ce976a208489", "IsSystemType": true, "Description": "Diagnostic", "IsAssociatedWithServiceCode": false }
            ],
            TaxableServices: [
                { "Id": 0, "Name": "Not A Taxable Service", "Order": 1, "IsVisible": false, "IsActive": false },
                { "Id": 1, "Name": "Provider", "Order": 2, "IsVisible": false, "IsActive": false },
                { "Id": 2, "Name": "Sales and Use", "Order": 3, "IsVisible": false, "IsActive": false }
            ],
            AffectedAreas: [
                { "Id": 0, "Name": "Mouth", "Order": 1, "IsVisible": false, "IsActive": false },
                { "Id": 1, "Name": "Quadrant", "Order": 2, "IsVisible": false, "IsActive": false },
                { "Id": 2, "Name": "Root", "Order": 3, "IsVisible": false, "IsActive": false },
                { "Id": 3, "Name": "Surface", "Order": 4, "IsVisible": false, "IsActive": false },
                { "Id": 4, "Name": "Tooth", "Order": 5, "IsVisible": false, "IsActive": false }
            ],
            DrawTypes: [
                { DrawTypeId: "0", Description: "DrawTypeOne", AffectedAreaId: 5, DrawType: "Static" },
                { DrawTypeId: "1", Description: "DrawTypeTwo", AffectedAreaId: 4, DrawType: "Static" },
                { DrawTypeId: "0", Description: "DrawTypeThree", AffectedAreaId: 5, DrawType: "Static" },
                { DrawTypeId: "2", Description: "DrawTypeFour", AffectedAreaId: 3, DrawType: "Static" }
            ],
            ProviderTypes: [
                { "ProviderTypeId": 4, "Id": 4, "Name": "Not a Provider", "Order": 1, "IsAppointmentType": false },
                { "ProviderTypeId": 1, "Id": 1, "Name": "Dentist", "Order": 2, "IsAppointmentType": true },
                { "ProviderTypeId": 2, "Id": 2, "Name": "Hygienist", "Order": 3, "IsAppointmentType": true },
                { "ProviderTypeId": 3, "Id": 3, "Name": "Assistant", "Order": 4, "IsAppointmentType": false },
                { "ProviderTypeId": 5, "Id": 5, "Name": "Other", "Order": 5, "IsAppointmentType": false }
            ],
            PreventiveServices: {
                values: [{
                    DataTag: "DataTag",
                    DateModified: "DateModified",
                    FailedMessage: "FailedMessage",
                    PreventiveServiceId: "1",
                    PreventiveServiceTypeId: "PreventiveServiceTypeId",
                    ServiceCodeId: "ServiceCodeId",
                    UserModified: "",
                    Description: "Description"
                }]
            },
            Favorites: {
                values: [{
                    DataTag: "DataTag",
                    DateModified: "DateModified",
                    FailedMessage: "FailedMessage",
                    PreventiveServiceId: "1",
                    PreventiveServiceTypeId: "PreventiveServiceTypeId",
                    ServiceCodeId: "ServiceCodeId",
                    UserModified: "",

                }]
            },
            SwiftCodes: {
                values: [{ "ServiceCodeId": "00000000-0000-0000-0000-000000000001" },
                { "ServiceCodeId": "00000000-0000-0000-0000-000000000002" }]
            }
        };

        mockLocalizeService = {
            getLocalizedString: () => 'translated text'
        };

        mockServiceCodesService = {
            getSwiftCodesAttachedToServiceCode: (serviceCodeId) => {
                return {
                    then: (res) => {
                        res({ Value: mockServiceCodes })
                    }
                }
            },
            UpdateServiceCodes: (accessCode) => {
                return {
                    then: (res) => {
                        if (accessCode?.length > 0) {
                            res({ Value: accessCode })
                        }
                        else {
                            res({ accessCode })
                        }
                    }
                }
            }
        }

        mockChartingFavoritesFactory = {
            GetAllFavoritesContainingServiceId: jasmine.createSpy().and.callFake(() => {
                return {
                    $promise: {
                        then(res: any) {

                        }
                    }
                };
            }),
        }

        mockReferenceDataService = {
            get: jasmine.createSpy().and.returnValue([]),
            forceEntityExecution: jasmine.createSpy().and.returnValue([]),
            setFeesByLocation: (objData) => {
                return objData;
            },
            entityNames: {
                serviceCodes: mockServiceCodes
            }
        }

        mockToastrFactory = {
            success: jasmine.createSpy('toastrFactory.success'),
            error: jasmine.createSpy('toastrFactory.error')
        };

        mockPatSecurityService = {
            // IsAuthorizedByAbbreviation: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true),
            IsAuthorizedByAbbreviation: (AccessCode) => {
                if (AccessCode == "soar-biz-bsvccd-view") {
                    return false;
                }
                else if (AccessCode == "soar-biz-bsvccd-view" || AccessCode == "soar-biz-bsvccd-add" || AccessCode == "soar-biz-bsvccd-aswift" || AccessCode == "soar-biz-bsvccd-edit" || AccessCode == "soar-biz-bsvccd-view" || AccessCode == "soar-report-report-view" || AccessCode == "soar-biz-bizusr-vchbtn") {
                    return true;
                }
                else {
                    return false;
                }

            },
            generateMessage: jasmine.createSpy('patSecurityService.generateMessage')
        };

        mockReportsFactory = {
            GetReportArray: jasmine.createSpy('[17]'),
            OpenReportPage: jasmine.createSpy()
        };

        mockModalFactory = {
            CancelModal: jasmine.createSpy('ModalFactory.CancelModal').and.returnValue({ then: (res) => { res(true) } }),
            ConfirmModal: jasmine.createSpy('ModalFactory.ConfirmModal').and.returnValue({ then: () => { } })
        }

        mockLocation = {
            path: jasmine.createSpy().and.returnValue('/')
        };

        mockPreventiveCareService = {
            GetPreventiveServicesForServiceCode: (mockServiceCodes) => {
                return {
                    then: (res) => {
                        res({ Value: mockServiceCodes })
                    }
                }
            },
            accessForServiceCode: jasmine.createSpy(),
        }

        mockServiceCodeSearchInitialDataService = {
            serviceCodeSearchInitialData: jasmine.createSpy()
                .and.returnValue(Promise.resolve(tempInitialData))
        };
        //Using below object to add/update new single record to add in existing data
        newServiceCode = {
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
            $$UsuallyPerformedByProviderTypeName: "Dentist3",
            $$hashKey: "object:885",
            $$locationFee: 0,
            $$locationTaxableServiceTypeId: 1,
            $$serviceTransactionFee: 0,
            AffectedAreaId: 1,
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
            DrawTypeId: null,
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
            ServiceCodeId: "99999",
            ServiceTypeDescription: "01111tes",
            ServiceTypeId: "b1a248f8-4200-4248-bf04-697a66b95724",
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
            UsuallyPerformedByProviderTypeId: 1,
            UsuallyPerformedByProviderTypeName: null,
        }
        // mock for boundObjectFactory
        mockBoundObjectFactory = {
            Create: jasmine.createSpy().and.returnValue({
                AfterDeleteSuccess: null,
                AfterSaveError: null,
                AfterSaveSuccess: null,
                Data: {},
                Deleting: false,
                IdField: "ServiceCodeId",
                Loading: true,
                Name: "ServiceCode",
                Saving: false,
                Valid: true,
                Load: jasmine.any(Function),
                Save: jasmine.createSpy().and.returnValue(''),
                Validate: jasmine.createSpy().and.returnValue(''),
                CheckDuplicate: jasmine.createSpy().and.returnValue('')
            })
        };
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                TranslateModule.forRoot(),
                FormsModule, GridModule,
                HttpClientTestingModule,
                NoopAnimationsModule, // Required import for AnimationBuilder
            ],
            providers: [
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: 'toastrFactory', useValue: mockToastrFactory },
                { provide: 'patSecurityService', useValue: mockPatSecurityService },
                { provide: '$location', useValue: mockLocation },
                { provide: 'ReportsFactory', useValue: mockReportsFactory },
                { provide: 'ModalFactory', useValue: mockModalFactory },
                { provide: PreventiveCareService, useValue: mockPreventiveCareService },
                { provide: 'ChartingFavoritesFactory', useValue: mockChartingFavoritesFactory },
                { provide: 'referenceDataService', useValue: mockReferenceDataService },
                Search1Pipe, DialogService, DialogContainerService,
                { provide: 'BoundObjectFactory', useValue: mockBoundObjectFactory },
                { provide: 'PatCacheFactory', useValue: {} },
                { provide: 'ServiceCodeCrudService', useValue: {} },
                { provide: ServiceCodesService, useValue: mockServiceCodesService },
                { provide: ServiceCodeSearchInitialDataService, useValue: mockServiceCodeSearchInitialDataService },
                { provide: 'SoarConfig', useValue: {} }
            ],
            declarations: [ServiceCodeSearchComponent, AppCheckBoxComponent, BoldTextIfContainsPipe, SwiftpickCodeCrudComponent
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        });
    });

    // beforeEach(async () => {
    //     await TestBed.configureTestingModule({
    //         declarations: [ServiceCodeSearchComponent]
    //     })
    //         .compileComponents();
    // });

    beforeEach(() => {
        fixture = TestBed.createComponent(ServiceCodeSearchComponent);
        component = fixture.componentInstance;
        swiftCodeCrudFixture = TestBed.createComponent(SwiftpickCodeCrudComponent);
        SwiftpickCodeCrudComponentInstance = swiftCodeCrudFixture.componentInstance;
        component.dataForCrudOperation.TaxableServices = tempInitialData.TaxableServices;
        component.dataForCrudOperation.AffectedAreas = tempInitialData.AffectedAreas;
        component.dataForCrudOperation.DrawTypes = tempInitialData.DrawTypes;
        component.dataForCrudOperation.ServiceCode = tempInitialData.ServiceCodes;
        component.dataForCrudOperation.ServiceTypes = tempInitialData.ServiceTypes;

        component.serviceCodes = mockServiceCodes;
        component.swiftPickCrud = SwiftpickCodeCrudComponentInstance;
        fixture.detectChanges();
        de = fixture.debugElement;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    //ngOnInit
    describe('ngOnInit ->', () => {
        it('should call a getPageNavigation method', () => {
            component.getPageNavigation = jasmine.createSpy();
            component.ngOnInit();
            expect(component.getPageNavigation).toHaveBeenCalled();
        });

        it('should call the authViewAccess method ', () => {
            component.authViewAccess = jasmine.createSpy();
            component.ngOnInit();
            expect(component.authViewAccess).toHaveBeenCalled();
        });

        it('should call the getReports method ', () => {
            component.getReports = jasmine.createSpy();
            component.ngOnInit();
            expect(component.getReports).toHaveBeenCalled();
        });

        it('should load initilize data on init ', () => {
            component.getReports = jasmine.createSpy();
            component.ngOnInit();
            expect(component.dataForCrudOperation.AffectedAreas.length).toBeGreaterThan(0);

        });
    });

    //getPageNavigation
    describe('getPageNavigation function -> ', () => {
        it('should set the breadCrumbs property', () => {
            component.getPageNavigation();
            fixture.detectChanges();
            expect(component.breadCrumbs).not.toBeNull();
        });
    });

    //authViewAccess
    describe('authViewAccess function -> ', () => {
        it('should call notifyNotAuthorized when user is not authorized for view', () => {
            spyOn(component, "notifyNotAuthorized");
            component.viewServiceCodeAmfa = "soar-biz-bsvccd-add";
            component.authViewAccess();
            expect(component.notifyNotAuthorized).not.toHaveBeenCalled();

            component.viewServiceCodeAmfa = "soar-biz-bsvccd-view";
            component.authViewAccess();
            expect(component.notifyNotAuthorized).toHaveBeenCalledWith(component.viewServiceCodeAmfa);
        });
    });

    //notifyNotAuthorized
    describe('notifyNotAuthorized function -> ', () => {
        it('should call toastrFactory', () => {
            component.notifyNotAuthorized(component.viewServiceCodeAmfa);
            expect(mockToastrFactory.error).toHaveBeenCalled();
        });
    });

    //getReports
    describe('getReports function -> ', () => {
        it('should call getReports method', () => {
            component.hasReportAccess = true;
            component.getReports();
            expect(component.reports).not.toBeNull();

            component.reports = null;
            component.hasReportAccess = false;
            component.getReports();
            expect(component.reports).toBeNull();

        });
    });

    //selectedReportChange
    describe('selectedReportChange function -> ', () => {
        it('should call selectedReportChange method', () => {
            component.reports = [{ ReportTitle: '' }];
            component.selectedReportChange(17);
            expect(component.selectedReport.ReportId).toBe(0);
        });
    });

    //check changes on searchServiceCodesKeyword
    describe('onSearchServiceCodesKeywordChange function -> ', () => {
        it('should service codes based on the search keyword', fakeAsync(() => {
            spyOn(component, 'onSearchServiceCodesKeywordChange').and.callThrough();
            spyOn(component, 'filterServiceCodes').and.callThrough();
            component.serviceCodes = mockServiceCodes;
            component.filteringServices = false;

            const inputElement = fixture.debugElement.query(By.css('#searchBoxServiceCodes')).nativeElement;

            inputElement.value = 'test';
            inputElement.dispatchEvent(new Event('input'));

            tick();
            fixture.detectChanges();

            component.onSearchServiceCodesKeywordChange();

            fixture.whenStable().then(() => {
                expect(component.onSearchServiceCodesKeywordChange).toHaveBeenCalled();
            });
        }));
    });

    //assignCustomProperties
    describe('assignCustomProperties function -> ', () => {
        it('should accept serviceCodes and return updated service codes', () => {
            component.serviceCodes = mockServiceCodes;
            component.assignCustomProperties(component.serviceCodes);

            const updatedServiceCodes = component.serviceCodes;
            updatedServiceCodes[0].ServiceTypeDescription = 'Dummy description';

            expect(component.serviceCodes).toBe(updatedServiceCodes);
        });

        it('should take default data when current service code is null', () => {
            component.dataForCrudOperation.ServiceTypes = tempInitialData.ServiceTypes;
            component.dataForCrudOperation.AffectedAreas = tempInitialData.AffectedAreas;
            component.dataForCrudOperation.UsuallyPerformedByProviderTypes = tempInitialData.ProviderTypes;
            component.assignCustomProperties();
        });
    });

    //showInactive checkbox checked/uncheked
    describe('onCheckChanged -> ', () => {
        it('should call onCheckChanged method when checkbox is checked/unchecked', () => {
            spyOn(component, 'filterServiceCodes');
            spyOn(component, 'onCheckChanged');
            const consentMessage = de.query(By.directive(AppCheckBoxComponent));
            const cmp = consentMessage.componentInstance;
            cmp.checkChanged.emit();
            expect(component.onCheckChanged).toHaveBeenCalled();
        });

        it('should set value from event and call filterServiceCodes method', () => {
            let event = {
                target: {
                    checked: true
                }
            }
            spyOn(component, 'filterServiceCodes');
            component.onCheckChanged(event);
            expect(component.allowInactive).toBe(event.target.checked);
            expect(component.filterServiceCodes).toHaveBeenCalled();
        });

    });

    //cancel service codes update
    describe('cancelUpdatedList -> ', () => {

        it('should cancel all the changes done to update service codes and open cancel modal', () => {
            spyOn(component, 'resetDataForInlineEdit');
            component.hasSoarAddSwiftAccess = false;
            component.cancelUpdatedList();
            expect(component.resetDataForInlineEdit).not.toHaveBeenCalled();

            component.hasSoarAddSwiftAccess = true;
            component.updatedServiceCodes = mockServiceCodes;

            component.cancelUpdatedList();

            expect(component.updatedServiceCodes.length).not.toBeNull();
            mockModalFactory.CancelModal().then(() => {
                expect(component.resetDataForInlineEdit).toHaveBeenCalledWith(true);
            });
        });

        it('should call closeAllRows method when none of the service code is edited', () => {
            component.updatedServiceCodes = [];
            spyOn(component, 'closeAllRows');
            component.hasSoarAddSwiftAccess = true;
            component.cancelUpdatedList();
            component.filteredServiceCodes = cloneDeep(mockServiceCodes);

            expect(component.updatedServiceCodes.length).toBe(0);
            expect(component.closeAllRows).toHaveBeenCalled();
            expect(component.updatedServiceCodesWithErrors.length).toBe(0);
            expect(component.updatingList).toBeFalsy();
        });


    });

    //resetDataForCrud
    describe('resetDataForCrud ->', () => {
        it('should reset dataForCrudOperation properties', () => {

            component.resetDataForCrud();

            expect(component.dataForCrudOperation.DataHasChanged).toEqual(false);
            expect(component.dataForCrudOperation.ShowServiceCodesList).toEqual(true);
            expect(component.dataForCrudOperation.ServiceCode).toBeNull();
        });
    });

    //click of update button
    describe('updatedList -> ', () => {
        it('open kendo edit view', fakeAsync(() => {
            component.updatingList = false;
            component.updateDisabled = false;
            spyOn(component, 'editAllRows').and.callThrough();
            component.filteredServiceCodes = cloneDeep(mockServiceCodes);
            const buttonElement = fixture.debugElement.query(By.css('#btnUpdateListUpdate')).nativeElement;
            buttonElement.dispatchEvent(new Event('click'));

            tick();
            fixture.detectChanges();
            component.hasSoarAddSwiftAccess = true;
            component.updatedList();

            expect(component.editAllRows).toHaveBeenCalled();
            expect(component.updatingList).toBe(true);
            expect(component.loadingServices).toBe(false);
        }));
        it('should not call edit rows method/execute code if not access', () => {
            spyOn(component, 'editAllRows');
            component.hasSoarAddSwiftAccess = false;
            component.updatedList();
            expect(component.editAllRows).not.toHaveBeenCalled();
        })
    });

    //Check edit access
    describe('authEditServiceCodeAccess -->', () => {
        it('should return authEditServiceCodeAccess status as true when key passed as soar-biz-bsvccd-edit"', () => {
            expect(component.editServiceCodeAmfa).toEqual("soar-biz-bsvccd-edit");
            expect(component.authEditServiceCodeAccess()).toBe(true);
        });

        it('should return authEditServiceCodeAccess status as false if different key', () => {
            component.editServiceCodeAmfa = "wrong-edit-key"
            component.authEditServiceCodeAccess();
            expect(component.authEditServiceCodeAccess()).toBe(false);
        });
    })

    //Check add authAddServiceCodeAccess
    describe('authAddServiceCodeAccess -->', () => {
        it('should return authAddServiceCodeAccess status', () => {
            expect(component.addServiceCodeAmfa).toEqual("soar-biz-bsvccd-add");
            expect(component.authAddServiceCodeAccess()).toBe(true);

            component.addServiceCodeAmfa = "wrong-add-key";
            expect(component.authAddServiceCodeAccess()).toBe(false);
        });
    })

    //Call initializeServiceCodeSearchData
    describe('initializeServiceCodeSearchData -->', () => {
        it('should call assignCustomProperties and filterServiceCodes methods', () => {
            spyOn(component, 'assignCustomProperties');
            spyOn(component, 'filterServiceCodes');
            component.initializeServiceCodeSearchData();
            expect(component.loadingServices).toBe(false);
            expect(component.assignCustomProperties).toHaveBeenCalled();
            expect(component.filterServiceCodes).toHaveBeenCalled();
        });
    })

    //Handle all createServiceCode scenarios
    describe('createServiceCode -->', () => {
        it('should check for authAddServiceCodeAccess access is enable', () => {
            expect(component.addServiceCodeAmfa).toEqual("soar-biz-bsvccd-add");
            component.createServiceCode();
            let accessServiceCode = component.authAddServiceCodeAccess();
            expect(accessServiceCode).toBe(true);
        });
        it('should set values from dataForCrudOperation for TaxableServices & AffectedAreas', () => {
            expect(component.addServiceCodeAmfa).toEqual("soar-biz-bsvccd-add");
            component.dataForCrudOperation.TaxableServices = tempInitialData.TaxableServices;
            component.dataForCrudOperation.AffectedAreas = tempInitialData.AffectedAreas;
            let accessServiceCode = component.authAddServiceCodeAccess();
            component.createServiceCode();
            expect(accessServiceCode).toBe(true);
        });
        it('should not allow to create service code if not access/wrong access key', () => {
            component.addServiceCodeAmfa = "wrong-key";
            let accessServiceCode = component.authAddServiceCodeAccess();
            component.dataForCrudOperation.TaxableServices = tempInitialData.TaxableServices;
            component.dataForCrudOperation.AffectedAreas = tempInitialData.AffectedAreas;
            component.createServiceCode();
            expect(accessServiceCode).toBe(false);
        });
    })

    //Save updated record
    describe('saveUpdatedList -->', () => {
        it('should save updated list when we update from grid', () => {
            component.hasSoarAddSwiftAccess = true;
            component.updatedServiceCodes = cloneDeep(mockServiceCodes);
            component.saveUpdatedList();
        });

        it('should save updated list when we update from grid', () => {
            component.hasSoarAddSwiftAccess = true;
            component.updatedServiceCodes = [];
            component.saveUpdatedList();
        });

        it('should set DrawTypeId as null when AffectedAreaId and $$OriginalAffectedAreaId is not equal', () => {
            spyOn(component, 'assignCustomProperties');
            spyOn(component, 'filterServiceCodes');
            component.filteredServiceCodes = cloneDeep(mockServiceCodes);
            component.updatedServiceCodes = cloneDeep(mockServiceCodes);
            component.updatedServiceCodes[1].AffectedAreaId = "1";
            component.updatedServiceCodes[1].OriginalAffectedAreaId = "2";
            component.updatedServiceCodes[1].DrawTypeId = "5";
            component.saveUpdatedList();
            expect(component.assignCustomProperties).toHaveBeenCalled();
        })

        it('should set loadingServices as false if no data returned from factory', () => {
            spyOn(component, "resetDataForInlineEdit");
            component.updatedServiceCodes = cloneDeep(mockServiceCodes);
            component.hasSoarAddSwiftAccess = true;
            component.saveUpdatedList();
            mockServiceCodesService.UpdateServiceCodes(mockServiceCodes).then((res) => {
                if (res && res.Value) {
                    expect(component.loadingServices).toBe(false);
                    expect(component.resetDataForInlineEdit).toHaveBeenCalledWith(false);
                }
                else {
                    expect(component.loadingServices).toBe(false);
                    expect(component.resetDataForInlineEdit).not.toHaveBeenCalled();
                }
            })
        })

        it('should not call any methods if no access (hasSoarAddSwiftAccess = false)', () => {
            component.hasSoarAddSwiftAccess = false;
            component.saveUpdatedList();
            expect(component.loadingServices).toBe(false);
        })
    })

    //resetDataForInlineEdit
    describe('resetDataForInlineEdit -->', () => {
        it('should set data from backupdata', () => {
            spyOn(component, 'assignCustomProperties');
            spyOn(component, 'filterServiceCodes');
            component.backupServiceCodes = cloneDeep(mockServiceCodes);
            component.resetDataForInlineEdit(true);
        })
    })

    //Check updated record is saving as mentioned
    describe('serviceCodeUpdated -->', () => {
        it('should updated exisiting record by on the basis of service code', () => {
            spyOn(component, 'assignCustomProperties');
            spyOn(component, 'filterServiceCodes');
            component.serviceCodes = mockServiceCodes;
            component.backupServiceCodes = mockServiceCodes;
            let tempUpdatedRecords = cloneDeep(mockServiceCodes[0]);
            tempUpdatedRecords.CPT = "NewCPTCode";
            component.serviceCodeUpdated(tempUpdatedRecords);
            expect(mockServiceCodes[0].CPT).toEqual("NewCPTCode");
        });

        it('should call resetDataForCrud if no data to update', () => {
            spyOn(component, 'resetDataForCrud');
            component.serviceCodeUpdated(null);
            expect(component.resetDataForCrud).toHaveBeenCalled();
        });

        it('should updated exisiting record by on the basis of service code including swift code', () => {
            spyOn(component, 'assignCustomProperties');
            spyOn(component, 'filterServiceCodes');
            component.serviceCodes = mockServiceCodes;
            component.backupServiceCodes = mockServiceCodes;
            let tempUpdatedRecords = cloneDeep(mockServiceCodes[2]);
            tempUpdatedRecords.CompleteDescription = "Complete Description";
            component.serviceCodeUpdated(tempUpdatedRecords);
            expect(mockServiceCodes[2].CompleteDescription).toEqual("Complete Description");
        });

        it('should not splice records if serviceCodes and backupServiceCodes if null', () => {
            component.serviceCodes = [];
            component.backupServiceCodes = [];
            let tempUpdatedRecords = cloneDeep(mockServiceCodes[2]);
            tempUpdatedRecords.CompleteDescription = "Complete Description";
            component.serviceCodeUpdated(tempUpdatedRecords);
        });
    })

    //changeFilter 
    describe('changeFilter -->', () => {
        it('set updateDisabled is true when filterServiceList set to "Swift Code"', () => {
            spyOn(component, 'filterServiceCodes');
            component.changeFilter("Swift Code");
            expect(component.updateDisabled).toBe(true);
            expect(component.filterServiceCodes).toHaveBeenCalled();
        })

        it('set updateDisabled is true when filterServiceList set to "Service Code" or blank or null', () => {
            spyOn(component, 'filterServiceCodes');
            component.changeFilter(null);
            expect(component.updateDisabled).toBe(false);
            expect(component.filterServiceCodes).toHaveBeenCalled();

            component.changeFilter("");
            expect(component.updateDisabled).toBe(false);
            expect(component.filterServiceCodes).toHaveBeenCalled();

            component.changeFilter("Service Code");
            expect(component.updateDisabled).toBe(false);
            expect(component.filterServiceCodes).toHaveBeenCalled();
        })
    })

    //editOptionClicked
    describe('editOptionClicked -->', () => {
        beforeEach(() => {
            spyOn(component, "editServiceCode");
        })
        it('should open swift code dialog on edit of swift code', () => {
            let tempSwiftCodeRowData = {
                dataItem: mockServiceCodes[2]
            }
            component.editOptionClicked(tempSwiftCodeRowData);
            expect(component.swiftPickCrud.editMode).toBe(true);
        })
        it('should open service code dialog on edit of service code', () => {
            let tempSwiftCodeRowData = {
                dataItem: mockServiceCodes[0]
            }
            component.editOptionClicked(tempSwiftCodeRowData);
            expect(component.editServiceCode).toHaveBeenCalled();
        })
        it('should not open service as well as swift code dialog if data is null', () => {
            let tempSwiftCodeRowData = {
                dataItem: null
            }
            component.editOptionClicked(tempSwiftCodeRowData);
            expect(component.editServiceCode).not.toHaveBeenCalled();
        })
    })

    //On createSwiftPickCode
    describe('createSwiftPickCode -->', () => {
        it('should open swift code page on add new Swift Code with access check', () => {
            spyOn(component.swiftPickCrud, "openDialog");

            //If no access should not call open dialog
            component.hasSoarAddSwiftAccess = false;
            component.createSwiftPickCode();
            expect(component.swiftPickCrud.openDialog).not.toHaveBeenCalled();

            component.hasSoarAddSwiftAccess = true;
            component.createSwiftPickCode();
            expect(component.swiftPickCrud.editMode).toBe(false);
            expect(component.swiftPickCrud.openDialog).toHaveBeenCalled();
        })
    })

    //On new serviceCodeCreated
    describe('serviceCodeCreated -->', () => {
        beforeEach(() => {
            spyOn(component, 'resetDataForCrud');
            spyOn(component, 'filterServiceCodes');
            spyOn(component, 'assignCustomProperties');
        })
        it('should save new added record in service code  and should call resetDataForCrud if IsSwiftPickCode is false', () => {
            component.serviceCodeCreated(newServiceCode);
            expect(component.filterServiceCodes).toHaveBeenCalled();
            expect(component.resetDataForCrud).toHaveBeenCalled();
        })

        it('should save new added record in service code and should not call resetDataForCrud if IsSwiftPickCode is true', () => {
            newServiceCode.IsSwiftPickCode = true;
            component.serviceCodeCreated(newServiceCode);
            expect(component.filterServiceCodes).toHaveBeenCalled();
            expect(component.resetDataForCrud).not.toHaveBeenCalled();
        })

        it('should call resetDataForCrud when no record to add', () => {
            component.serviceCodeCreated(null);
            expect(component.resetDataForCrud).toHaveBeenCalled();
        })
    })

    //On dataChanged
    describe('dataChanged -->', () => {
        it('should update filteredServiceCodes and updatedServiceCodes on change', () => {
            component.dataChanged(mockServiceCodes, 0);
            component.filteredServiceCodes = mockServiceCodes;
            expect(component.filteredServiceCodes[0].ServiceCodeId).toEqual(mockServiceCodes[0].ServiceCodeId)
        })
    })

    //On checkboxChanged
    describe('checkboxChanged -->', () => {
        it('should change value for property $$IsActiveYes as False & $$IsActiveNo as True when flag false', () => {
            let event = {
                target: {
                    checked: true
                }
            }
            component.checkboxChanged(event, mockServiceCodes[0], "IsActive", false, 0);
            expect(mockServiceCodes[0].$$IsActiveYes).toBe(false);
            expect(mockServiceCodes[0].$$IsActiveNo).toBe(true);
        });
        it('should change value for property $$IsActiveYes as True & $$IsActiveNo as False when flag true', () => {
            let event = {
                target: {
                    checked: true
                }
            }
            component.checkboxChanged(event, mockServiceCodes[0], "IsActive", true, 0);
            expect(mockServiceCodes[0].$$IsActiveYes).toBe(true);
            expect(mockServiceCodes[0].$$IsActiveNo).toBe(false);
        });
        it('should call preventDefault when checked is false', () => {

            let event = {
                target: {
                    checked: false
                },
                preventDefault: () => { }
            }
            spyOn(event, "preventDefault");
            component.checkboxChanged(event, mockServiceCodes[0], "IsActive", true, 0);
            expect(event.preventDefault).toHaveBeenCalled();
        });
    });

    //On selecting from row
    describe('onKendoSelectionChange', () => {
        it('should set value to property from kendo selection', () => {
            spyOn(component, "dataChanged");
            component.onKendoSelectionChange("CPTData", "CPT", mockServiceCodes[0], 0);
            expect(mockServiceCodes[0].CPT).toEqual("CPTData");
            expect(component.dataChanged).toHaveBeenCalled();
        })
    })

    //on editServiceCode
    describe('editServiceCode -->', () => {
        it('should set data on edit service code to autorized person', () => {
            spyOn(component, "notifyNotAuthorized");
            let checkEditAccess = component.authEditServiceCodeAccess();
            component.editServiceCode(mockServiceCodes[0]);
            expect(checkEditAccess).toBe(true);
            expect(component.notifyNotAuthorized).not.toHaveBeenCalled();
        })
        it('should call notifyNotAuthorized if dont have access to edit', () => {
            spyOn(component, "notifyNotAuthorized");
            component.editServiceCodeAmfa = "wrong-key";
            let checkEditAccess = component.authEditServiceCodeAccess();
            component.editServiceCode(mockServiceCodes[0]);
            expect(checkEditAccess).toBe(false);
            expect(component.notifyNotAuthorized).toHaveBeenCalledWith(component.editServiceCodeAmfa);
        })
        it('should display toastrFactory message if service code is null/undefined', () => {
            component.editServiceCode(null);
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })
        it('should return no match record if TaxableServiceTypeId is not match', () => {
            component.dataForCrudOperation.TaxableServices = tempInitialData.TaxableServices;
            let tempMockData = mockServiceCodes[1];
            tempMockData.TaxableServiceTypeId = 60;
            component.editServiceCode(tempMockData);
        })
        it('should return matched record if TaxableServiceTypeId,AffectedAreaId,DrawTypeId,UsuallyPerformedByProviderTypes is match', () => {
            component.dataForCrudOperation.TaxableServices = tempInitialData.TaxableServices;
            component.dataForCrudOperation.AffectedAreas = tempInitialData.AffectedAreas;
            component.dataForCrudOperation.DrawTypes = tempInitialData.DrawTypes;
            component.dataForCrudOperation.UsuallyPerformedByProviderTypes = tempInitialData.ProviderTypes;
            let tempMockData = mockServiceCodes[0];
            tempMockData.TaxableServiceTypeId = 1;
            tempMockData.AffectedAreaId = 1;
            tempMockData.DrawTypeId = "1";
            tempMockData.UsuallyPerformedByProviderTypeId = 1;
            component.editServiceCode(tempMockData);
        })
        it('should set  serviceCode.$$locationFee as "" if value is 0 else set same value', () => {
            let tempMockData = mockServiceCodes[0];
            tempMockData.$$locationFee = 0;
            component.editServiceCode(tempMockData);
            expect(component.dataForCrudOperation.ServiceCode.$$locationFee).toEqual('');
            tempMockData.$$locationFee = 10;
            component.editServiceCode(tempMockData);
            expect(component.dataForCrudOperation.ServiceCode.$$locationFee).toEqual(10);
        })
    })

    //After Modal Closed
    describe('onSwiftCodeModalClose -->', () => {
        it('should call serviceCodeCreated on creating new record', () => {
            spyOn(component, "serviceCodeCreated");
            component.swiftPickCrud.editMode = false;
            component.onSwiftCodeModalClose(newServiceCode);
            expect(component.serviceCodeCreated).toHaveBeenCalledWith(newServiceCode);
        })

        it('should call serviceCodeUpdate on updating a record', () => {
            spyOn(component, "serviceCodeUpdated");
            component.swiftPickCrud.editMode = true;
            component.onSwiftCodeModalClose(newServiceCode);
            expect(component.serviceCodeUpdated).toHaveBeenCalledWith(newServiceCode);
        })
    })

    //On updateSwiftPickCodeServiceCodes
    describe('updateSwiftPickCodeServiceCodes -->', () => {
        it('should update service code Fee', () => {
            const serviceCode = {
                Fee: 10,
                SwiftPickServiceCodes: [
                    {
                        ServiceCodeId: 1,
                        DataTag: null,
                        Code: null,
                        Description: null,
                        CdtCodeName: null,
                    },
                ],
            };
            component.updateSwiftPickCodeServiceCodes(serviceCode);
            expect(serviceCode.Fee).toBe(0);
        });

        it('should update SwiftPickServiceCodes properties', () => {
            const serviceCode = {
                Fee: 10,
                SwiftPickServiceCodes: [
                    {
                        ServiceCodeId: 1,
                        DataTag: null,
                        Code: null,
                        Description: null,
                        CdtCodeName: null,
                    },
                ],
            };
            const backupServiceCodes = [
                {
                    serviceCodeId: 1,
                    DataTag: 'Tag',
                    Code: 'Code',
                    Description: 'Description',
                    CdtCodeName: 'CdtCodeName',
                    Fee: 5,
                },
            ];

            component.backupServiceCodes = backupServiceCodes;
            component.updateSwiftPickCodeServiceCodes(serviceCode);
            expect(serviceCode.SwiftPickServiceCodes[0].DataTag).toBe('Tag');
            expect(serviceCode.SwiftPickServiceCodes[0].Code).toBe('Code');
            expect(serviceCode.SwiftPickServiceCodes[0].Description).toBe('Description');
            expect(serviceCode.SwiftPickServiceCodes[0].CdtCodeName).toBe('CdtCodeName');
            expect(serviceCode.Fee).toBe(5);
        });
    });

    describe('pageChangeEvent', () => {
        it('should change the skip value', () => {
            const pageChangeEvent: PageChangeEvent = { skip: 10, take: 10 }
            component.pageChange(pageChangeEvent);

            expect(component.state.skip).toEqual(pageChangeEvent.skip);
        });
    });

})
