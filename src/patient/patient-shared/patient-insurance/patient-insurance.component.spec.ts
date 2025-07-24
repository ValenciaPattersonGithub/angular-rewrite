import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PatientHttpService } from '../../common/http-providers/patient-http.service';
import { PatientRegistrationService } from '../../common/http-providers/patient-registration.service';
import { MockRepository } from '../../patient-profile/patient-profile-mock-repo';
import { PatientInsuranceComponent } from './patient-insurance.component';
import { PatientInsuranceCardComponent } from './patient-insurance-card/patient-insurance-card.component';
import { TranslateModule } from '@ngx-translate/core';
import { AppToggleComponent } from '../../../@shared/components/form-controls/toggle/toggle.component';

describe('PatientInsuranceComponent', () => {
  let component: PatientInsuranceComponent;
  let fixture: ComponentFixture<PatientInsuranceComponent>;
  let patientHttpService: PatientHttpService;
  let mockRepo;
  beforeEach(async () => {
    mockRepo = MockRepository();

    await TestBed.configureTestingModule({
      declarations: [PatientInsuranceComponent, PatientInsuranceCardComponent, AppToggleComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: '$routeParams', useValue: mockRepo.mockService },
        { provide: PatientHttpService, useValue: mockRepo.mockService },
        { provide: PatientRegistrationService, useValue: mockRepo.mockService }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientInsuranceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    patientHttpService = TestBed.inject(PatientHttpService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('getBenefitPlans', () => {
    it('should call patientHttpService.getPatientBenefitPlans when getBenefitPlans called', () => {
      spyOn(patientHttpService, 'getPatientBenefitPlans').and
        .returnValue(of(mockRepo.mockBenefitPlans));
      component.getBenefitPlans(mockRepo.mockService.patientId);
      expect(patientHttpService.getPatientBenefitPlans).toHaveBeenCalled();
      expect(component.patientBenefitPlans).toEqual(mockRepo.mockBenefitPlans);
    });
    it('should call getPatientBenefitPlansByPatientIdFailure when patientHttpService.getPatientBenefitPlans throw Error', () => {
      spyOn(patientHttpService, 'getPatientBenefitPlans').and.returnValue(throwError(() => new Error('Error')));
      spyOn(component, 'getPatientBenefitPlansByPatientIdFailure').and.callThrough();
      component.getBenefitPlans(mockRepo.mockService.patientId);
      expect(patientHttpService.getPatientBenefitPlans).toHaveBeenCalled();
      expect(component.getPatientBenefitPlansByPatientIdFailure).toHaveBeenCalled();
    });
  });
});
