import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportFilterBoxComponent } from './report-filter-box.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MockRepository } from '../payment-types-mock-repo';
import { configureTestSuite } from 'src/configure-test-suite';
import { MasterAlerts } from '../practice-settings/patient-profile/master-alerts/master-alerts';
import { PatientAdditionalIdentifierService } from '../practice-settings/patient-profile/patient-additional-identifiers/patient-additional-identifier.service';
import { GroupTypeService } from 'src/@shared/providers/group-type.service';
import { DiscountTypesService } from 'src/@shared/providers/discount-types.service';
import { PaymentTypesService } from 'src/@shared/providers/payment-types.service';

import { AdjustmentTypesService } from 'src/@shared/providers/adjustment-types.service';
import { CheckRoleAccessDirective } from 'src/@shared/directives/check-role-access.directive';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { of } from 'rxjs';
import { ReferralManagementHttpService } from 'src/@core/http-services/referral-management-http.service';
import { MicroServiceApiService } from 'src/security/providers';
import { ServiceTypesService } from '../practice-settings/service-types/service-types.service';
import { FuseFlag } from 'src/@core/feature-flags';

let paymentTypeService: any;
let mockPracticeSettings: any;
let mockActivityTypes: any;
let mockFilterModelData;
let mockStaticData;
let locationResponse;
let presetFilter;
let mock$q;
let mockLocationServices;
let mockTimeZoneFactory
let mockPatSecurityService;
let mockreportsFactory;
let mockReportsService;
let mockFeatureFlagService;

describe('ReportFilterBoxComponent', () => {
    let component: ReportFilterBoxComponent;
    let fixture: ComponentFixture<ReportFilterBoxComponent>;
    let mockRepo: any;

    let mockTostarfactory: any;
    let mockLocalizeService;
    let mockAmfaInfo: any;
    let mockUsersFactory;
    let mockBusinessCenterServices;
    let mockPatientAdditionalIdentifierService;
    let mockGroupTypeService;
    let mockAdjustmentTypesService;
    let mockAppointmentTypesFactory;
    let mockDiscountTypesService;
    let mockMasterAlertsList;
    let mockPatientsWithMasterAlerts;
    let mockMasterAlertService;
    let mockMedicalHistoryAlertsFactory;
    let mockreferenceDataService;

    configureTestSuite(() => {
        mockRepo = MockRepository();

        mockFilterModelData = [
            { Field: 'ActivityTypes', Value: 'Document', Key: true, Id: 47, Checked: true, FilterValue: null, isVisible: true },
            { Field: 'ActivityTypes', Value: 'Communication', Key: true, Id: 48, Checked: true, FilterValue: null, isVisible: true }
        ];
        mockStaticData = {
            ActivityTypes: [
                {
                    Id: 47,
                    Name: 'Document'
                },
                {
                    Id: 48,
                    Name: 'Communication'
                }
            ],
            data: [
                {
                    Id: 47,
                    Checked: true
                },
                {
                    Id: 48,
                    Checked: true
                }
            ],
            get: function (refType) {
                if (refType === 'ActivityTypes') {
                    return mockActivityTypes;
                }
                else {
                    return {};
                }
            }
        };
        locationResponse = {
            Value: [
                {
                    DataTag: 'AAAAAAAJIJI=',
                    DateModified: '2018-09-17T06:42:14.7327338',
                    DeactivationTimeUtc: null,
                    LocationId: 5,
                    NameAbbreviation: '@123',
                    NameLine1: '@123',
                    NameLine2: null,
                    State: 'AR',
                    Timezone: 'Eastern Standard Time',
                    UserModified: 'd0be7456-e01b-e811-b7c1-a4db3021bfa0'
                },
                {
                    DataTag: 'AAAAAAAJII4=',
                    DateModified: '2018-09-17T06:41:10.7225359',
                    DeactivationTimeUtc: null,
                    LocationId: 3,
                    NameAbbreviation: '123',
                    NameLine1: '123',
                    NameLine2: null,
                    State: 'AR',
                    Timezone: 'Hawaiian Standard Time',
                    UserModified: 'd0be7456-e01b-e811-b7c1-a4db3021bfa0'
                },
                {
                    DataTag: 'AAAAAAAJIJA=',
                    DateModified: '2018-09-17T06:41:42.9125004',
                    DeactivationTimeUtc: null,
                    LocationId: 4,
                    NameAbbreviation: '123abc',
                    NameLine1: '123abc',
                    NameLine2: null,
                    State: 'AR',
                    Timezone: 'Aleutian Standard Time',
                    UserModified: 'd0be7456-e01b-e811-b7c1-a4db3021bfa0'
                },
                {
                    DataTag: 'AAAAAAAMA9k=',
                    DateModified: '2018-11-26T11:13:01.0611821',
                    DeactivationTimeUtc: null,
                    LocationId: 1,
                    NameAbbreviation: 'Practice',
                    NameLine1: 'Default Practice - MB',
                    NameLine2: null,
                    State: 'MN',
                    Timezone: 'Central Standard Time',
                    UserModified: 'd0be7456-e01b-e811-b7c1-a4db3021bfa0'
                },
                {
                    DataTag: 'AAAAAAALr2I=',
                    DateModified: '2018-10-24T09:21:08.1730362',
                    DeactivationTimeUtc: null,
                    LocationId: 163,
                    NameAbbreviation: 'Jangaon',
                    NameLine1: 'Jangaon',
                    NameLine2: null,
                    State: 'AR',
                    Timezone: 'Aleutian Standard Time',
                    UserModified: 'd0be7456-e01b-e811-b7c1-a4db3021bfa0'
                },
                {
                    DataTag: 'AAAAAAAMH1s=',
                    DateModified: '2018-12-04T11:55:17.8837416',
                    DeactivationTimeUtc: '2018-12-04T11:54:55.372+00:00',
                    LocationId: 2,
                    NameAbbreviation: '#abc',
                    NameLine1: '#abc',
                    NameLine2: null,
                    State: 'AK',
                    Timezone: 'Aleutian Standard Time',
                    UserModified: 'd0be7456-e01b-e811-b7c1-a4db3021bfa0'
                }
            ]
        };
        presetFilter = {
            PresetFilterDto: {
                EndDate: '2019-01-30T18:30:00.000Z',
                LocationIds: [1],
                StartDate: '2018-12-31T18:30:00.000Z',
                PatientStatus: [1, 2, 3],
                ProviderTypes: ['Hygienist'],
                NegativeAdjustmentTypeIds: [],
                PositiveAdjustmentTypeIds: ['00000000-0000-0000-0000-000000000000']
            }
        };

        mock$q = {
            all: Promise.all,
            when: Promise.resolve,
            defer: () => {
                return {
                    resolve: () => { },
                    reject: () => { },
                    promise: Promise.resolve()
                };
            }
        };
        mockLocationServices = {
            PatientLocations: {
                get: jasmine.createSpy().and.callFake((array) => {
                    return Promise.resolve(array);
                })
            },

            getPermittedLocations: jasmine.createSpy('LocationServices.getPermittedLocations').and.returnValue({
                $promise: {
                    Value: [
                        { Value: [{ LocationId: 3 }] }

                    ]
                    ,
                    then: (callback) => {
                        callback({
                            Value:
                                locationResponse.Value
                        });
                    }
                }
            }),
        };
        mockTimeZoneFactory = {
            GetTimeZoneAbbr: jasmine
                .createSpy()
                .and.returnValue({})
        };

        mockPatSecurityService = {
            IsAuthorizedByAbbreviation: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true)
        };

        mockreportsFactory = {
            GetReportCategoryId: jasmine.createSpy().and.callFake((array) => {
                return Promise.resolve();
            }),
            GetReportContext: jasmine.createSpy().and.returnValue(presetFilter)

        };
        mockReportsService = {
            CreateCustom: jasmine
                .createSpy('mockReportsService.GetSpecificUserDefinedFilter')
                .and.returnValue(Promise.resolve())
        };

        mockTostarfactory = {
            error: jasmine.createSpy().and.returnValue('Error Message'),
            success: jasmine.createSpy().and.returnValue('Success Message')
        };
        mockLocalizeService = {
            getLocalizedString: jasmine
                .createSpy('localize.getLocalizedString')
                .and.callFake((val) => {
                    return val;
                })
        };

        mockAmfaInfo = {
            reportAmfa: mockAmfaInfo
        };

        mockUsersFactory = {};
        mockBusinessCenterServices = {};
        mockPatientAdditionalIdentifierService = {
            save: jasmine.createSpy(),
            update: jasmine.createSpy(),
            get: jasmine.createSpy(),
            getPatientAdditionalIdentifiers: jasmine.createSpy(),
            delete: jasmine.createSpy(),
        }

        mockGroupTypeService = {
            save: jasmine.createSpy(),
            update: jasmine.createSpy(),
            get: jasmine.createSpy(),
            delete: jasmine.createSpy(),
            groupTypeWithPatients: jasmine.createSpy(),
        };
        mockAdjustmentTypesService = {
            get: jasmine.createSpy().and.returnValue({}),
            GetAllAdjustmentTypesWithOutCheckTransactions: jasmine.createSpy().and.callFake(() => {
                return new Promise((resolve, reject) => {
                    resolve({}),
                        reject({});
                });
            }),
        };
        mockAppointmentTypesFactory = {};
        mockDiscountTypesService = {};
        mockMasterAlertsList = [
            { MasterAlertId: '1', Description: 'AlertOne', SymbolId: '1' },
            { MasterAlertId: '2', Description: 'AlertTwo', SymbolId: '2' }
        ]

        mockPatientsWithMasterAlerts = [{ PatientId: '1' }, { PatientId: '2' }, { PatientId: '3' }];

        mockMasterAlertService = {
            get: jasmine.createSpy().and.returnValue({ Value: mockMasterAlertsList }),
            save: (masterAlert) => {
                return {
                    $promise: {
                        then: (res, error) => {
                            res({ Value: masterAlert }),
                                error({
                                    data: {
                                        InvalidProperties: [{
                                            PropertyName: "Description",
                                            ValidationMessage: "Not Allowed"
                                        }]
                                    }
                                })
                        }
                    }
                }
            },
            update: (masterAlert: MasterAlerts) => {
                return {
                    $promise: {
                        then: (res, error) => {
                            res({ Value: masterAlert }),
                                error({
                                    data: {
                                        InvalidProperties: [{
                                            PropertyName: "Description",
                                            ValidationMessage: "Not Allowed"
                                        }]
                                    }
                                })
                        }
                    }
                }
            },
            delete: (masterAlert) => {
                return new Promise((resolve, reject) => {
                    resolve({ Value: mockMasterAlertsList[0].MasterAlertId }),
                        reject({});
                });
            },
            alertsWithPatients: (Obj) => {
                return new Promise((resolve, reject) => {
                    let tempData = [];
                    tempData = mockPatientsWithMasterAlerts.filter(x => x.PatientId == Obj.Id);
                    resolve({ Value: mockPatientsWithMasterAlerts }),
                        reject({});
                });
            },
        };
        mockMedicalHistoryAlertsFactory = {};

        mockreferenceDataService = {
            entityNames: {
                practiceSettings: 'practiceSettings'
            },
            get: function (refType) {
                if (refType === 'practiceSettings') {
                    return mockPracticeSettings;
                } else {
                    return {};
                }
            }
        };
        mockFeatureFlagService = {
            getOnce$: jasmine.createSpy().and.callFake(function (flag) {
                return of({ Value: [] })
            })
        };

        const mockReferralManagementHttpService = {
            getSources: jasmine.createSpy().and.returnValue({
              then: function (callback) {
                  callback({ Value: '' });
              }
            })
          };
        
        TestBed.configureTestingModule({
            declarations: [ReportFilterBoxComponent, CheckRoleAccessDirective],
            imports: [
                FormsModule,
                ReactiveFormsModule,
                TranslateModule.forRoot(),
                HttpClientTestingModule,  // Required import for componenets that use ngx-translate in the view or componenet code
            ],
            providers: [
                { provide: 'ReferralManagementHttpService', useValue: mockReferralManagementHttpService },
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: 'toastrFactory', useValue: mockTostarfactory },
                { provide: 'LocationServices', useValue: mockLocationServices },
                { provide: 'ReportsFactory', useValue: mockreportsFactory },
                { provide: 'AmfaInfo', useValue: { 'soar-report-admin-actlog': 21 } },
                { provide: 'TimeZoneFactory', useValue: mockTimeZoneFactory },
                { provide: 'patSecurityService', useValue: mockPatSecurityService },
                { provide: 'UsersFactory', useValue: mockUsersFactory },
                { provide: 'BusinessCenterServices', useValue: mockBusinessCenterServices },
                { provide: PatientAdditionalIdentifierService, useValue: mockPatientAdditionalIdentifierService },
                { provide: 'referenceDataService', useValue: mockreferenceDataService },
                { provide: GroupTypeService, useValue: mockGroupTypeService },
                { provide: AdjustmentTypesService, useValue: mockAdjustmentTypesService },
                { provide: 'AppointmentTypesFactory', useValue: mockAppointmentTypesFactory },
                { provide: DiscountTypesService, useValue: mockDiscountTypesService },
                { provide: 'StaticData', useValue: mockStaticData },
                { provide: 'MasterAlertService', useValue: mockMasterAlertService },
                { provide: 'MedicalHistoryAlertsFactory', useValue: mockMedicalHistoryAlertsFactory },
                { provide: PaymentTypesService, useValue: mockRepo.mockpaymentTypeService },
                { provide: 'ReportsService', useValue: mockReportsService },
                { provide: 'UserServices', useValue: {} },
                { provide: '$q', useValue: mock$q },
                { provide: '$scope', useValue: {} },
                { provide: 'SoarConfig', useValue: {} },
                { provide: FeatureFlagService, useValue: mockFeatureFlagService },
                { provide: 'ReferralSourcesService', useValue: {} },
                { provide: MicroServiceApiService, useValue: jasmine.createSpy() },
                { provide: ServiceTypesService, useValue: jasmine.createSpy() },
            ],

            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            ;
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ReportFilterBoxComponent);
        paymentTypeService = TestBed.get(PaymentTypesService);
        component = fixture.componentInstance;
        component.getUsersCompletePromise = false;
        component.getLocationsCompletePromise = false;
        component.recallMethod = false;
        component.filterModels = {
            LocationIds: {
                FilterFilterModel: null,
                FilterId: 'locations',
                Name: 'Locations',
                Reset: false,
                data: [],
                DefaultAll: false
            },
            ServiceCodeId: {
                DisplayColumns: [
                    { 0: 'Code' },
                    { 1: 'CdtCodeName' },
                    { 2: 'Description' }
                ],
                FilterDtoColumns: [{ 0: 'ServiceCodeId' }],
                Name: 'Service Code',
                Placeholder: 'Search service code, CDT code, description',
                SearchMaterial: []
            },
            AgingId: {
                FilterFilterModel: null,
                FilterId: 'Aging',
                Name: 'Aging',
                Reset: false,
                data: []
            }

        };
        component.allData = {
            $$childTail: {}
        };

        component.allData.$$childTail = {
            userLocation: {
                id: 1
            },
            reportIds: {
                ActivityLogReportId: 24,
                AdjustmentsByProviderReportId: 22,
                AdjustmentsByTypeReportId: 60,
                AppointmentTimeElapsedReportId: 46,
                AppointmentsReportId: 41,
                CarrierProductivityAnalysisDetailedReportId: 35,
                CarrierProductivityAnalysisReportId: 33,
                CarriersReportId: 9,
                CollectionsAtCheckoutReportId: 42,
                CollectionsByServiceDateReportId: 47,
                DailyProductionCollectionSummaryReportId: 53,
                DaySheetReportId: 19,
                DeletedTransactionsReportId: 32,
                EncountersByFeeScheduleReportId: 48,
                FeeExceptionsReportId: 26,
                FeeScheduleAnalysisByCarrier: 37,
                FeeScheduleMasterReportId: 11,
                MedicalHistoryFormAnswersReportId: 59,
                NetCollectionByProviderReportId: 23,
                NetProductionByProviderReportId: 21,
                NewPatientsByComprehensiveExamReportId: 16,
                NewPatientsSeenReportId: 49,
                PatientAnalysisReportId: 58,
                PatientAnalysisBetaReportId: 66,
                PatientsByAdditionalIdentifiersReportId: 13,
                PatientsByBenfitPlansReportId: 6,
                PatientsByDiscountReportId: 3,
                PatientsByFeeScheduleReportId: 7,
                PatientsByFlagsReportId: 52,
                PatientsByLastServiceDateReportId: 57,
                PatientsByMedicalHistoryAlertsReportId: 55,
                PatientsByPatientGroupsReportId: 51,
                PatientsSeenReportId: 14,
                PatientsWithPendingEncountersReportId: 8,
                PatientsWithRemainingBenefitsReportId: 40,
                PaymentReconciliationReportId: 50,
                PendingClaimsReportId: 36,
                PerformanceByProviderDetailsReportId: 18,
                PerformanceByProviderSummaryReportId: 1,
                PeriodReconciliationReportId: 45,
                ProductionExceptionsReportId: 30,
                ProjectedNetProductionReportId: 56,
                ProposedTreatmentReportId: 61,
                ProviderServiceHistoryReportId: 29,
                ReceivablesByProviderReportId: 54,
                ReferralSourcesProductivityDetailedReportId: 39,
                ReferralSourcesProductivitySummaryReportId: 43,
                ReferredPatientsReportId: 15,
                ServiceCodeFeesByFeeScheduleReportId: 25,
                ServiceCodeFeesByLocationReportId: 12,
                ServiceCodeProductivityByProviderReportId: 20,
                ServiceCodeProductivityReportId: 17,
                ServiceHistoryReportId: 27,
                ServiceTransactionsWithDiscountsReportId: 44,
                ServiceTypeProductivityReportId: 31,
                TreatmentPlanPerformanceReportId: 34,
                TreatmentPlanProviderReconciliationReportId: 38,
                UnassignedUnappliedCreditsReportId: 28,
                ServiceCodeProductivityByProviderBetaReportId: 134,
                ReferralSourcesProductivityDetailedBetaReportId: 113,
                ReferredPatientsBetaReportId: 120,
                AppointmentsBetaReportId: 122,
                ProposedTreatmentBetaReportId: 124,
                PatientsClinicalNotesReportId: 125,
                AccountWithOffsettingProviderBalancesBetaReportId: 128,
                PaymentLocationReconciliationBetaReportId: 116
            },
            reportAmfa: 'soar-report-admin-actlog',
            reportId: 60,
            dateFilterList: [],
            requestBodyProperties:
                false,
            userDefinedFilter: ''
        };
        component.userContext = {
            Result: {
                User: { AccessLevel: 3 }
            }
        };
        component.fromType = 'fromDashboard';
        component.userDefinedFilter = '';
        component.LocationsName = 'LocationIds';
        component.ServiceCodeName = 'ServiceCodeId';
        component.ProvidersName = 'ProviderUserIds';
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        beforeEach(() => {
        });
        it('should call ngOnInit', () => {
            component.ngOnInit();
        });
    });

    describe('initializeFilterClasses method ->', () => {
        it('initializeFilterClasses should be called', () => {
            component.initializeFilterClasses();
            expect(component.classExpandCollapse).toEqual(
                'btn soar-link icon-button font-14 expand-all'
            );
        });
    });

    describe('initializeFilterElements method ->', () => {
        it('initializeFilterElements should be called', () => {
            component.initializeFilterElements();
            expect(component.defaultFilterCount).toBe(0);
            expect(component.showPatientStatus).toBe(false);
            expect(component.showTreatmentPlanStatus).toBe(false);
            expect(component.showMultipleLocation).toBe(false);
            expect(component.showSingleLocation).toBe(false);
            expect(component.showProviders).toBe(false);
            expect(component.showUsers).toBe(false);
            expect(component.showDateRange).toBe(false);
            expect(component.showAdditionalIdentifiers).toBe(false);
            expect(component.showCarriers).toBe(false);
            expect(component.showPayerId).toBe(false);
            expect(component.showFeeSchedules).toBe(false);
            expect(component.showReferralSources).toBe(false);
            expect(component.showDisplayOptions).toBe(false);
            expect(component.showTransactionTypes).toBe(false);
            expect(component.showServiceTypes).toBe(false);
            expect(component.showPatientGroupTypes).toBe(false);
            expect(component.showServiceCode).toBe(false);
            expect(component.showMonths).toBe(false);
            expect(component.showImpactions).toBe(false);
            expect(component.showAppointmentTypes).toBe(false);
            expect(component.showViewTransactionsBy).toBe(false);
            expect(component.showServiceDate).toBe(false);
            expect(component.showDiscountTypes).toBe(false);
            expect(component.showActivityTypes).toBe(false);
            expect(component.showActivityActions).toBe(false);
            expect(component.showActivityAreas).toBe(false);
            expect(component.showPatients).toBe(false);
            expect(component.showCollectionDateRange).toBe(false);
            expect(component.showProductionDateRange).toBe(false);
            expect(component.showMasterPatientAlerts).toBe(false);
            expect(component.showMedicalHistoryAlerts).toBe(false);
            expect(component.showTreatmentPlan).toBe(false);
            expect(component.showAging).toBe(false);
            expect(component.showClaimTypes).toBe(false);
            expect(component.showReportView).toBe(false);
            expect(component.textExpandCollapse).toEqual('Expand All');
            expect(component.showServiceCodeStatus).toBe(false);
            expect(component.showClaimStatus).toBe(false);
        });
    });

    describe('initializeLocationElements method ->', () => {
        it('initializeLocationElements should be called', () => {
            component.LocationsName = 'LocationIds';
            component.initializeLocationElements();
            expect(component.filterModels.LocationIds.DefaultAll).toBe(false);
            expect(component.defaultLoc).toEqual({});
            expect(component.filterModels.LocationIds.DefaultFilterCount).toEqual(2);
            expect(component.filterModels.LocationIds.FilterString).toEqual(
                'No filters applied'
            );
            expect(component.filterModels.LocationIds.Reset).toBe(true);
        });

        it('initializeLocationElements should be called', () => {
            component.allData.$$childTail.reportId = 24;
            component.filterModels = {
                LocationIds: {
                    FilterFilterModel: null,
                    FilterId: 'locations',
                    Name: 'Locations',
                    Reset: false,
                    data: []
                }
            };
            component.LocationsName = 'LocationIds';
            component.initializeLocationElements();
            expect(component.defaultLoc).toEqual({});
            expect(component.filterModels.LocationIds.DefaultFilterCount).toEqual(0);
            expect(component.filterModels.LocationIds.FilterString).toEqual('All');
            expect(component.filterModels.LocationIds.Reset).toBe(true);
        });
    });

    describe('getLocationSuccess method ->', () => {
        it('getLocationSuccess should be called', () => {
            const res = {
                Value: [
                    {
                        DataTag: 'AAAAAAAJIJI=',
                        DateModified: '2018-09-17T06:42:14.7327338',
                        DeactivationTimeUtc: null,
                        LocationId: 5,
                        NameAbbreviation: '@123',
                        NameLine1: '@123',
                        NameLine2: null,
                        State: 'AR',
                        Timezone: 'Eastern Standard Time',
                        UserModified: 'd0be7456-e01b-e811-b7c1-a4db3021bfa0'
                    },
                    {
                        DataTag: 'AAAAAAAJII4=',
                        DateModified: '2018-09-17T06:41:10.7225359',
                        DeactivationTimeUtc: null,
                        LocationId: 3,
                        NameAbbreviation: '123',
                        NameLine1: '123',
                        NameLine2: null,
                        State: 'AR',
                        Timezone: 'Hawaiian Standard Time',
                        UserModified: 'd0be7456-e01b-e811-b7c1-a4db3021bfa0'
                    },
                    {
                        DataTag: 'AAAAAAAJIJA=',
                        DateModified: '2018-09-17T06:41:42.9125004',
                        DeactivationTimeUtc: null,
                        LocationId: 4,
                        NameAbbreviation: '123abc',
                        NameLine1: '123abc',
                        NameLine2: null,
                        State: 'AR',
                        Timezone: 'Aleutian Standard Time',
                        UserModified: 'd0be7456-e01b-e811-b7c1-a4db3021bfa0'
                    },
                    {
                        DataTag: 'AAAAAAAMA9k=',
                        DateModified: '2018-11-26T11:13:01.0611821',
                        DeactivationTimeUtc: null,
                        LocationId: 1,
                        NameAbbreviation: 'Practice',
                        NameLine1: 'Default Practice - MB',
                        NameLine2: null,
                        State: 'MN',
                        Timezone: 'Central Standard Time',
                        UserModified: 'd0be7456-e01b-e811-b7c1-a4db3021bfa0'
                    },
                    {
                        DataTag: 'AAAAAAALr2I=',
                        DateModified: '2018-10-24T09:21:08.1730362',
                        DeactivationTimeUtc: null,
                        LocationId: 163,
                        NameAbbreviation: 'Jangaon',
                        NameLine1: 'Jangaon',
                        NameLine2: null,
                        State: 'AR',
                        Timezone: 'Aleutian Standard Time',
                        UserModified: 'd0be7456-e01b-e811-b7c1-a4db3021bfa0'
                    },
                    {
                        DataTag: 'AAAAAAAMH1s=',
                        DateModified: '2018-12-04T11:55:17.8837416',
                        DeactivationTimeUtc: '2018-12-04T11:54:55.372+00:00',
                        LocationId: 2,
                        NameAbbreviation: '#abc',
                        NameLine1: '#abc',
                        NameLine2: null,
                        State: 'AK',
                        Timezone: 'Aleutian Standard Time',
                        UserModified: 'd0be7456-e01b-e811-b7c1-a4db3021bfa0'
                    }
                ]
            };
            component.getLocationsCompletePromise = { resolve: jasmine.createSpy() };
            component.showMultipleLocation = true;
            component.getLocationSuccess(res);
            expect(component.filterModels.LocationIds.data[0].Field).toEqual('Locations');
            expect(component.filterModels.LocationIds.data[0].Value).toEqual('All');
            expect(component.filterModels.LocationIds.data[0].Key).toBe(true);
            expect(component.filterModels.LocationIds.data[0].LocationStatus).toEqual(
                'All Status'
            );
            expect(component.filterModels.LocationIds.data[0].Checked).toBe(false);
            expect(component.filterModels.LocationIds.data[0].isVisible).toBe(true);
        });
    });

    describe('setCheckedValueForAllItems method ->', () => {
        let array;
        let isChecked;

        beforeEach(() => {
            array = [
                {
                    Checked: false,
                    Field: 'FeeSchedules',
                    Id: '00000000-0000-0000-0000-000000000000',
                    Key: true,
                    Value: 'All',
                    isVisible: true
                },
                {
                    Checked: false,
                    Field: 'FeeSchedules',
                    FilterValue: null,
                    Id: 'bc2bcffd-db19-4540-8ad9-9c8c3b5e39e5',
                    Key: true,
                    Value: 'Jagadeesh',
                    isVisible: true
                }
            ];
            isChecked = true;
        });

        it('All checkboxes should be selected', () => {
            const result = component.setCheckedValueForAllItems(array, isChecked);
            expect(array[0].Checked).toBe(true);
            expect(array[1].Checked).toBe(true);
            expect(result).toEqual('All');
        });

        it('No filters should be applied', () => {
            array[0].Checked = true;
            array[1].Checked = true;
            isChecked = false;
            const result = component.setCheckedValueForAllItems(array, isChecked);
            expect(array[0].Checked).toBe(false);
            expect(array[1].Checked).toBe(false);
            expect(result).toEqual('No filters applied');
        });
    });

    describe('setDefaultServiceCode method ->', () => {
        it('setDefaultServiceCode should be called', () => {
            component.emptyGuid = '00000000-0000-0000-0000-000000000000';
            component.includeAll = true;
            component.setDefaultServiceCode();
            expect(component.filterModels.ServiceCodeId.Reset).toBe(true);
            expect(component.filterModels.ServiceCodeId.FilterString).toEqual('All');
            expect(component.filterModels.ServiceCodeId.FilterDto).toEqual(
                '00000000-0000-0000-0000-000000000000'
            );
        });
    });

    describe('setDefaultCheckboxFilterValues method ->', () => {
        const filterModel = {
            ActualFilterString: 'All',
            DefaultFilterCount: 2,
            FilterDto: [
                { 0: '00000000-0000-0000-0000-000000000000' },
                { 1: 'bc2bcffd-db19-4540-8ad9-9c8c3b5e39e5' }
            ],
            FilterFilterModel: null,
            FilterId: 'feeSchedules',
            FilterString: 'All',
            Name: 'Fee Schedules',
            Reset: false,
            data: [
                {
                    Checked: true,
                    Field: 'FeeSchedules',
                    Id: '00000000-0000-0000-0000-000000000000',
                    Key: true,
                    Value: 'All',
                    isVisible: true
                },
                {
                    Checked: true,
                    Field: 'FeeSchedules',
                    FilterValue: null,
                    Id: 'bc2bcffd-db19-4540-8ad9-9c8c3b5e39e5',
                    Key: true,
                    Value: 'Jagadeesh',
                    isVisible: true
                }
            ]
        };
        it('setDefaultCheckboxFilterValues reset should be true', () => {
            const isAllChecked = true;
            component.setDefaultCheckboxFilterValues(filterModel, isAllChecked);
            expect(filterModel.Reset).toBe(true);
        });

        it('Filter string should be set to All', () => {
            filterModel.Reset = true;
            const checkedValue = true;
            component.setDefaultCheckBoxModelValues(filterModel, checkedValue);
            expect(filterModel.DefaultFilterCount).toEqual(2);
            expect(filterModel.FilterString).toEqual('All');
        });
    });

    describe('setDefaultCheckBoxModelValues method ->', () => {
        const filterModel = {
            ActualFilterString: 'All',
            DefaultFilterCount: 2,
            FilterDto: [
                { 0: '00000000-0000-0000-0000-000000000000' },
                { 1: 'bc2bcffd-db19-4540-8ad9-9c8c3b5e39e5' }
            ],
            FilterFilterModel: null,
            FilterId: 'feeSchedules',
            FilterString: 'All',
            Name: 'Fee Schedules',
            Reset: false,
            data: [
                {
                    Checked: true,
                    Field: 'FeeSchedules',
                    Id: '00000000-0000-0000-0000-000000000000',
                    Key: true,
                    Value: 'All',
                    isVisible: true
                },
                {
                    Checked: true,
                    Field: 'FeeSchedules',
                    FilterValue: null,
                    Id: 'bc2bcffd-db19-4540-8ad9-9c8c3b5e39e5',
                    Key: true,
                    Value: 'Jagadeesh',
                    isVisible: true
                }
            ]
        };

        it('setDefaultCheckBoxModelValues should be set to All', () => {
            filterModel.Reset = true;
            const checkedValue = true;
            component.setDefaultCheckBoxModelValues(filterModel, checkedValue);
            expect(filterModel.DefaultFilterCount).toEqual(2);
            expect(filterModel.FilterString).toEqual('All');
        });
    });

    describe('initializeProvidersElements method ->', () => {
        it('initializeProvidersElements should be called', () => {
            component.initializeProvidersElements();
            expect(component.partialProviders).toBe(true);
            expect(component.filterModels.ProviderUserIds.FilterId).toEqual('providers');
            expect(component.filterModels.ProviderUserIds.Reset).toEqual(false);
        });
    });

    describe('setDefaultAgingFilter method ->', () => {
        it('setDefaultAgingFilter should be called', () => {
            component.AgingName = 'AgingId';
            component.setDefaultAgingFilter();
            expect(component.filterModels.AgingId.data[0].Value).toEqual('All');
            expect(component.filterModels.AgingId.data[1].Value).toEqual('0-30 Days');
            expect(component.filterModels.AgingId.data[2].Value).toEqual('31-60 Days');
            expect(component.filterModels.AgingId.data[3].Value).toEqual('61-90 Days');
            expect(component.filterModels.AgingId.data[4].Value).toEqual('> 90 Days');
            expect(component.filterModels.AgingId.FilterString).toEqual('All');
        });
    });

    describe('getCheckedList method ->', () => {
        let originalList;
        beforeEach(() => {
            originalList = [
                {
                    Checked: false,
                    Field: 'Locations',
                    Id: 0,
                    Key: true,
                    LocationStatus: 'All Status',
                    Value: 'All',
                    isVisible: true
                },
                {
                    Checked: false,
                    Field: 'Locations',
                    Id: 5,
                    Key: true,
                    LocationStatus: 'Active',
                    Value: '@123 (EST)',
                    isVisible: true
                },
                {
                    Checked: false,
                    Field: 'Locations',
                    Id: 3,
                    Key: true,
                    LocationStatus: 'Active',
                    Value: '123 (HST)',
                    isVisible: true
                },
                {
                    Checked: false,
                    Field: 'Locations',
                    Id: 4,
                    Key: true,
                    LocationStatus: 'Active',
                    Value: '123abc (HAST)',
                    isVisible: true
                }
            ];
        });
        it('component.getCheckedList should be called', () => {
            let result = [];
            result = component.getCheckedList(originalList);
            expect(result).toEqual([]);
        });

        it('component.getCheckedList should be called', () => {
            originalList[1].Checked = true;
            let result = [];
            result = component.getCheckedList(originalList);
            expect(result[0].Checked).toBe(true);
            expect(result[0].Field).toEqual('Locations');
            expect(result[0].Value).toEqual('@123 (EST)');
        });
    });

    describe('getPermittedUserList method ->', () => {
        const originalLocationList = [
            {
                Checked: false,
                Field: 'Locations',
                Id: 0,
                Key: true,
                LocationStatus: 'All Status',
                Value: 'All',
                isVisible: true
            },
            {
                Checked: false,
                Field: 'Locations',
                LocationId: 5,
                Key: true,
                LocationStatus: 'Active',
                Value: '@123 (EST)',
                ProviderTypeId: 2,
                isVisible: true
            },
            {
                Checked: false,
                Field: 'Locations',
                LocationId: 3,
                Key: true,
                LocationStatus: 'Active',
                Value: '123 (HST)',
                ProviderTypeId: 1,
                isVisible: true
            },
            {
                Checked: false,
                Field: 'Locations',
                LocationId: 4,
                Key: true,
                LocationStatus: 'Active',
                Value: '123abc (HAST)',
                ProviderTypeId: 3,
                isVisible: true
            },
            {
                Checked: false,
                Field: 'Locations',
                LocationId: 6,
                Key: true,
                LocationStatus: 'Active',
                Value: '123abc (HAST)',
                ProviderTypeId: 5,
                isVisible: true
            },
            {
                Checked: false,
                Field: 'Locations',
                LocationId: 7,
                Key: true,
                LocationStatus: 'Active',
                Value: '123abc (HAST)',
                ProviderTypeId: 3,
                isVisible: true
            }
        ];

        const userList = [
            {
                Checked: true,
                Field: 'Providers',
                Id: '00000000-0000-0000-0000-000000000000',
                IsActive: true,
                Key: true,
                SortOrder: 1,
                Value: 'All',
                isVisible: true
            },
            {
                Checked: true,
                Field: 'Providers',
                FilterValue: originalLocationList,
                Id: '34de62b5-b6b6-e811-bfd7-4c34889071c5',
                IsActive: true,
                Key: true,
                SortOrder: 2,
                Value: 'Brown, Ruby - BRORU1',
                isVisible: true
            },
            {
                Checked: true,
                Field: 'Providers',
                FilterValue: originalLocationList,
                Id: 'adb31dad-b6b6-e811-bfd7-4c34889071c5',
                IsActive: true,
                Key: true,
                SortOrder: 2,
                Value: 'Dickson, Khloe - DICKH1',
                isVisible: true
            },
            {
                Checked: true,
                Field: 'Providers',
                FilterValue: originalLocationList,
                Id: '0ae49696-b6b6-e811-bfd7-4c34889071c5',
                IsActive: true,
                Key: true,
                SortOrder: 2,
                Value: 'Flores, Cody - FLOCO1',
                isVisible: true
            },
            {
                Checked: true,
                Field: 'Providers',
                FilterValue: originalLocationList,
                Id: '37de62b5-b6b6-e811-bfd7-4c34889071c5',
                IsActive: true,
                Key: true,
                SortOrder: 2,
                Value: 'Franklin, Molly - FRAMO1',
                isVisible: true
            },
            {
                Checked: true,
                Field: 'Providers',
                FilterValue: originalLocationList,
                Id: 'b71b4bbc-b6b6-e811-bfd7-4c34889071c5',
                IsActive: true,
                Key: true,
                SortOrder: 2,
                Value: 'Gordon, April - GORAP1',
                isVisible: true
            }
        ];

        it('getPermittedUserList should be called', () => {
            const providerTypes = [0, 3, 1, 2, 5];
            const result = component.getPermittedUserList(providerTypes, userList);
            expect(result.length).toEqual(userList.length);
        });

        it('getPermittedUserList should be called', () => {
            const providerTypes = [3, 1, 2, 5];
            const result = component.getPermittedUserList(providerTypes, userList);
            expect(result.length).toEqual(userList.length);
        });
    });


    describe('getSelectedItemIds method ->', () => {
        it('getSelectedItemIds should be called with true', () => {
            const array = [
                {
                    Id: 1,
                    Checked: false
                },
                {
                    Id: 2,
                    Checked: true
                }
            ];
            const result = component.getSelectedItemIds(array);
            expect(result).toEqual([2]);
        });
        it('getSelectedItemIds should be called with false', () => {
            const array = [
                {
                    Id: 1,
                    Checked: false
                },
                {
                    Id: 2,
                    Checked: false
                }
            ];
            const result = component.getSelectedItemIds(array);
            expect(result).toEqual([]);
        });
    });

    describe('checkModelValidity method ->', () => {
        it('checkModelValidity should be called with false', () => {
            component.checkModelValidity(false);
            expect(component.isValid).toBe(false);
        });

        it('checkModelValidity should be called with true', () => {
            component.checkModelValidity(true);
            expect(component.isValid).toBe(true);
        });
    });

    describe('updateFilterCount method ->', () => {
        it('updateFilterCount should be called with positive value', () => {
            component.appliedFiltersCount = 0;
            component.updateFilterCount(6);
            expect(component.appliedFiltersCount).toBe(6);
        });

        it('updateFilterCount should be called with negative value', () => {
            component.appliedFiltersCount = 7;
            component.updateFilterCount(-3);
            expect(component.appliedFiltersCount).toBe(4);
        });
    });

    describe('applyFilters method ->', () => {
        it('applyFilters should be called with true values', () => {
            component.isValidDates = true;
            component.isValid = true;
            component.applyFilters();
            component.getReport.emit();
        });

        it('applyFilters should not be called with false values', () => {
            component.isValidDates = true;
            component.isValid = false;
            component.applyFilters();
        });

    });

    describe('additionalIdentifierGetFailure method ->', () => {
        it('additionalIdentifierGetFailure should be called', () => {
            component.additionalIdentifierGetFailure();
            mockTostarfactory.error(
                mockLocalizeService.getLocalizedString(
                    'Failed to retrieve the list of patient additional identifiers. Refresh the page to try again.'
                ),
                mockLocalizeService.getLocalizedString('Error')
            );
        });
    });

    describe('getMedicalHistoryAlertsFailure method ->', () => {
        it('getMedicalHistoryAlertsFailure should be called', () => {
            component.getMedicalHistoryAlertsFailure();
            mockTostarfactory.error(
                mockLocalizeService.getLocalizedString(
                    'Failed to retrieve the list of medical history alerts. Refresh the page to try again.'
                ),
                mockLocalizeService.getLocalizedString('Server Error')
            );
        });
    });

    describe('setUserDisplayNames method ->', () => {
        it('setUserDisplayNames should be called', () => {
            const users = [
                {
                    DateOfBirth: '1980-11-16T00:00:00',
                    FirstName: 'Jaden',
                    IsActive: true,
                    IsPatient: true,
                    LastName: 'Acevedo',
                    MiddleName: null,
                    PatientCode: 'ACEJA1',
                    PatientId: 'cbf66064-d4d0-4fd3-b8b2-fcceb2a95123',
                    PreferredName: null,
                    Suffix: null
                },
                {
                    DateOfBirth: '1980-11-16T00:00:00',
                    FirstName: 'Jagan',
                    IsActive: true,
                    IsPatient: true,
                    LastName: 'Dornala',
                    MiddleName: null,
                    PatientCode: 'JD1996',
                    PatientId: 'cbf66064-d4d0-4fd3-b8b2-fcceb2a95456',
                    PreferredName: null,
                    Suffix: null,
                    UserCode: '1234',
                    $$DisplayName: ''
                }
            ];
            component.setUserDisplayNames(users);
            expect(users[0].$$DisplayName).toEqual(users[0].LastName + ', ' + users[0].FirstName + ' - ' + users[0].UserCode);
        });
    });

    describe('checkIfProvider method ->', () => {
        it('checkIfProvider should be called with true', () => {
            const prov = { ProviderTypeId: 5 };
            const result = component.checkIfProvider(prov);
            expect(result).toEqual(true);
        });

        it('checkIfProvider should be called with false', () => {
            const prov = { ProviderTypeId: 4 };
            const result = component.checkIfProvider(prov);
            expect(result).toEqual(false);
        });
    });

    describe('getPaymentTypes method ->', () => {
        it('should call paymentTypeService.getAllPaymentTypes', () => {
            spyOn(paymentTypeService, 'getAllPaymentTypes').and.returnValue(Promise.resolve(mockRepo.mockPaymentTypesList));
            component.getPaymentTypes();
            expect(paymentTypeService.getAllPaymentTypes)
                .toHaveBeenCalled();
        });

        it('should call getAllPaymentTypes function with valid paramter', () => {
            spyOn(paymentTypeService, 'getAllPaymentTypes').and.returnValue(Promise.resolve(mockRepo.mockPaymentTypesList));
            paymentTypeService.getAllPaymentTypes()
                .then((result: any) => {
                    component.getAllPaymentypesSuccess(result);
                });
        });

        it('should call getAllPaymentTypes function with invalid paramter', () => {
            spyOn(paymentTypeService, 'getAllPaymentTypes').and.returnValue(Promise.reject({ reason: 'reject' }));
            paymentTypeService.getAllPaymentTypes()
                .then((result: any) => {
                }, () => {
                    component.getAllPaymentypesFailure();
                });
        });
    });
    describe('getActivityTypes method ->', () => {
        it('getActivityTypes should be called to check communication activity type', () => {
            component.filterModels = {
                ActivityTypes: {
                    data: mockFilterModelData,
                    FilterDto: null,
                    Name: 'Activity Types',
                    FilterId: 'activityTypes',
                    FilterFilterModel: null
                }
            };
            component.ActivityTypeName = 'ActivityTypes';
            component.getActivityTypes();
            expect(component.localizedActivityTypes.length).toEqual(2);
            expect(component.localizedActivityTypes[0].Id).toEqual(48);
            expect(component.localizedActivityTypes[0].Name).toEqual('Communication');
        });
    });

    describe('getAdjustmentTypes ->', () => {
        it('should call GetAllAdjustmentTypesWithOutCheckTransactions with active=true', () => {
            component.getAdjustmentPromise = Promise;
            component.getAdjustmentTypes();
            expect(mockAdjustmentTypesService.GetAllAdjustmentTypesWithOutCheckTransactions).toHaveBeenCalledWith({ active: false });
        });
    });
});
