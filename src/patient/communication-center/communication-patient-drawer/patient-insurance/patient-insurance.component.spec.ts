import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { PatientInsuranceComponent } from './patient-insurance.component';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { of, throwError } from 'rxjs';
import { PhoneNumberPipe } from 'src/@shared/pipes/phone-number/phone-number.pipe';
import { configureTestSuite } from 'src/configure-test-suite';

describe('PatientInsuranceComponent', () => {
  let component: PatientInsuranceComponent;
  let fixture: ComponentFixture<PatientInsuranceComponent>;
  let patientCommunicationService: any;

  const mockRouteParams = {
    patientId: '4321',
    accountId: '1234',
};
const mockTabLauncher = jasmine.createSpy();
const mockTostarfactory: any = {
    error: jasmine.createSpy().and.returnValue('Error Message'),
    success: jasmine.createSpy().and.returnValue('Success Message')
};
const mockPatientCommunicationCenterService: any = {
    getPrimaryPatientBenefitPlanByPatientId: (a: any) => of({})
};

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientInsuranceComponent, PhoneNumberPipe ],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: '$routeParams', useValue: mockRouteParams },
        { provide: 'tabLauncher', useValue: mockTabLauncher },
        { provide: 'toastrFactory', useValue: mockTostarfactory },
        { provide: PatientCommunicationCenterService, useValue: mockPatientCommunicationCenterService }
    ],
    });
});

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientInsuranceComponent);
    patientCommunicationService = TestBed.get(PatientCommunicationCenterService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('getPrimaryPatientBenefitPlan', () => {
    it('should call patientCommunicationCenterService.getPrimaryPatientBenefitPlanByPatientId when getPrimaryPatientBenefitPlan called', () => {
      spyOn(patientCommunicationService, 'getPrimaryPatientBenefitPlanByPatientId').and.callThrough();
      component.getPrimaryPatientBenefitPlan(mockRouteParams.patientId)
      expect(patientCommunicationService.getPrimaryPatientBenefitPlanByPatientId)
        .toHaveBeenCalledWith(mockRouteParams.patientId);
    });

    it('should call getPrimaryPatientBenefitPlanByPatientIdFailure when patientCommunicationCenterService.getPrimaryPatientBenefitPlan throw Error', () => {
      spyOn(patientCommunicationService, 'getPrimaryPatientBenefitPlanByPatientId').and.returnValue(throwError('Error'));
      spyOn(component, 'getPrimaryPatientBenefitPlanByPatientIdFailure').and.callThrough();
      component.getPrimaryPatientBenefitPlan(mockRouteParams.patientId);
      expect(patientCommunicationService.getPrimaryPatientBenefitPlanByPatientId)
        .toHaveBeenCalledWith(mockRouteParams.patientId);
      expect(component.getPrimaryPatientBenefitPlanByPatientIdFailure).toHaveBeenCalled();
    });
  });
  describe('getDisplayName', () => {
    it('should get PolicyHolderName when getDisplayName called', () => {
    const insuranceInfo = {
        PolicyHolderLastName: 'Last Name',
        Suffix: 'S',
        PolicyHolderFirstName: 'First Name',
        PolicyHolderMiddleName: 'Middle Name',
        PolicyHolderPreferredName: 'PN'
    }
      component.getDisplayName(insuranceInfo)
      expect(component.patientName).toEqual('Last Name S, First Name M (PN)');
    });
  });
});
