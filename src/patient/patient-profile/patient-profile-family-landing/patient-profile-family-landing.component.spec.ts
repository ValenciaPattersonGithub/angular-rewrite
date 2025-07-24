import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { PatientRegistrationService } from 'src/patient/common/http-providers/patient-registration.service';
import { PatientDetailService } from 'src/patient/patient-detail/services/patient-detail.service';
import { PatientPreferencesComponent } from '../patient-preferences/patient-preferences.component';
import { AppLabelComponent } from 'src/@shared/components/form-controls/form-label/form-label.component';
import { PatientProfileFamilyLandingComponent } from './patient-profile-family-landing.component';
import { PatientContactDetailsComponent } from '../patient-contact-details/patient-contact-details.component';
import { PatientAccountMembersComponent } from 'src/patient/patient-shared/patient-account-members/patient-account-members.component';
import { PatientAdditionalIdentifiersComponent } from '../patient-additional-identifiers/patient-additional-identifiers.component';
import { PatientDentalRecordsComponent } from '../patient-dental-records/patient-dental-records.component';
import { PatientReferralsComponent } from '../patient-referrals/patient-referrals.component';
import { PatientHttpService } from 'src/patient/common/http-providers/patient-http.service';
import { PhoneNumberPipe } from 'src/@shared/pipes/phone-number/phone-number.pipe';
import { DatePipe } from '@angular/common';
import { MockRepository } from 'src/patient/patient-profile/patient-profile-mock-repo';
import { PatientInsuranceComponent } from 'src/patient/patient-shared/patient-insurance/patient-insurance.component';
import { SharedModule } from 'src/@shared/shared.module';
import { ToastService } from 'src/@shared/components/toaster/toast.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

let mockPatSecurityService;

describe('PatientProfileFamilyLandingComponent', () => {
  let component: PatientProfileFamilyLandingComponent;
  let fixture: ComponentFixture<PatientProfileFamilyLandingComponent>;
  let patientCommunicationCenterService: PatientCommunicationCenterService;
  let toastService: ToastService;
  let mockRepo;
  // let patSecurityService: any;
  beforeEach(async () => {
    mockRepo = MockRepository();

    mockPatSecurityService = {
      IsAuthorizedByAbbreviation: jasmine
        .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
        .and.returnValue(true),
    };

    await TestBed.configureTestingModule({
      declarations: [
        PatientProfileFamilyLandingComponent,
        PatientPreferencesComponent,
        AppLabelComponent,
        PatientContactDetailsComponent,
        PatientAccountMembersComponent,
        PatientAdditionalIdentifiersComponent,
        PatientDentalRecordsComponent,
        PatientReferralsComponent,
        PhoneNumberPipe,
        PatientInsuranceComponent,
      ],
      imports: [TranslateModule.forRoot(), SharedModule],
      providers: [
        {
          provide: 'referenceDataService',
          useValue: mockRepo.mockService,
        },
        { provide: '$routeParams', useValue: mockRepo.mockService },
        {
          provide: PatientCommunicationCenterService,
          useValue: mockRepo.mockService,
        },
        { provide: PatientDetailService, useValue: mockRepo.mockService },
        {
          provide: PatientRegistrationService,
          useValue: mockRepo.mockService,
        },
        { provide: 'patSecurityService', useValue: mockPatSecurityService },
        { provide: 'toastrFactory', useValue: mockRepo.mockService },
        { provide: 'StaticData', useValue: mockRepo.mockService },
        { provide: 'tabLauncher', useValue: mockRepo.mockService },
        { provide: PatientHttpService, useValue: mockRepo.mockService },
        { provide: DatePipe, useValue: mockRepo.mockService },
        { provide: 'DocumentService', useValue: mockRepo.mockService },
        {
          provide: 'DocumentGroupsService',
          useValue: mockRepo.mockService,
        },
        { provide: 'ListHelper', useValue: mockRepo.mockService },
        { provide: 'ModalFactory', useValue: mockRepo.mockService },
        {
          provide: 'InformedConsentFactory',
          useValue: mockRepo.mockService,
        },
        {
          provide: 'TreatmentPlanDocumentFactory',
          useValue: mockRepo.mockService,
        },
        { provide: '$window', useValue: mockRepo.mockService },
        {
          provide: 'DocumentsLoadingService',
          useValue: mockRepo.mockService,
        },
        { provide: 'FileUploadFactory', useValue: mockRepo.mockService },
        { provide: ToastService, useValue: mockRepo.mockService },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientProfileFamilyLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    patientCommunicationCenterService = TestBed.inject(
      PatientCommunicationCenterService
    );
    toastService = TestBed.inject(ToastService);
    // patSecurityService = TestBed.inject(mockPatSecurityService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('familyTabgetPatientInfoByPatientId', () => {
    it('should call patientCommunicationCenterService.getPatientInfoByPatientId when getPatientInfoByPatientId called', () => {
      spyOn(
        patientCommunicationCenterService,
        'getPatientInfoByPatientId'
      ).and.returnValue(of(mockRepo.mockPatientInfo));
      spyOn(toastService, 'show').and.callThrough();
      component.getPatientInfo();
      expect(
        patientCommunicationCenterService.getPatientInfoByPatientId
      ).toHaveBeenCalled();
      expect(toastService.show).toHaveBeenCalledTimes(0);
      expect(component.patientInfo).toEqual(mockRepo.mockPatientInfo);
    });
    it('should call getPatientInfoByPatientIdFailure when patientCommunicationCenterService.PatientCommunicationCenterService throw Error', () => {
      spyOn(
        patientCommunicationCenterService,
        'getPatientInfoByPatientId'
      ).and.returnValue(throwError(() => new Error('Error')));
      spyOn(component, 'getPatientInfoByPatientIdFailure').and.callThrough();
      component.getPatientInfo();
      expect(
        patientCommunicationCenterService.getPatientInfoByPatientId
      ).toHaveBeenCalled();
      expect(component.getPatientInfoByPatientIdFailure).toHaveBeenCalled();
    });
    it('should call toastService.show when getPatientInfoByPatientId return No RP', () => {
      const patientInfo = mockRepo.mockPatientInfo;
      patientInfo.ResponsiblePersonName = '';
      spyOn(
        patientCommunicationCenterService,
        'getPatientInfoByPatientId'
      ).and.returnValue(of(patientInfo));
      spyOn(toastService, 'show').and.callThrough();
      component.getPatientInfo();
      expect(
        patientCommunicationCenterService.getPatientInfoByPatientId
      ).toHaveBeenCalled();
      expect(toastService.show).toHaveBeenCalledTimes(1);
      expect(component.patientInfo).toEqual(mockRepo.mockPatientInfo);
    });
  });
});
