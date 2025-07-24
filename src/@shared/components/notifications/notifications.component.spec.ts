import { HttpClient,HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { of } from 'rxjs';
import { LegacyLocationService } from '../../../@core/data-services/legacy-location.service';
import { FeatureFlagService } from '../../../featureflag/featureflag.service';
import { RxService } from '../../../rx/common/providers/rx.service';
import { MicroServiceApiService } from '../../../security/providers';
import { EnterpriseService } from '../../providers/enterprise/enterprise.service';
import { ServerlessSignalrHubConnectionService } from '../../providers/serverless-signalr-hub-connection.service';

import { NotificationsComponent } from './notifications.component';

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;
    let mockFeatureFlagService: jasmine.SpyObj<FeatureFlagService>
    let mockLocationServices: jasmine.SpyObj<{ getLocationSRHEnrollmentStatus: () => { $promise: Promise<{ Result: boolean; }> }; }>;
    let mockUserServices;

    const mockService = {
        error: jasmine.createSpy().and.returnValue('Error Message'),
        success: jasmine.createSpy().and.returnValue('Success Message'),
        LaunchPatientLocationErrorModal: (a: any) => { },
        SetCheckingUserPatientAuthorization: (a: any) => { },
        transform: (a: any) => { },
        ConfirmModal: (a: any, b: any, c: any, d: any) => { },
        PatientSearchValidation: (a: any) => { },
        CheckPatientLocation: (a: any, b: any) => { },
        patientSearch: (a: any) => of({}),
        Patients: {
            get: (a: any) => { }
        },
        Persons: {
            get: (a: any) => { }
        },
        getRegistrationEvent: (a: any) => of({}),
        setRegistrationEvent: (a: any) => of({})
    };

    const mockMicroServiceApiUrlConfig = {
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
};
    const mockMicroServiceApiService = {
        getInsuranceUrl: jasmine.createSpy().and.returnValue('mockUrl'),
        getServerlessSignalRUrl: jasmine.createSpy().and.returnValue('mockserverlessSignalRApiUrl'),
        getEnterpriseApiUrl: jasmine.createSpy().and.returnValue('mockEntApiUrl'),
        getPrescriptionsApiUrl: jasmine.createSpy().and.returnValue('mockRxApiUrl')
    }
    const mockRootScope = {

        patAuthContext: {
            userInfo: {
                userid: 'test'
            }
        }
    };
    
    let mockReportsFactory;
    mockReportsFactory = {
        GetReportArray: jasmine.createSpy('[17]'),
        OpenReportPage: jasmine.createSpy()
    };

    let mockToastrFactory = {
        success: jasmine.createSpy('toastrFactory.success'),
        error: jasmine.createSpy('toastrFactory.error')
    };

    let mockLocalizeService = {
        getLocalizedString: () => 'translated text'
    };
    let practiceService;

    let configSettingsService;
    configSettingsService = {
        get: jasmine.createSpy().and.returnValue([]),
        entityNames: {
            practiceSettings: 'test',
        },
    };

    mockUserServices = {
        Users: {
            get: jasmine.createSpy().and.callFake((array) => {
                return {
                    then(callback) {
                        callback(array);
                    }
                };
            })
        }
    };


    beforeEach(async () => {

        mockFeatureFlagService = jasmine.createSpyObj('FeatureFlagService', ['getOnce$']);
        mockFeatureFlagService.getOnce$.and.returnValue(of(true));

        mockLocationServices = jasmine.createSpyObj('LocationServices', ['getLocationSRHEnrollmentStatus']);
        mockLocationServices.getLocationSRHEnrollmentStatus.and.returnValue({ $promise: Promise.resolve({ Result: true }) });

        practiceService =
        {
            getCurrentPractice: jasmine.createSpy().and.returnValue({ id: '1' }),
        };

        const mockpatSecurityService = {
            IsAuthorizedByAbbreviation: (authtype: string) => { },
        };

        let userContextSpy = jasmine
            .createSpy()
            .and.returnValue({ Result: { User: { UserId: 'testUserId' } } });

        const mockplatformSessionCachingService = {
            userContext: { get: userContextSpy },
        };

        const mockReferenceDataService = {
            get: jasmine.createSpy().and.returnValue([]),
            entityNames: {
                practiceSettings: 'test',
            },
        };

        const userRxFactory = {
            RxNotifications: jasmine.createSpy().and.returnValue({
                then: jasmine.createSpy(),
            }),
            NotificationFailed: jasmine.createSpy(),
            SetRxNotificationsTimer: jasmine.createSpy(),
            observeNotifications: jasmine.createSpy(),
            setLocation: jasmine.createSpy(),
            setLocationChange: jasmine.createSpy()
        };


        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [NotificationsComponent],
            providers: [
                ServerlessSignalrHubConnectionService,
                BrowserModule,
                FeatureFlagService,
                HttpClient,
                RxService, EnterpriseService, LegacyLocationService,
                { provide: 'MicroServiceApiUrlConfig', useValue: mockMicroServiceApiUrlConfig },
                { provide: 'referenceDataService', useValue: mockReferenceDataService },
                { provide: 'locationService', useValue: mockLocalizeService },
                { provide: 'patSecurityService', useValue: mockpatSecurityService },
                { provide: 'LocationServices', useValue: mockLocationServices },
                { provide: MicroServiceApiService, useValue: mockMicroServiceApiService },
                {
                    provide: 'platformSessionCachingService',
                    useValue: mockplatformSessionCachingService,
                },
                { provide: 'practiceService', useValue: practiceService },
                { provide: 'SoarConfig', useValue: {} },
                { provide: 'toastrFactory', useValue: mockToastrFactory },
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: '$rootScope', useValue: mockRootScope },
                { provide: 'ReportsFactory', useValue: mockReportsFactory },
                { provide: 'UserRxFactory', useValue: userRxFactory },
                { provide: 'PersonServices', useValue: mockService },
                { provide: 'configSettingsService', useValue: configSettingsService },
                {
                    provide: 'UserServices',
                    useValue: mockUserServices
                },

            ]
        })
            .compileComponents();
    });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
