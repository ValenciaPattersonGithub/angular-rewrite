import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GeneralInfoComponent } from '../communication-patient-drawer/general-info/general-info.component';
import { CommunicationPatientDrawerComponent } from './communication-patient-drawer.component';
import { AlertsFlagsComponent } from '../communication-patient-drawer/alerts-flags/alerts-flags.component';
import { PatientContactComponent } from '../communication-patient-drawer/patient-contact/patient-contact.component';
import { TruncateTextPipe } from 'src/@shared/pipes/truncate/truncate-text.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { EnumAsStringPipe } from 'src/@shared/pipes/enumAsString/enum-as-string.pipe';
import { AgePipe } from 'src/@shared/pipes/age/age.pipe';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { of, BehaviorSubject } from 'rxjs';
import { ProvidersLocationsComponent } from '../communication-patient-drawer/providers-locations/providers-locations.component';
import { PhoneNumberPipe } from 'src/@shared/pipes/phone-number/phone-number.pipe';
import { AccountMembersComponent } from '../communication-patient-drawer/account-members/account-members.component';
import { PatientFinancialComponent } from '../communication-patient-drawer/patient-financial/patient-financial.component';
import { AdditionalInfoComponent } from '../communication-patient-drawer/additional-info/additional-info.component';
import { CommunicationAppointmentsComponent } from 'src/scheduling/appointments/communication-appointments/communication-appointments.component';
import { DrawerAppointmentCardsComponent } from 'src/scheduling/appointments/communication-appointments/drawer-appointment-cards/drawer-appointment-cards.component';
import { PatientHttpService } from 'src/patient/common/http-providers/patient-http.service';
import { PatientDetailService } from 'src/patient/patient-detail/services/patient-detail.service';
import { AppointmentStatusHoverComponent } from 'src/scheduling/appointment-statuses/appointment-status-hover/appointment-status-hover.component';
import { FormsModule } from '@angular/forms';
import { PatientInsuranceComponent } from '../communication-patient-drawer/patient-insurance/patient-insurance.component';
import { AppointmentStatusHandlingService } from 'src/scheduling/appointment-statuses/appointment-status-handling.service';
import { configureTestSuite } from 'src/configure-test-suite';
import { DatePipe } from '@angular/common';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';

describe('CommunicationPatientDrawerComponent', () => {
    let component: CommunicationPatientDrawerComponent;
    let fixture: ComponentFixture<CommunicationPatientDrawerComponent>;
    let mockFeatureFlagService: jasmine.SpyObj<FeatureFlagService>;
    const updatePatientCommSubjectMock = new BehaviorSubject<{}>(undefined);

    const mockService: any = {
        createPatientCommunication: (a: any, b: any) => of({}),
        getPatientCommunicationByPatientId: (a: any) => of({}),
        createAccountNoteCommunication: (a: any, b: any) => of({}),
        updatePatientCommunication: (a: any, b: any) => of({}),
        setCommunicationEvent: (a: any) => of({}),
        getCommunicationEvent: () => of({}),
        patientDetail: {
            Profile: of({})
        },
        updatePatientCommunications$: updatePatientCommSubjectMock,
        getPatientFlagsAndAlertsByPatientId: (a: any) => of({}),
        getPatientDiscountByPatientId: (a: any) => of({}),
        getPatientAccountOverviewByAccountId: (a: any) => of({}),
        getAdditionalInfoByPatientId: (a: any) => of({}),
        getPrimaryPatientBenefitPlanByPatientId: (a: any) => of({}),
        AlertIcons: () => { },
        ConvertAppointmentDatesTZ: (a: any, b: any) => { },
        get: (a: any) => { },
        entityNames: {
            users: [{ UserId: '12', FirstName: 'FN', LastName: 'LN' }]
        },
        patientId: '4321',
        accountId: '1234',
        getAppointmentsByPatientId: (a: any, b: any) => of({}),
        error: jasmine.createSpy().and.returnValue('Error Message'),
        success: jasmine.createSpy().and.returnValue('Success Message'),
        GetAppointmentEditDataRefactor: (a: any, b: any, c: any) => { },
        LaunchPatientLocationErrorModal: (a: any) => { },
        findItemByFieldValue: (a: any, b: any, c: any) => { },
        getPatientDashboardOverviewByPatientId: (a: any) => new Promise((resolve, reject) => { }),
        setPatientPreferredDentist: (a: any) => { },
        setPatientPreferredHygienist: (a: any) => { },
        getNextAppointmentStartTimeLocalized: (a: any) => { },
        isEnabled: (a: any) =>  new Promise((resolve, reject) => {
        }),
        getViewData: () => of({}),
        transform: (a: any) => { }
    };


    configureTestSuite(() => {
        mockFeatureFlagService = jasmine.createSpyObj('FeatureFlagService', ['getOnce$']);
        mockFeatureFlagService.getOnce$.and.returnValue(of(true));
        TestBed.configureTestingModule({
            declarations: [CommunicationPatientDrawerComponent, GeneralInfoComponent, AlertsFlagsComponent, AgePipe,
                PatientContactComponent, TruncateTextPipe, EnumAsStringPipe, ProvidersLocationsComponent, PhoneNumberPipe,
                AccountMembersComponent, PatientFinancialComponent, AdditionalInfoComponent, CommunicationAppointmentsComponent,
                DrawerAppointmentCardsComponent, AppointmentStatusHoverComponent, PatientInsuranceComponent],
            imports: [TranslateModule.forRoot(), FormsModule],
            providers: [
                { provide: PatientCommunicationCenterService, useValue: mockService },
                { provide: 'StaticData', useValue: mockService },
                { provide: 'referenceDataService', useValue: mockService },
                { provide: '$routeParams', useValue: mockService },
                { provide: 'tabLauncher', useValue: mockService },
                { provide: 'toastrFactory', useValue: mockService },
                { provide: PatientHttpService, useValue: mockService },
                { provide: 'TimeZoneFactory', useValue: mockService },
                { provide: 'ModalDataFactory', useValue: mockService },
                { provide: 'ModalFactory', useValue: mockService },
                { provide: 'PatientValidationFactory', useValue: mockService },
                { provide: 'ListHelper', useValue: mockService },
                { provide: PatientDetailService, useValue: mockService },
                { provide: AppointmentStatusHandlingService, useValue: mockService },
                { provide: 'AppointmentStatusDataService', useValue: mockService },
                { provide: 'tabLauncher', useValue: mockService },
                { provide: 'locationService', useValue: mockService },
                { provide: 'FeatureService', useValue: mockService },
                { provide: 'ScheduleServices', useValue: mockService },
                { provide: 'AppointmentViewVisibleService', useValue: mockService },
                { provide: 'AppointmentViewDataLoadingService', useValue: mockService },
                { provide: DatePipe, useValue: mockService },
                { provide: FeatureFlagService, useValue: mockFeatureFlagService }
            ],
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommunicationPatientDrawerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
