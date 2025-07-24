import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CommunicationCenterComponent } from './communication-center.component';
import { CommunicationCenterTitlebarComponent } from './communication-center-titlebar/communication-center-titlebar.component';
import { CommunicationCenterTimelineComponent } from './communication-center-timeline/communication-center-timeline.component';
import { CommunicationCenterPreviewpaneComponent } from './communication-center-previewpane/communication-center-previewpane.component';
import { CommunicationCenterFilterbarComponent } from './communication-center-filterbar/communication-center-filterbar.component';
import { AppSelectComponent } from 'src/@shared/components/form-controls/select-list/select-list.component';
import { AppButtonComponent } from 'src/@shared/components/form-controls/button/button.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommunicationCardComponent } from './communication-card/communication-card.component';
import { EnumAsStringPipe } from 'src/@shared/pipes/enumAsString/enum-as-string.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { PatientCommunicationCenterService } from '../common/http-providers/patient-communication-center.service';
import { of, BehaviorSubject } from 'rxjs';
import { AppDatePickerComponent } from 'src/@shared/components/form-controls/date-picker/date-picker.component';
import { AppKendoUIModule } from 'src/app-kendo-ui/app-kendo-ui.module';
import { AppRadioButtonComponent } from 'src/@shared/components/form-controls/radio-button/radio-button.component';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { DatePipe } from '@angular/common';
import { CommunicationConstants } from './communication-constants/communication.costants';
import { PatientDetailService } from 'src/patient/patient-detail/services/patient-detail.service';
import { PatientHttpService } from 'src/patient/common/http-providers/patient-http.service';
import { configureTestSuite } from 'src/configure-test-suite';
import { AppLabelComponent } from '../../@shared/components/form-controls/form-label/form-label.component';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProviderOnScheduleDropdownService } from 'src/scheduling/providers/provider-on-schedule-dropdown.service';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
let patSecurityService: any;

describe('CommunicationCenterComponent', () => {
  let component: CommunicationCenterComponent;
  let fixture: ComponentFixture<CommunicationCenterComponent>;
  let patientDetailService: any;
  const subjectMock = new BehaviorSubject<{}>(null);
  const updatePatientCommSubjectMock = new BehaviorSubject<{}>(undefined);
  const mockpatSecurityService = {
    IsAuthorizedByAbbreviation: (authtype: string) => {},
  };
  const mockRouteParams = {
    patientId: '4321',
  };
  const mockreferenceDataService = {
    get: jasmine.createSpy().and.returnValue([{}]),
    entityNames: {
      users: 'users',
    },
  };
  const mockPatientDetailService: any = {
    getPatientDashboardOverviewByPatientId: (a: any) =>
      new Promise((resolve, reject) => {}),
    setPatientPreferredDentist: (a: any) => of({}),
    setPatientPreferredHygienist: (a: any) => of({}),
    getNextAppointmentStartTimeLocalized: (a: any) => {},
  };
  const mockPatientCommunicationCenterService: any = {
    getPatientCommunicationByPatientId: (a: any) => of([{}]),
    deletePatientCommunicationById: (a: any) => of({}),
    toggleDrawer: (a: any) => of([{}]),
    updatePatientCommunications$: updatePatientCommSubjectMock,
    getCommunicationEvent: (a: any) => of({}),
    setCommunicationEvent: (a: any) => of({}),
    getPatientCommunicationToDoByPatientId: (a: any) => of([{}]),
    GetPatientCommunicationTemplates: () => of({}),
    patientDetail: of({}),
    createAccountNoteCommunication: (a: any, b: any) => of({}),
    updatePatientCommunication: (a: any, b: any) => of({}),
    getPatientInfoByPatientId: (a: any) => of({}),
    getPatientNextAppointment: (a: any) => of({}),
  };
  const mockConfirmationModalService = {
    open: jasmine.createSpy().and.returnValue({
      events: {
        pipe: jasmine
          .createSpy()
          .and.returnValue({ subscribe: jasmine.createSpy() }),
      },
      subscribe: jasmine.createSpy(),
      closed: jasmine.createSpy(),
    }),
  };
  const mockTostarfactory: any = {
    error: jasmine.createSpy().and.returnValue('Error Message'),
    success: jasmine.createSpy().and.returnValue('Success Message'),
  };
  const mockDatePipe: any = {
    transform: (a: any) => {},
  };
  const mockCommunicationConstants = {
    deleteToDoConfirmationModalData: {
      header: 'Communication Center',
      message: 'Are you sure you want to delete this communication?',
      confirm: 'Yes',
      cancel: 'No',
    },
  };
  const mockTabLauncher = jasmine.createSpy();
  const mockPatientHttpService: any = {
    getAppointmentsByPatientId: (a: any, b: any) => of({}),
    getPatientNextAppointment: (a: any) => of({}),
  };
  let scheduleFactoryPromise: Promise<any> = new Promise<any>((resolve, reject) => { });
  let mockShowOnScheduleFactory: any = {
    getAll: jasmine.createSpy().and.returnValue(scheduleFactoryPromise)
  };
  const mockReferralSourcesService = {
    get: jasmine.createSpy('get').and.returnValue({
      $promise: Promise.resolve({
        Value: [
          { value: "00000000-0000-0000-0000-000000000001", text: "Email" },
          { value: "00000000-0000-0000-0000-000000000002", text: "Instagram" },
          { value: "00000000-0000-0000-0000-000000000003", text: "Facebook" },
          { value: "00000000-0000-0000-0000-000000000004", text: "LinkedIn" },
          { value: "00000000-0000-0000-0000-000000000005", text: "Twitter" },
          { value: "00000000-0000-0000-0000-000000000006", text: "Other" }
        ]
      })
    })
  };
  const mockFeatureFlagService = {
    getOnce$: jasmine.createSpy().and.returnValue(of("white"))
  }
  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        TranslateModule.forRoot(),
        ReactiveFormsModule,
        AppKendoUIModule,
        HttpClientTestingModule
      ],

      providers: [
        HttpClient,
        ProviderOnScheduleDropdownService,
        { provide: 'patSecurityService', useValue: mockpatSecurityService },
        { provide: '$routeParams', useValue: mockRouteParams },
        { provide: 'referenceDataService', useValue: mockreferenceDataService },
        {
          provide: PatientCommunicationCenterService,
          useValue: mockPatientCommunicationCenterService,
        },
        {
          provide: ConfirmationModalService,
          useValue: mockConfirmationModalService,
        },
        { provide: 'toastrFactory', useValue: mockTostarfactory },
        { provide: DatePipe, useValue: mockDatePipe },
        { provide: 'tabLauncher', useValue: mockTabLauncher },
        {
          provide: CommunicationConstants,
          useValue: mockCommunicationConstants,
        },
        { provide: PatientDetailService, useValue: mockPatientDetailService },
        { provide: PatientHttpService, useValue: mockPatientHttpService },
        { provide: 'SoarConfig', useValue: {} },
        { provide: 'ReferralSourcesService', useValue: mockReferralSourcesService },
        { provide: 'ProviderShowOnScheduleFactory', useValue: mockShowOnScheduleFactory },
        { provide: FeatureFlagService, useValue: mockFeatureFlagService }
      ],
      declarations: [
        CommunicationCenterComponent,
        CommunicationCenterTitlebarComponent,
        CommunicationCenterTimelineComponent,
        CommunicationCenterPreviewpaneComponent,
        CommunicationCenterFilterbarComponent,
        AppSelectComponent,
        AppButtonComponent,
        CommunicationCardComponent,
        EnumAsStringPipe,
        AppDatePickerComponent,
        AppRadioButtonComponent,
        AppLabelComponent,
      ],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunicationCenterComponent);
    patSecurityService = TestBed.get('patSecurityService');
    patientDetailService = TestBed.get(PatientDetailService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
