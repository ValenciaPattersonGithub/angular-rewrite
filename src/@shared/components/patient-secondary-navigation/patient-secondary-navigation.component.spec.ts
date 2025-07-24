import { ComponentFixture, TestBed } from '@angular/core/testing';
import { configureTestSuite } from 'src/configure-test-suite';
import { PatientHttpService } from 'src/patient/common/http-providers/patient-http.service';
import { TreatmentPlanEditServicesService } from 'src/treatment-plans/component-providers/treatment-plan-edit-services.service';
import { TranslateModule } from '@ngx-translate/core';
import { PatientSecondaryNavigationComponent } from './patient-secondary-navigation.component';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { RxService } from '../../../rx/common/providers/rx.service';
import { FeatureFlagService } from '../../../featureflag/featureflag.service';
import { of } from 'rxjs';

describe('PatientSecondaryNavigationComponent', () => {
  let component: PatientSecondaryNavigationComponent;
  let fixture: ComponentFixture<PatientSecondaryNavigationComponent>;
  let patSecurityService: any;
  const mockservice = {
    IsAuthorizedByAbbreviation: (authtype: string) => { },
    getServiceStatus: () =>
      new Promise((resolve, reject) => {
        // the resolve / reject functions control the fate of the promise
      }),

    esCancelEvent: new BehaviorSubject<{}>(undefined),
    isEnabled: () => new Promise((resolve, reject) => { }),
    getCurrentLocation: jasmine
      .createSpy()
      .and.returnValue({ practiceId: 'test' }),
  };

  const mockRootScope = {
    patAuthContext: {
      userInfo: {
        userid: 'test'
      }
    }
  };

  const mockRxService = {
    rxAccessCheck: jasmine.createSpy().and.returnValue({ then: () => { return { catch: () => { } } } })
  };

  const mockPracticeSettingsService = {
    get: jasmine.createSpy().and.returnValue(of({}))
  };

  let mockFeatureFlagService: jasmine.SpyObj<FeatureFlagService>;
  mockFeatureFlagService = jasmine.createSpyObj('FeatureFlagService', ['getOnce$']);
  mockFeatureFlagService.getOnce$.and.returnValue(of(false));
  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [PatientSecondaryNavigationComponent],
      // TranslateModule import required for components that use ngx-translate in the view or componenet code
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: '$routeParams', useValue: mockservice },
        { provide: PatientHttpService, useValue: mockservice },
        { provide: 'ImagingMasterService', useValue: mockservice },
        { provide: 'ImagingProviders', useValue: mockservice },
        { provide: 'tabLauncher', useValue: mockservice },
        { provide: 'patSecurityService', useValue: mockservice },
        { provide: TreatmentPlanEditServicesService, useValue: mockservice },
        { provide: 'FeatureService', useValue: mockservice },
        { provide: RxService, useValue: mockRxService },
        { provide: 'CommonServices', useValue: mockPracticeSettingsService },
        { provide: '$rootScope', useValue: mockRootScope },
        { provide: 'locationService', useValue: mockservice },
        { provide: FeatureFlagService, useValue: mockFeatureFlagService },
      ],
    });
  });


  beforeEach(() => {
    fixture = TestBed.createComponent(PatientSecondaryNavigationComponent);
    component = fixture.componentInstance;
    patSecurityService = TestBed.get('patSecurityService');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  //describe('authAccess', () => {
  //    it('should call authAccess and set value true', () => {
  //      spyOn(patSecurityService, 'IsAuthorizedByAbbreviation').
  //        and.returnValue(true);
  //      component.authAccess();
  //      expect(component.hasHealthAccess).toEqual(true);
  //      expect(component.hasRXAccess).toEqual(true);
  //      expect(component.hasPerioAccess).toEqual(true);
  //      expect(component.hasImagesAccess).toEqual(true);
  //      expect(component.hasCaesyCloudAccess).toEqual(true);
  //    });
  //    it('should call authAccess and set value false', () => {
  //      spyOn(patSecurityService, 'IsAuthorizedByAbbreviation').
  //        and.returnValue(false);
  //      component.authAccess();
  //      expect(component.hasHealthAccess).toEqual(false);
  //      expect(component.hasRXAccess).toEqual(false);
  //      expect(component.hasPerioAccess).toEqual(false);
  //      expect(component.hasImagesAccess).toEqual(false);
  //      expect(component.hasCaesyCloudAccess).toEqual(false);
  //    });
  //  });
});
