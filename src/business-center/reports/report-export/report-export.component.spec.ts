import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ReportExportComponent } from './report-export.component';
import { CUSTOM_ELEMENTS_SCHEMA, Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ToShortDisplayDateUtcPipe } from 'src/@shared/pipes/dates/to-short-display-date-utc.pipe';
import { ToDisplayTimePipe } from 'src/@shared/pipes/time/to-display-time.pipe';
import { configureTestSuite } from 'src/configure-test-suite';

const mockreportsFactory = {
    AddExportedReportActivityEvent: jasmine.createSpy().and.callFake((array) => {
        return {
            then(callback) {
            }
        };
    })
};

const reportIds = {
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
    ServiceCodeByServiceTypeProductivityReportId: 17,
    ServiceHistoryReportId: 27,
    ServiceTransactionsWithDiscountsReportId: 44,
    ServiceTypeProductivityReportId: 31,
    TreatmentPlanPerformanceReportId: 34,
    TreatmentPlanProviderReconciliationReportId: 38,
    UnassignedUnappliedCreditsReportId: 28,
    CreditDistributionHistoryReportId: 64,
    PotentialDuplicatePatientsReportId: 65,
    ReferralSourcesProductivityDetailedBetaReportId: 113,
    PaymentLocationReconciliationBetaReportId: 116,
    ProjectedNetProductionBetaReportId: 102,
    ReferredPatientsBetaReportId:120,
    AppointmentsBetaReportId: 122,
    CreditDistributionHistoryBetaReportId: 123,
    ProposedTreatmentBetaReportId: 124,
    AccountWithOffsettingProviderBalancesBetaReportId: 128,
    ServiceCodeProductivityByProviderBetaReportId: 129,
    ActivityLogAsyncReportId: 252,
};
describe('ReportExportComponent', () => {
    let component: ReportExportComponent;
    let fixture: ComponentFixture<ReportExportComponent>;
    let routeParams: any;
    let originalReport: any;
    const mockLocalizeService = {
        getLocalizedString: jasmine
            .createSpy('localize.getLocalizedString')
            .and.callFake((val) => {
                return val;
            })
    };
    const mockTostarfactory: any = {
        error: jasmine.createSpy().and.returnValue('Error Message'),
        success: jasmine.createSpy().and.returnValue('Success Message')
    };

    const mockToShortDisplayDateUtcPipe = jasmine.createSpy().and.returnValue({})
    const mockToDisplayTimePipe = jasmine.createSpy().and.returnValue({});

    configureTestSuite(() => {
        routeParams = {
            ReportName: ''
        };
        originalReport = {
            Name: ''
        };
        TestBed.configureTestingModule({
            declarations: [ReportExportComponent, ToShortDisplayDateUtcPipe, ToDisplayTimePipe],
            imports: [FormsModule, ReactiveFormsModule,
                TranslateModule.forRoot()  // Required import for componenets that use ngx-translate in the view or componenet code
            ],
            providers: [
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: 'toastrFactory', useValue: mockTostarfactory },
                { provide: 'ReportsFactory', useValue: mockreportsFactory },
                { provide: '$routeParams', useValue: routeParams },
                { provide: 'ReportIds', useValue: reportIds }
            ],

            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ReportExportComponent);
        component = fixture.componentInstance;
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
});
