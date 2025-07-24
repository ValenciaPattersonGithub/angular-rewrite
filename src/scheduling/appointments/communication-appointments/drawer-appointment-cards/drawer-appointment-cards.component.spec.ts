import { ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DrawerAppointmentCardsComponent } from './drawer-appointment-cards.component';
import { PatientHttpService } from 'src/patient/common/http-providers/patient-http.service';
import { of, throwError } from 'rxjs';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { AppointmentStatusHoverComponent } from 'src/scheduling/appointment-statuses/appointment-status-hover/appointment-status-hover.component';
import { FormsModule } from '@angular/forms';
import { AppointmentStatusHandlingService } from 'src/scheduling/appointment-statuses/appointment-status-handling.service';
import { configureTestSuite } from 'src/configure-test-suite';
import { DatePipe } from '@angular/common';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';

describe('AppointmentCardsComponent', () => {
  let component: DrawerAppointmentCardsComponent;
  let fixture: ComponentFixture<DrawerAppointmentCardsComponent>;
  let patientCommunicationService: any;
  let patientService: any;
  let featureService: any;
  let mockFeatureFlagService: jasmine.SpyObj<FeatureFlagService>;

  const mockService = {
    patientId: '4321',
    accountId: '1234',
    setCommunicationEvent: (a: any) => of({}),
    getCommunicationEvent: () => of({}),
    patientDetail: {
      Profile: {
        PersonAccountId: '1234',
      },
    },
    getAppointmentsByPatientId: (a: any, b: any) => of({}),
    error: jasmine.createSpy().and.returnValue('Error Message'),
    success: jasmine.createSpy().and.returnValue('Success Message'),
    ConvertAppointmentDatesTZ: (a: any, b: any) => {},
    GetAppointmentEditDataRefactor: (a: any, b: any, c: any) => {},
    LaunchPatientLocationErrorModal: (a: any) => {},
    findItemByFieldValue: (a: any, b: any, c: any) => {},
    isEnabled: (a: any) => new Promise((resolve, reject) => {}),
    getViewData: () => of({}),
    transform: (a: any) => {},
  };
    configureTestSuite(() => {
    mockFeatureFlagService = jasmine.createSpyObj('FeatureFlagService', ['getOnce$']);
    mockFeatureFlagService.getOnce$.and.returnValue(of(false));
    TestBed.configureTestingModule({
      declarations: [
        DrawerAppointmentCardsComponent,
        AppointmentStatusHoverComponent,
      ],
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
        { provide: FeatureFlagService, useValue: mockFeatureFlagService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DrawerAppointmentCardsComponent);
    patientCommunicationService = TestBed.get(
      PatientCommunicationCenterService
    );
    patientService = TestBed.get(PatientHttpService);
    featureService = TestBed.get('FeatureService');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('getAppointments', () => {
    it('should call patientService.getAppointmentsByPatientId when getAppointments called', () => {
      spyOn(patientService, 'getAppointmentsByPatientId').and.callThrough();
        component.getAppointments();
      expect(patientService.getAppointmentsByPatientId).toHaveBeenCalledWith(
        mockService.patientId,
        false
      );
    });
    it('should call getAppointmentsByPatientIdFailure when patientService.getAppointmentsByPatientId throw Error', () => {
      spyOn(patientService, 'getAppointmentsByPatientId').and.returnValue(
        throwError('Error')
      );
      spyOn(component, 'getAppointmentsByPatientIdFailure').and.callThrough();
      component.getAppointments();
      expect(patientService.getAppointmentsByPatientId).toHaveBeenCalledWith(
        mockService.patientId,
        false
      );
      expect(component.getAppointmentsByPatientIdFailure).toHaveBeenCalled();
    });
  });
});
