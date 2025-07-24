import { fakeAsync, TestBed } from '@angular/core/testing';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { fireEvent, render, screen } from '@testing-library/angular';
import { NotificationsComponent } from './notifications.component';
import { NotificationsService } from './notifications.service';
import { HttpClient } from '@angular/common/http';
import { MicroServiceApiService } from '../../../security/providers';
import { ServerlessSignalrHubConnectionService } from '../../providers/serverless-signalr-hub-connection.service';
import { RxService } from '../../../rx/common/providers/rx.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { UpgradeModule } from '@angular/upgrade/static';
import { AppToggleComponent } from '../form-controls/toggle/toggle.component';
import { SharedModule } from '@progress/kendo-angular-dialog';
import { AppLabelComponent } from '../form-controls/form-label/form-label.component';
import { EnterpriseService } from '../../providers/enterprise/enterprise.service';
import { LegacyLocationService } from '../../../@core/data-services/legacy-location.service';

export function injectorFactory() {
    const rootScopeMock = new $rootScopeMock();
    const rootElementMock = { on: () => undefined };
    return function $injectorGet(provider: string) {
        if (provider === '$rootScope') {
            return rootScopeMock;
        } else if (provider === '$rootElement') {
            return rootElementMock;
        } else {
            throw new Error(`Unsupported injectable mock: ${provider}`);
        }
    };
}

//Needed for $rootScope
export class $rootScopeMock {
    private watchers: any[] = [];
    private events: { [k: string]: any[] } = {};

    $watch(fn: any) {
        this.watchers.push(fn);
    }

    $broadcast(evt: string, ...args: any[]) {
        if (this.events[evt]) {
            this.events[evt].forEach(fn => {
                fn.apply(fn, [/** angular.IAngularEvent*/ {}, ...args]);
            });
        }
        return {
            defaultPrevented: false,
            preventDefault() {
                this.defaultPrevented = true;
            }
        };
    }

    $on(evt: string, fn: any) {
        if (!this.events[evt]) {
            this.events[evt] = [];
        }
        this.events[evt].push(fn);
    }

    $evalAsync(fn: any) {
        fn();
    }

    $digest() {
        this.watchers.forEach(fn => fn());
    }
}

describe('NotificationsComponent', () => {

    const mockpatSecurityService = jasmine.createSpyObj('patSecurityService', ['IsAuthorizedByAbbreviation']);
    const mockreferenceDataService = jasmine.createSpyObj('referenceDataService', ['get']);
    const mockNotificationsService = {
        getNotificationsList: jasmine.createSpy('NotificationsService'),
        locationChange$: new BehaviorSubject<[]>(null) as Observable<[]>,

    };
    const mockNotifications = [
        { id: 1, message: 'Test notification 1', title: '', targetUrl: '', notificationId: '', notificationReadStatus: '', notificationType: '', updatedDateTimeUTC: '', deliveryStatus: '' },
        { id: 2, message: 'Test notification 2', title: '', targetUrl: '', notificationId: '', notificationReadStatus: '', notificationType: '', updatedDateTimeUTC: '', deliveryStatus: '' }
    ];
    // Define the behavior of the getNotificationsList method
    mockNotificationsService.getNotificationsList.and.returnValue(of(mockNotifications));
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
    const mockRootScope = {
        patAuthContext: {
            userInfo: {
                userid: 'test'
            }
        }
    };

    let mockLocalizeService = jasmine.createSpyObj('LocalizeService', ['getLocalizedString']);
    mockLocalizeService.getLocalizedString.and.returnValue('translated text');

    let practiceService = {
        getCurrentPractice: jasmine.createSpy().and.returnValue({ id: '1' }),
    };
    let mockFeatureFlagService: jasmine.SpyObj<FeatureFlagService>;
    mockFeatureFlagService = jasmine.createSpyObj('FeatureFlagService', ['getOnce$']);
    mockFeatureFlagService.getOnce$.and.returnValue(of(true));

    let userContextSpy = jasmine
        .createSpy()
        .and.returnValue
        ({
            Result: { User: { UserId: 'testUserId' } }, Application: { ApplicationId: 2 }
        });
    const mockplatformSessionCachingService =
    {
        userContext: { get: userContextSpy },
    };

    let mockReportsFactory;
    mockReportsFactory = {
        GetReportArray: jasmine.createSpy('[17]'),
        OpenReportPage: jasmine.createSpy()
    };

    const mockUserRxFactory = {
        RxNotifications: jasmine.createSpy().and.returnValue({
            then: jasmine.createSpy().and.returnValue({}),
        }),
        NotificationFailed: jasmine.createSpy(),
        SetRxNotificationsTimer: jasmine.createSpy(),
        observeNotifications: jasmine.createSpy(),
        setLocation: jasmine.createSpy(),
        getLocation: jasmine.createSpy(),
        setLocationChange: jasmine.createSpy()
    };

    const mockSoarConfig = {
        fuseNotificationGatewayServiceUrl: 'https://localhost:35440',
    };

    let mockToastrFactory = {
        success: jasmine.createSpy('toastrFactory.success'),
        error: jasmine.createSpy('toastrFactory.error')
    };

    let mockLocationServices: jasmine.SpyObj<{
        getLocationSRHEnrollmentStatus: () => { $promise: Promise<{ Result: boolean; }> };
    }>;

    let mockUserServices = {
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

    let configSettingsService; 
    configSettingsService = {
        get: jasmine.createSpy().and.returnValue([]),
        entityNames: {
            practiceSettings: 'test',
        },
    };

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

    beforeEach(() => {

        TestBed.configureTestingModule({
            declarations: [NotificationsComponent, AppToggleComponent, AppLabelComponent],
            imports: [HttpClientTestingModule],
            providers: [
                MicroServiceApiService, FeatureFlagService, RxService, ServerlessSignalrHubConnectionService,
                HttpClient,
                NotificationsService,
                BrowserModule, SharedModule, UpgradeModule, EnterpriseService, LegacyLocationService,
                { provide: 'patSecurityService', useValue: mockpatSecurityService },
                { provide: 'referenceDataService', useValue: mockreferenceDataService },
                { provide: 'MicroServiceApiUrlConfig', useValue: mockMicroServiceApiUrlConfig },
                { provide: '$rootScope', useValue: mockRootScope },
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: 'locationService', useValue: mockLocalizeService },
                { provide: 'LocationServices', useValue: mockLocationServices },
                { provide: 'practiceService', useValue: practiceService },
                { provide: 'platformSessionCachingService', useValue: mockplatformSessionCachingService },
                { provide: 'ReportsFactory', useValue: mockReportsFactory },
                { provide: 'UserRxFactory', useValue: mockUserRxFactory },
                { provide: 'SoarConfig', useValue: mockSoarConfig },
                { provide: 'toastrFactory', useValue: mockToastrFactory },
                { provide: 'configSettingsService', useValue: configSettingsService },
                { provide: 'PersonServices', useValue: mockService },
                {
                    provide: 'UserServices',
                    useValue: mockUserServices
                },
            ]
        }).compileComponents();
    });

    it('should render the Notifications Component', async () => {
        render(NotificationsComponent, {
            componentProperties: {
                drawer: { isOpen: true }
            },
        });

    });

    it('should have Show Unread Only toggle button', async () => {
        const checkBoxStatus = screen.getByTestId('checkBoxStatus');
        expect(checkBoxStatus).toBeDefined();
    });

    it('should have notification list', async () => {
        const notificationList = screen.getByTestId('notificationList');
        expect(notificationList).toBeDefined();
    });

    it('should have recent list', async () => {
        const recentList = screen.getByTestId('recentList');
        expect(recentList).toBeDefined();
    });

    it('should have mark as read link button', async () => {
        const markAsRead = screen.getByTestId('markAllAsRead');
        expect(markAsRead).toBeDefined();
    });
});

