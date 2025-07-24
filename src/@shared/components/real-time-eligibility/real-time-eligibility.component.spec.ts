import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BenefitPlanPriorityStatus, RealTimeEligibilityComponent } from './real-time-eligibility.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { of } from 'rxjs';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { PatientBenefitPlanLiteDto } from 'src/@core/models/patient-benefit-plan-dtos.model';
import cloneDeep from 'lodash/cloneDeep';
import { PatientCurrentLocation } from 'src/patient/common/models/patient-location.model';
import { SoarPatientBenefitPlanHttpService } from 'src/@core/http-services/soar-patient-benefit-plan-http.service';
import { EventEmitter } from '@angular/core';

describe('RealTimeEligibilityComponent', () => {
  let component: RealTimeEligibilityComponent;
  let fixture: ComponentFixture<RealTimeEligibilityComponent>;

  let mockSoarPatientBenefitPlanHttpService;
  let mockRealTimeEligibilityFactory;
  let mockModalFactory;
  let mockFeatureFlagService;
  let mockTranslateService;
  let mockLocationService;
  let mockLocationServices;
  let mockGetLocationRteEnrollmentStatus;
  let rootScope;
  let patientBenefitPlanLiteDtos: PatientBenefitPlanLiteDto[];
  let mockCurrentLocation: PatientCurrentLocation;

  beforeEach(() => {
    mockCurrentLocation = {
      id: 5053276,
      name: 'PracticePerf38638 (CDT)',
      practiceid: 38638,
      merchantid: '',
      description: 'ABCD',
      timezone: 'Central Standard Time',
      deactivationTimeUtc: null,
      status: 'Active',
      sort: 1,
    };
    patientBenefitPlanLiteDtos = [
      {
        PatientBenefitPlanId: '1234656',
        PatientId: '234567',
        BenefitPlanId: '345678',
        PolicyHolderBenefitPlanId: '456789',
        Priority: 0,
        CarrierName: 'CarrierName1',
        PlanName: 'PlanName1',
        IsDeleted: false,
        label: '',
        PriorityLabel: '',
      },
      {
        PatientBenefitPlanId: '234656',
        PatientId: '345678',
        BenefitPlanId: '456789',
        PolicyHolderBenefitPlanId: '567891',
        Priority: 1,
        CarrierName: 'CarrierName2',
        PlanName: 'PlanName2',
        IsDeleted: false,
        label: '',
        PriorityLabel: '',
      },
    ];
    mockGetLocationRteEnrollmentStatus = {
      Result: false,
    };

    mockLocationService = {
      getCurrentLocation: jasmine.createSpy('LocationService.getCurrentLocation').and.returnValue(mockCurrentLocation),
    };

    rootScope = {
      $on: jasmine.createSpy().and.returnValue(mockLocationService.getCurrentLocation),
    };

    mockLocationServices = {
      getLocationRteEnrollmentStatus: jasmine
        .createSpy('LocationServices.getLocationRteEnrollmentStatus')
        .and.returnValue(of(mockGetLocationRteEnrollmentStatus)),
    };

    mockRealTimeEligibilityFactory = {
      checkRTE: () => {},
    };
    mockModalFactory = {
      ConfirmModal: () => {},
    };
    mockFeatureFlagService = {
      getOnce$: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() }),
    };

    mockTranslateService = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant']);

    mockSoarPatientBenefitPlanHttpService = {
      requestPatientBenefitPlansMinimal: jasmine
        .createSpy('SoarPatientBenefitPlanHttpService.requestActiveBenefitPlans')
        .and.returnValue(
          of({
            Value: [],
          })
        ),
    };
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), DropDownsModule],
      declarations: [RealTimeEligibilityComponent],
      providers: [
        { provide: '$rootScope', useValue: rootScope },
        { provide: 'locationService', useValue: mockLocationService },
        { provide: 'LocationServices', useValue: mockLocationServices },
        { provide: 'RealTimeEligibilityFactory', useValue: mockRealTimeEligibilityFactory },
        { provide: SoarPatientBenefitPlanHttpService, useValue: mockSoarPatientBenefitPlanHttpService },
        { provide: 'ModalFactory', useValue: mockModalFactory },
        { provide: FeatureFlagService, useValue: mockFeatureFlagService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RealTimeEligibilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initial values ', () => {
    it('component should exist', () => {
      expect(component).not.toBeNull();
    });
  });

  describe('ngOnInit -->', () => {
    it('should call locationService.getCurrentLocation', () => {
      component.ngOnInit();
      expect(mockLocationService.getCurrentLocation).toHaveBeenCalled();
    });

    it('should call checkFeatureFlags', () => {
      spyOn(component, 'checkFeatureFlags');
      component.ngOnInit();
      expect(component.checkFeatureFlags).toHaveBeenCalled();
    });
  });

  describe('loadBenefitPlans -->', () => {
    beforeEach(() => {
      component.patientBenefitPlanLiteDtos = cloneDeep(patientBenefitPlanLiteDtos);
      component.patientId = '234567';
      spyOn(component, 'priorityLabel');
      spyOn(component, 'addDropdownLabel');
    });

    it('should call soarPatientBenefitPlanHttpService.requestPatientBenefitPlansMinimal when patientId exists and plansLoaded equals false', () => {
      component.plansLoaded = false;
      component.loadBenefitPlans();
      expect(mockSoarPatientBenefitPlanHttpService.requestPatientBenefitPlansMinimal).toHaveBeenCalledWith({
        patientId: component.patientId,
      });
    });

    it('should set the tooltip message for no benefit plans attached', () => {
      component.plansLoaded = false;
      component.loadBenefitPlans();
      expect(component.tooltipMessage).toBe('No benefit plan attached to this patient');
    });

    it('should call priorityLabel and addDropdownLabel when soarPatientBenefitPlanHttpService.requestPatientBenefitPlansMinimal returns benefit plans', (done: DoneFn) => {
      component.plansLoaded = false;
      const value = { Value: patientBenefitPlanLiteDtos };
      component.loadBenefitPlans();
      mockSoarPatientBenefitPlanHttpService
        .requestPatientBenefitPlansMinimal({ patientId: component.patientId })
        .subscribe(value => {
          value.Value.forEach(plan => {
            expect(component.priorityLabel).toHaveBeenCalledWith(plan);
            expect(component.addDropdownLabel).toHaveBeenCalledWith(plan);
          });
          done();
        });
    });

    it('When plansLoaded equals true it should do nothing', () => {
      component.plansLoaded = true;
      component.loadBenefitPlans();
      expect(mockSoarPatientBenefitPlanHttpService.requestPatientBenefitPlansMinimal).not.toHaveBeenCalled;
    });
  });

  describe('checkLocationEnrollmentStatus -->', () => {
    it('should call locationServices Api when eligibility is null', () => {
      component.loggedInLocation = mockCurrentLocation;
      component.eligibility = null;
      component.setToolTipMessage = jasmine.createSpy();
      component.checkLocationEnrollmentStatus();
      expect(mockLocationServices.getLocationRteEnrollmentStatus).toHaveBeenCalledWith({
        locationId: component.loggedInLocation.id,
      });
    });
  });

  describe('setToolTipMessage -->', () => {
    it('should set the tooltip message for non-enrolled location and no benefit plans', () => {
      component.locationEnrolledInRTE = false;
      component.patientBenefitPlanLiteDtos = [];
      mockTranslateService.instant = jasmine
        .createSpy()
        .and.returnValue('Call Patterson Sales at 800.294.8504 to enroll with RTE');
      component.setToolTipMessage();
      expect(component.tooltipMessage).toBe('Call Patterson Sales at 800.294.8504 to enroll with RTE');
    });


    it('should clear the tooltip message when conditions are met', () => {
      component.locationEnrolledInRTE = true;
      component.patientBenefitPlanLiteDtos = patientBenefitPlanLiteDtos;
      component.setToolTipMessage();
      expect(component.tooltipMessage).toBe('');
    });
  });

  describe('priorityLabel -->', () => {
    it('should set PriorityLabel to "primary" when Priority is 0', () => {
      const benefitPlan = { Priority: 0, PriorityLabel: 'Primary' };
      component.priorityLabel(benefitPlan);
      expect(benefitPlan.PriorityLabel).toBe(BenefitPlanPriorityStatus.primary);
    });

    it('should set PriorityLabel to "secondary" when Priority is 1', () => {
      const benefitPlan = { Priority: 1, PriorityLabel: 'Secondary' };
      component.priorityLabel(benefitPlan);
      expect(benefitPlan.PriorityLabel).toBe(BenefitPlanPriorityStatus.secondary);
    });
    it('should set PriorityLabel to "secondary" when Priority is 2', () => {
      const benefitPlan = { Priority: 2, PriorityLabel: 'Secondary' };
      component.priorityLabel(benefitPlan);
      expect(benefitPlan.PriorityLabel).toBe(BenefitPlanPriorityStatus.third);
    });
    it('should set PriorityLabel to "secondary" when Priority is 3', () => {
      const benefitPlan = { Priority: 3, PriorityLabel: 'Secondary' };
      component.priorityLabel(benefitPlan);
      expect(benefitPlan.PriorityLabel).toBe(BenefitPlanPriorityStatus.forth);
    });
    it('should set PriorityLabel to "secondary" when Priority is 4', () => {
      const benefitPlan = { Priority: 4, PriorityLabel: 'Secondary' };
      component.priorityLabel(benefitPlan);
      expect(benefitPlan.PriorityLabel).toBe(BenefitPlanPriorityStatus.fifth);
    });
    it('should set PriorityLabel to "secondary" when Priority is 5', () => {
      const benefitPlan = { Priority: 5, PriorityLabel: 'Secondary' };
      component.priorityLabel(benefitPlan);
      expect(benefitPlan.PriorityLabel).toBe(BenefitPlanPriorityStatus.sixth);
    });
  });

  describe('addDropdownLabel -->', () => {
    it('should add a valid label when all properties are available', () => {
      const benefitPlan = patientBenefitPlanLiteDtos[0];
      mockTranslateService.instant = jasmine.createSpy().and.returnValue('Primary - CarrierName/BenefitPlanName');
      component.priorityLabel(benefitPlan);
      component.addDropdownLabel(benefitPlan);
      expect(benefitPlan?.label).toEqual('Primary - CarrierName1/PlanName1');
    });
  });

  describe('onSectionSelectedChange -->', () => {
    it('should call RealTimeEligibilityFactory', () => {
      const selectedPlanId = { PatientBenefitPlanId: 'c0089168-0560-4f96-a31a-733f9ff07047' };
      mockRealTimeEligibilityFactory.checkRTE = jasmine.createSpy();
      component.allowRTE = true;
      component.onSectionSelectedChange(selectedPlanId);
      expect(mockRealTimeEligibilityFactory.checkRTE).toHaveBeenCalledWith(
        component.patientId,
        selectedPlanId.PatientBenefitPlanId
      );
    });
  });

  describe('registerOnChange -->', () => {
    it('should set onchange event', () => {
      const event: EventEmitter<string> = new EventEmitter<string>();
      component.registerOnChange(event);
      expect(component.onChange).not.toBeNull();
    });
  });

  describe('registerOnTouched -->', () => {
    it('should set onTouched event', () => {
      const event: EventEmitter<string> = new EventEmitter<string>();
      component.registerOnTouched(event);
      expect(component.onTouched).not.toBeNull();
    });
  });
});
