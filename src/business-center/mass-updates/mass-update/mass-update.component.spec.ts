import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { AppCheckBoxComponent } from 'src/@shared/components/form-controls/check-box/check-box.component';
import { AppLabelComponent } from 'src/@shared/components/form-controls/form-label/form-label.component';
import { AppMultiselectComponent } from 'src/@shared/components/form-controls/multiselect/multiselect.component';
import { AppRadioButtonComponent } from 'src/@shared/components/form-controls/radio-button/radio-button.component';
import { SvgIconComponent } from 'src/@shared/components/svg-icons/svg-icon.component';
import { TopNavigationComponent } from 'src/@shared/components/top-navigation/top-navigation.component';
import { MenuHelper } from 'src/@shared/providers/menu-helper';
import { AppKendoUIModule } from 'src/app-kendo-ui/app-kendo-ui.module';
import { configureTestSuite } from 'src/configure-test-suite';
import { MassUpdateComponent } from './mass-update.component';
import { ToShortDisplayDateUtcPipe } from 'src/@shared/pipes/dates/to-short-display-date-utc.pipe';
import { ToDisplayTimePipe } from 'src/@shared/pipes/time/to-display-time.pipe';
import { OrderByPipe, SearchPipe } from 'src/@shared/pipes';
import { Subscription, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { ServerlessSignalrHubConnectionService } from '../../../@shared/providers/serverless-signalr-hub-connection.service';
import { MicroServiceApiService } from 'src/security/providers';

describe('MassUpdateComponent', () => {
  let component: MassUpdateComponent;
  let fixture: ComponentFixture<MassUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MassUpdateComponent, OrderByPipe, SearchPipe],
    }).compileComponents();
  });
  let emptyGuId = '00000000-0000-0000-0000-000000000000';
  const mockservice = {
    IsAuthorizedByAbbreviation: (authtype: string) => {},
    getServiceStatus: () =>
      new Promise((resolve, reject) => {
        // the resolve / reject functions control the fate of the promise
      }),
    esCancelEvent: new BehaviorSubject<{}>(undefined),
    isEnabled: () => new Promise((resolve, reject) => {}),
    getCurrentLocation: jasmine
      .createSpy()
      .and.returnValue({ practiceId: 'test' }),
    getCurrentPractice: jasmine.createSpy().and.returnValue({ id: 'testId' }),
    getCurrentPracticeLocations: () => new Promise((resolve, reject) => {}),
  };

  const mockReferenceDataService = {
    get: jasmine.createSpy().and.returnValue([]),
    entityNames: {
      practiceSettings: 'test',
    },
  };
  const mockpatSecurityService = {
    IsAuthorizedByAbbreviation: (authtype: string) => {},
  };
  const mockfeatureservice = {
    isEnabled: (a: any) => new Promise((resolve, reject) => {}),
  };

  let mockPracticeService = {
    getCurrentPractice: jasmine.createSpy().and.returnValue({ id: 'testId' }),
  };
  let userContextSpy = jasmine
    .createSpy()
    .and.returnValue({ Result: { User: { UserId: 'testUserId' } } });
  const mockToastrFactory = {
    success: jasmine.createSpy('toastrFactory.success'),
    error: jasmine.createSpy('toastrFactory.error'),
  };

  const mockLocalizeService: any = {
    getLocalizedString: () => 'translated text',
  };

  const mockplatformSessionCachingService = {
    userContext: { get: userContextSpy },
    };

    const mockMicroServiceApiUrlConfig = [{
        enterpriseApiUrl: 'mockEntApiUrl', stsApi: 'mockstsApiUrl', domainApi: 'mockdomainApiUrl',
        claimApi: 'mockclaimApiUrl'
        , eraApi: 'mockeraApiUrl'
        , fileApi: 'mockfileApiUrl'
        , rxApi: 'mockrxApiUrl'
        , schedulingApi: 'mockschedulingApiUrl'
        , practicesApi: 'mockpracticesApiUrl'
        , insuranceApi: 'mockinsuranceApiUrl'
        , treatmentPlansApi: 'mocktreatmentPlansApiUrl'
        , serverlessSignalRApi: 'mockserverlessSignalRApiUrl'
        , reportingApi: 'mockreportingApiUrl'
        , prescriptionsApiUrl: 'prescriptionsApiUrl'
        , blueImagingApiUrl: 'mockblueImagingApiUrl'
        , clinicalApi: 'mockclinicalApiUrl'
        , sapiSchedulingApi: 'mocksapiSchedulingApiUrl'
        , insuranceSapi: 'mockinsuranceSapiUrl'
    }];

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        MassUpdateComponent,
        AppMultiselectComponent,
        AppRadioButtonComponent,
        AppCheckBoxComponent,
        AppLabelComponent,
        TopNavigationComponent,
        SvgIconComponent,
        ToShortDisplayDateUtcPipe,
        ToDisplayTimePipe,
      ],
      // TranslateModule import required for components that use ngx-translate in the view or componenet code
      imports: [
        FormsModule,
        ReactiveFormsModule,
        AppKendoUIModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot(),
        HttpClientTestingModule,
      ],
      providers: [
        MenuHelper,
        HttpClient,
        ServerlessSignalrHubConnectionService,
        MicroServiceApiService,
        { provide: 'MicroServiceApiUrlConfig', useValue: mockMicroServiceApiUrlConfig },
        { provide: 'referenceDataService', useValue: mockReferenceDataService },
        { provide: 'locationService', useValue: mockservice },
        { provide: 'patSecurityService', useValue: mockpatSecurityService },
        { provide: 'FeatureService', useValue: mockfeatureservice },
        {
          provide: 'platformSessionCachingService',
          useValue: mockplatformSessionCachingService,
        },
        { provide: 'practiceService', useValue: mockPracticeService },
        { provide: 'SoarConfig', useValue: {} },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: 'localize', useValue: mockLocalizeService },
        { provide: '$rootScope', useValue: mockservice },
      ],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MassUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('ngOnInit', () => {
    beforeEach(() => {});

    it('should call ngOnInit', () => {
      component.ngOnInit();
    });

    it('should call export', () => {
      component.export(1, emptyGuId);
    });
  });
});
