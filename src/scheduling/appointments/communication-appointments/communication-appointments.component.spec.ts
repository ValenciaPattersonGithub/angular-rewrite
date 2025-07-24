import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CommunicationAppointmentsComponent } from 'src/scheduling/appointments/communication-appointments/communication-appointments.component';
import { DrawerAppointmentCardsComponent } from 'src/scheduling/appointments/communication-appointments/drawer-appointment-cards/drawer-appointment-cards.component';
import { PatientHttpService } from 'src/patient/common/http-providers/patient-http.service';
import { of } from 'rxjs';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { AppointmentStatusHoverComponent } from 'src/scheduling/appointment-statuses/appointment-status-hover/appointment-status-hover.component';
import { FormsModule } from '@angular/forms';
import { AppointmentStatusHandlingService } from 'src/scheduling/appointment-statuses/appointment-status-handling.service';
import { configureTestSuite } from 'src/configure-test-suite';
import { DatePipe } from '@angular/common';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';

describe('AppointmentsComponent', () => {
    let component: CommunicationAppointmentsComponent;
    let fixture: ComponentFixture<CommunicationAppointmentsComponent>;
    let patientCommunicationService: any;

    const mockService: any = {
        patientId: '4321',
        accountId: '1234',
        patientDetail: of({}),
        setCommunicationEvent: (a: any) => of({}),
        getCommunicationEvent: () => of({}),
        getAppointmentsByPatientId: (a: any, b: any) => of({}),
        error: jasmine.createSpy().and.returnValue('Error Message'),
        success: jasmine.createSpy().and.returnValue('Success Message'),
        ConvertAppointmentDatesTZ: (a: any, b: any) => { },
        GetAppointmentEditDataRefactor: (a: any, b: any, c: any) => { },
        LaunchPatientLocationErrorModal: (a: any) => { },
        findItemByFieldValue: (a: any, b: any, c: any) => { },
        isEnabled: (a: any) =>  new Promise((resolve, reject) => {
        }),
        getViewData: () => of({}),
        transform: (a: any) => { }
    };


    configureTestSuite(() => {
        TestBed.configureTestingModule({
            declarations: [CommunicationAppointmentsComponent, DrawerAppointmentCardsComponent, AppointmentStatusHoverComponent],
            imports: [TranslateModule.forRoot(), FormsModule],
            providers: [
                { provide: '$routeParams', useValue: mockService },
                { provide: PatientHttpService, useValue: mockService },
                { provide: 'toastrFactory', useValue: mockService },
                { provide: 'TimeZoneFactory', useValue: mockService },
                { provide: PatientCommunicationCenterService, useValue: mockService },
                { provide: 'ModalDataFactory', useValue: mockService },
                { provide: 'ModalFactory', useValue: mockService },
                { provide: 'PatientValidationFactory', useValue: mockService },
                { provide: 'ListHelper', useValue: mockService },
                { provide: AppointmentStatusHandlingService, useValue: mockService },
                { provide: 'AppointmentStatusDataService', useValue: mockService },
                { provide: 'tabLauncher', useValue: mockService },
                { provide: 'locationService', useValue: mockService },
                { provide: 'FeatureService', useValue: mockService },
                { provide: 'ScheduleServices', useValue: mockService },
                { provide: 'AppointmentViewVisibleService', useValue: mockService },
                { provide: 'AppointmentViewDataLoadingService', useValue: mockService },
                { provide: DatePipe, useValue: mockService },
                { provide: FeatureFlagService, useValue: { getOnce$: () => of(false) } }
            ],
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommunicationAppointmentsComponent);
        patientCommunicationService = TestBed.get(PatientCommunicationCenterService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
